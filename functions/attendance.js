/* ============================================================
   ELA — functions/attendance.js
   ------------------------------------------------------------
   Phase 5 — Présence institutionnelle pour cours en direct.
   Collections : class_sessions, attendance_records, attendance_corrections
   Principes :
     - l'élève ne peut PAS créer une présence valide arbitrairement ;
       il rejoint une session OUVERTE et le serveur horodate l'entrée ;
     - le professeur valide ; toute correction est auditée ;
     - la présence n'est PAS un prérequis de certification sauf si le
       programme le déclare explicitement (voir academic-core.requirements).
   ============================================================ */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { callable } = require('./callable.js');
const admin = require('firebase-admin');
const authz = require('./authz.js');

const REGION = 'africa-south1';
const SESSIONS = 'class_sessions';
const ATTENDANCE = 'attendance_records';
const CORRECTIONS = 'attendance_corrections';
const DEFAULT_GRACE_MIN = 10;

function uidOf(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
  return uid;
}
function fail(code, msg) { throw new HttpsError(code, msg); }
async function requireStaff(uid) {
  const role = await authz.getUserRole(uid);
  if (role !== 'teacher' && role !== 'admin' && role !== 'system') fail('permission-denied', 'Staff only.');
  return role;
}

exports.scheduleClassSession = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await requireStaff(uid);
  const d = request.data || {};
  if (!d.title) fail('invalid-argument', 'title required.');
  if (!d.scheduledAt) fail('invalid-argument', 'scheduledAt required.');
  const session = {
    title: String(d.title).slice(0, 200),
    programmeId: d.programmeId || null,
    academyCode: String(d.academyCode || '').toUpperCase(),
    level: String(d.level || '').toUpperCase(),
    teacherUid: uid,
    scheduledAt: String(d.scheduledAt),
    durationMinutes: Number(d.durationMinutes) || 60,
    graceMinutes: Number(d.graceMinutes != null ? d.graceMinutes : DEFAULT_GRACE_MIN),
    meetingLink: d.meetingLink || null,
    status: 'scheduled',
    joinCode: null,
    startedAt: null,
    endedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: uid,
    createdRole: role
  };
  const ref = await admin.firestore().collection(SESSIONS).add(session);
  return { ok: true, sessionId: ref.id, session: session };
});

exports.startClassSession = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireStaff(uid);
  const sessionId = String((request.data && request.data.sessionId) || '');
  const ref = admin.firestore().collection(SESSIONS).doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Session not found.');
  const s = snap.data();
  const role = await authz.getUserRole(uid);
  if (s.teacherUid !== uid && role !== 'admin' && role !== 'system') fail('permission-denied', 'Not session owner.');
  if (s.status === 'live') return { ok: true, joinCode: s.joinCode, alreadyLive: true };
  if (s.status === 'ended') fail('failed-precondition', 'Session already ended.');
  const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  await ref.update({ status: 'live', joinCode: joinCode, startedAt: new Date().toISOString() });
  return { ok: true, joinCode: joinCode };
});

exports.joinClassSession = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const sessionId = String(d.sessionId || '');
  const ref = admin.firestore().collection(SESSIONS).doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Session not found.');
  const s = snap.data();
  if (s.status !== 'live') fail('failed-precondition', 'Session is not open.');
  if (s.joinCode && String(d.joinCode || '').toUpperCase() !== s.joinCode) fail('permission-denied', 'Invalid join code.');
  const now = new Date();
  const scheduled = new Date(s.scheduledAt);
  const grace = (Number(s.graceMinutes) || DEFAULT_GRACE_MIN) * 60000;
  const late = now.getTime() > (scheduled.getTime() + grace);
  const recordId = sessionId + '_' + uid;
  const recRef = admin.firestore().collection(ATTENDANCE).doc(recordId);
  const existing = await recRef.get();
  if (existing.exists) {
    if (existing.data().leftAt) {
      await recRef.update({ leftAt: null, updatedAt: now.toISOString() });
    }
    return { ok: true, attendanceId: recordId, already: true, status: existing.data().status };
  }
  const record = {
    sessionId: sessionId,
    studentId: uid,
    programmeId: s.programmeId || null,
    teacherUid: s.teacherUid,
    joinedAt: now.toISOString(),
    leftAt: null,
    durationMinutes: 0,
    status: late ? 'late' : 'present',
    late: late,
    validated: false,
    validatedBy: null,
    validatedAt: null,
    source: 'server',
    createdAt: now.toISOString()
  };
  await recRef.set(record);
  return { ok: true, attendanceId: recordId, status: record.status, late: late };
});

exports.leaveClassSession = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const sessionId = String((request.data && request.data.sessionId) || '');
  const recRef = admin.firestore().collection(ATTENDANCE).doc(sessionId + '_' + uid);
  const snap = await recRef.get();
  if (!snap.exists) fail('not-found', 'Attendance record not found.');
  const rec = snap.data();
  const now = new Date();
  const joined = new Date(rec.joinedAt);
  const duration = Math.max(0, Math.round((now.getTime() - joined.getTime()) / 60000));
  await recRef.update({ leftAt: now.toISOString(), durationMinutes: duration, updatedAt: now.toISOString() });
  return { ok: true, durationMinutes: duration };
});

exports.endClassSession = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireStaff(uid);
  const sessionId = String((request.data && request.data.sessionId) || '');
  const ref = admin.firestore().collection(SESSIONS).doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Session not found.');
  const role = await authz.getUserRole(uid);
  if (snap.data().teacherUid !== uid && role !== 'admin' && role !== 'system') fail('permission-denied', 'Not session owner.');
  await ref.update({ status: 'ended', endedAt: new Date().toISOString(), joinCode: null });
  return { ok: true };
});

exports.validateAttendance = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireStaff(uid);
  const sessionId = String((request.data && request.data.sessionId) || '');
  const studentId = String((request.data && request.data.studentId) || '');
  const recRef = admin.firestore().collection(ATTENDANCE).doc(sessionId + '_' + studentId);
  const snap = await recRef.get();
  if (!snap.exists) fail('not-found', 'Attendance record not found.');
  await recRef.update({ validated: true, validatedBy: uid, validatedAt: new Date().toISOString() });
  return { ok: true };
});

exports.correctAttendance = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireStaff(uid);
  const d = request.data || {};
  const sessionId = String(d.sessionId || '');
  const studentId = String(d.studentId || '');
  const newStatus = String(d.status || '');
  const reason = String(d.reason || '').trim();
  if (['present', 'late', 'absent', 'excused'].indexOf(newStatus) < 0) fail('invalid-argument', 'Invalid status.');
  if (reason.length < 3) fail('invalid-argument', 'A correction reason (>=3 chars) is required.');
  const recRef = admin.firestore().collection(ATTENDANCE).doc(sessionId + '_' + studentId);
  const snap = await recRef.get();
  if (!snap.exists) fail('not-found', 'Attendance record not found.');
  const previous = snap.data().status;
  await recRef.update({ status: newStatus, correctedBy: uid, correctedAt: new Date().toISOString(), correctionReason: reason });
  await admin.firestore().collection(CORRECTIONS).add({
    sessionId: sessionId, studentId: studentId, fromStatus: previous, toStatus: newStatus,
    reason: reason, actorUid: uid, at: new Date().toISOString()
  });
  return { ok: true, fromStatus: previous, toStatus: newStatus };
});

exports.getAttendanceReport = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const d = request.data || {};
  const sessionId = d.sessionId ? String(d.sessionId) : null;
  const studentId = d.studentId ? String(d.studentId) : null;
  const isStaff = role === 'teacher' || role === 'admin' || role === 'system';
  if (studentId && studentId !== uid && !isStaff) fail('permission-denied', 'Not authorized.');
  if (!sessionId && !studentId) fail('invalid-argument', 'sessionId or studentId required.');
  let q = admin.firestore().collection(ATTENDANCE);
  if (sessionId) q = q.where('sessionId', '==', sessionId);
  if (studentId) q = q.where('studentId', '==', studentId);
  if (!isStaff && !studentId) q = q.where('studentId', '==', uid);
  const snap = await q.limit(1000).get();
  const records = snap.docs.map((x) => x.data());
  const total = records.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  return {
    records: records,
    summary: { total: total, present: present, attendancePercent: total ? Math.round((present / total) * 100) : 0 }
  };
});

/* ---------- Listing des sessions (staff only, scoping propriétaire) ---------- */

exports.listClassSessions = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const isStaff = ['teacher', 'admin', 'system'].indexOf(role) >= 0;
  if (!isStaff) fail('permission-denied', 'Staff only.');

  const snap = await admin.firestore().collection(SESSIONS).limit(200).get();
  let sessions = snap.docs.map((x) => {
    const s = x.data() || {};
    return {
      id: x.id,
      title: s.title || '',
      academyCode: String(s.academyCode || '').toUpperCase(),
      level: String(s.level || '').toUpperCase(),
      programmeId: s.programmeId || null,
      teacherUid: s.teacherUid || null,
      scheduledAt: s.scheduledAt || null,
      status: s.status || 'scheduled',
      startedAt: s.startedAt || null,
      endedAt: s.endedAt || null,
      meetingLink: s.meetingLink || null,
      joinCode: s.joinCode || null
    };
  });

  // Un enseignant ne voit QUE ses propres sessions.
  if (role === 'teacher') sessions = sessions.filter((s) => s.teacherUid === uid);

  sessions.sort((a, b) => String(b.scheduledAt || '').localeCompare(String(a.scheduledAt || '')));
  return { sessions };
});

exports._collections = { SESSIONS, ATTENDANCE, CORRECTIONS };