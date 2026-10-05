/* ============================================================
   ELA — functions/academic.js
   ------------------------------------------------------------
   Cloud Functions du moteur académique (Phase 3).
   Toutes les écritures autoritatives sont serveur (Admin SDK).
   Collections :
     programmes, programme_versions, curriculum_nodes,
     enrollments, academic_events, academic_records
   ============================================================ */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { callable } = require('./callable.js');
const admin = require('firebase-admin');
const core = require('./academic-core.js');
const inst = require('./institution.js');
const authz = require('./authz.js');
const ratelimit = require('./ratelimit.js');
const framework = require('./academic-framework.js');
const publicationPolicy = require('./publication-policy.js');

const REGION = 'africa-south1';
const PROGRAMMES = 'programmes';
const VERSIONS = 'programme_versions';
const NODES = 'curriculum_nodes';
const ENROLLMENTS = 'enrollments';
const ACADEMIC_EVENTS = 'academic_events';
const ACADEMIC_RECORDS = 'academic_records';

function uidOf(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
  return uid;
}
function fail(code, msg) { throw new HttpsError(code, msg); }

async function requireAdmin(uid) {
  const role = await authz.getUserRole(uid);
  if (role !== 'admin' && role !== 'system') fail('permission-denied', 'Admin/system only.');
  return role;
}

async function appendAcademicEvent(evt) {
  try {
    await admin.firestore().collection(ACADEMIC_EVENTS).add(Object.assign({
      studentId: String(evt.studentId || ''),
      type: String(evt.type || ''),
      at: new Date().toISOString()
    }, evt));
  } catch (e) {
    console.error('[ELA-Academic] event write failed:', e.message);
  }
}

/* ---------- Programmes ---------- */

exports.createProgramme = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  if (!inst.isValidAcademy(d.academyCode)) fail('invalid-argument', 'Unknown academy.');
  if (!inst.isValidLevel(d.academyCode, d.level)) fail('invalid-argument', 'Invalid level for academy.');
  const a = inst.academy(d.academyCode);
  const prog = core.buildProgramme({
    academyCode: a.code, language: a.language, level: d.level,
    framework: a.framework, title: d.title, description: d.description, createdBy: uid,
    prerequisites: d.prerequisites
  });
  await admin.firestore().collection(PROGRAMMES).doc(prog.id).set(prog);
  return { ok: true, programme: prog };
});

exports.publishProgrammeVersion = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const progRef = admin.firestore().collection(PROGRAMMES).doc(String(d.programmeId || ''));
  const progSnap = await progRef.get();
  if (!progSnap.exists) fail('not-found', 'Programme not found.');

  // GARDE-FOU D'HONNÊTETÉ (identique à curriculum.js publishProgrammeContent) :
  // le serveur refuse toute publication d'un contenu non READY. Un client ne
  // peut pas forcer la publication d'un contenu DRAFT / REVIEW_REQUIRED / MISSING.
  const programmeId = String(d.programmeId);
  const fw = framework.buildFullFramework();
  const cur = fw.curricula.find((x) => x.programmeId === programmeId);
  const decision = publicationPolicy.canPublishContent(cur ? cur.contentState : 'MISSING');
  if (!decision.ok) {
    fail('failed-precondition', 'Curriculum content is ' + decision.state + '; only READY content may be published.');
  }

  const nextVersion = (Number(progSnap.data().currentVersion) || 0) + 1;
  const version = core.buildProgrammeVersion({
    programmeId: d.programmeId, version: nextVersion, status: 'published',
    title: d.title, outcomes: d.outcomes, requirements: d.requirements,
    nodes: d.nodes || [], createdBy: uid
  });
  const versionId = String(d.programmeId) + '_v' + nextVersion;
  const batch = admin.firestore().batch();
  batch.set(admin.firestore().collection(VERSIONS).doc(versionId), version);
  for (const n of version.nodes) {
    batch.set(admin.firestore().collection(NODES).doc(n.id), n);
  }
  batch.update(progRef, { currentVersion: nextVersion, status: 'published', updatedAt: new Date().toISOString() });
  await batch.commit();
  return { ok: true, versionId: versionId, version: version };
});

exports.getProgrammeCatalog = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const academy = request.data && request.data.academyCode ? String(request.data.academyCode).toUpperCase() : null;
  let q = admin.firestore().collection(PROGRAMMES).where('status', '==', 'published');
  if (academy) q = q.where('academyCode', '==', academy);
  const snap = await q.limit(200).get();
  return { programmes: snap.docs.map((d) => d.data()) };
});

exports.getProgramme = callable({ region: REGION }, async (request) => {
  uidOf(request);
  const d = request.data || {};
  const progSnap = await admin.firestore().collection(PROGRAMMES).doc(String(d.programmeId || '')).get();
  if (!progSnap.exists) fail('not-found', 'Programme not found.');
  const version = Number(d.version) || progSnap.data().currentVersion;
  const vSnap = await admin.firestore().collection(VERSIONS).doc(String(d.programmeId) + '_v' + version).get();
  return { programme: progSnap.data(), version: vSnap.exists ? vSnap.data() : null };
});

/* ---------- Enrollment ---------- */

exports.enrollStudent = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const d = request.data || {};
  const targetUid = String(d.studentId || uid);
  // Un élève ne peut s'inscrire que lui-même ; staff peut inscrire autrui.
  if (targetUid !== uid && role !== 'admin' && role !== 'system') fail('permission-denied', 'Cannot enroll another student.');
  const progSnap = await admin.firestore().collection(PROGRAMMES).doc(String(d.programmeId || '')).get();
  if (!progSnap.exists) fail('not-found', 'Programme not found.');
  const prog = progSnap.data();
  if (prog.status !== 'published') fail('failed-precondition', 'Programme not published.');
  // Prérequis : programmes terminés exigés avant l'inscription.
  const completedSnap = await admin.firestore().collection(ENROLLMENTS)
    .where('studentId', '==', targetUid).where('status', '==', 'completed').get();
  const completedIds = completedSnap.docs.map((x) => x.data().programmeId);
  const pre = core.evaluatePrerequisites(prog, completedIds);
  if (!pre.satisfied) fail('failed-precondition', 'Prerequisites not met: ' + pre.missing.join(','));
  const enrollment = core.buildEnrollment({
    studentId: targetUid, programmeId: prog.id, version: prog.currentVersion,
    academyCode: prog.academyCode, level: prog.level, enrolledBy: uid
  });
  const ref = admin.firestore().collection(ENROLLMENTS).doc(enrollment.id);
  const existing = await ref.get();
  if (existing.exists) return { ok: true, enrollment: existing.data(), alreadyEnrolled: true };
  await ref.set(Object.assign({}, enrollment, { completedNodeIds: [] }));
  await appendAcademicEvent({ studentId: targetUid, type: 'ENROLLED', programmeId: prog.id, version: prog.currentVersion, academyCode: prog.academyCode, level: prog.level, status: 'active' });
  return { ok: true, enrollment: enrollment, alreadyEnrolled: false };
});

/** Transition contrôlée du statut d'inscription (admin/system). */
exports.updateEnrollmentStatus = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const studentId = String(d.studentId || '');
  const programmeId = String(d.programmeId || '');
  const toStatus = String(d.status || '');
  if (!studentId || !programmeId) fail('invalid-argument', 'studentId and programmeId required.');
  const ref = admin.firestore().collection(ENROLLMENTS).doc(studentId + '_' + programmeId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Enrollment not found.');
  const fromStatus = snap.data().status || 'active';
  if (!core.canTransitionEnrollment(fromStatus, toStatus)) fail('failed-precondition', 'Invalid transition ' + fromStatus + '->' + toStatus);
  const patch = { status: toStatus, updatedAt: new Date().toISOString() };
  if (toStatus === 'completed') patch.completedAt = new Date().toISOString();
  await ref.update(patch);
  await appendAcademicEvent({ studentId: studentId, type: 'ENROLLMENT_STATUS', programmeId: programmeId, fromStatus: fromStatus, status: toStatus, by: uid });
  return { ok: true, fromStatus: fromStatus, toStatus: toStatus };
});

/** Ré-inscription (réactivation ou nouvelle version) — admin/system. */
exports.reEnrollStudent = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const studentId = String(d.studentId || '');
  const programmeId = String(d.programmeId || '');
  if (!studentId || !programmeId) fail('invalid-argument', 'studentId and programmeId required.');
  const progSnap = await admin.firestore().collection(PROGRAMMES).doc(programmeId).get();
  if (!progSnap.exists) fail('not-found', 'Programme not found.');
  const ref = admin.firestore().collection(ENROLLMENTS).doc(studentId + '_' + programmeId);
  const snap = await ref.get();
  if (snap.exists) {
    const fromStatus = snap.data().status || 'active';
    if (!core.canTransitionEnrollment(fromStatus, 'active')) fail('failed-precondition', 'Cannot re-enroll from ' + fromStatus);
    await ref.update({ status: 'active', version: progSnap.data().currentVersion, updatedAt: new Date().toISOString() });
  } else {
    const enrollment = core.buildEnrollment({ studentId: studentId, programmeId: programmeId, version: progSnap.data().currentVersion, academyCode: progSnap.data().academyCode, level: progSnap.data().level, enrolledBy: uid });
    await ref.set(Object.assign({}, enrollment, { completedNodeIds: [] }));
  }
  await appendAcademicEvent({ studentId: studentId, type: 'RE_ENROLLED', programmeId: programmeId, version: progSnap.data().currentVersion });
  return { ok: true };
});

exports.recordLessonCompletion = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  try { await ratelimit.requireWithinRateLimit('lesson:' + uid, 300, 60000); }
  catch (e) { fail('resource-exhausted', 'Too many completion events. Retry later.'); }
  const d = request.data || {};
  const programmeId = String(d.programmeId || '');
  const nodeId = String(d.nodeId || '');
  if (!programmeId || !nodeId) fail('invalid-argument', 'programmeId and nodeId required.');
  const enrollmentId = uid + '_' + programmeId;
  const ref = admin.firestore().collection(ENROLLMENTS).doc(enrollmentId);
  const snap = await ref.get();
  if (!snap.exists) fail('failed-precondition', 'Not enrolled in this programme.');
  if (snap.data().status !== 'active') fail('failed-precondition', 'Enrollment not active.');
  const nodeSnap = await admin.firestore().collection(NODES).doc(nodeId).get();
  if (!nodeSnap.exists) fail('not-found', 'Curriculum node not found.');
  if (nodeSnap.data().programmeId !== programmeId) fail('invalid-argument', 'Node does not belong to programme.');
  const done = (snap.data().completedNodeIds || []).map(String);
  const already = done.indexOf(nodeId) >= 0;
  if (!already) {
    await ref.update({ completedNodeIds: admin.firestore.FieldValue.arrayUnion(nodeId), updatedAt: new Date().toISOString() });
    await appendAcademicEvent({ studentId: uid, type: 'LESSON_COMPLETED', programmeId: programmeId, nodeId: nodeId });
  }
  return { ok: true, alreadyCompleted: already };
});

/* ---------- Academic records / transcript ---------- */

async function loadAcademicEvents(studentId) {
  const snap = await admin.firestore().collection(ACADEMIC_EVENTS)
    .where('studentId', '==', String(studentId)).limit(2000).get();
  return snap.docs.map((d) => d.data()).sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

exports.getAcademicRecord = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const targetUid = String((request.data && request.data.studentId) || uid);
  if (targetUid !== uid && role !== 'admin' && role !== 'teacher' && role !== 'examiner' && role !== 'system') {
    fail('permission-denied', 'Not authorized for this academic record.');
  }
  const events = await loadAcademicEvents(targetUid);
  const record = core.buildAcademicRecord(targetUid, events);
  const certSnap = await admin.firestore().collection('ela_certificates').where('studentId', '==', targetUid).limit(200).get();
  const certificates = certSnap.docs.map((d) => d.data());
  // Progression par inscription (calculée, jamais stockée comme fait autoritatif).
  const progressByProgramme = {};
  for (const enr of record.enrollments) {
    const vSnap = await admin.firestore().collection(VERSIONS).doc(enr.programmeId + '_v' + enr.version).get();
    const completed = record.lessonCompletions.filter((l) => l.programmeId === enr.programmeId).map((l) => l.nodeId);
    progressByProgramme[enr.programmeId] = core.computeProgression(completed, vSnap.exists ? vSnap.data() : { nodes: [] });
  }
  record.progression = progressByProgramme;
  return { record: record, certificates: certificates.map((c) => ({ id: c.id, status: c.status, cecrLevel: c.cecrLevel, academyCode: c.academyCode, issueDate: c.issueDate })) };
});

exports.generateTranscript = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const targetUid = String((request.data && request.data.studentId) || uid);
  if (targetUid !== uid && role !== 'admin' && role !== 'system') fail('permission-denied', 'Transcript available to owner or admin.');
  const events = await loadAcademicEvents(targetUid);
  const record = core.buildAcademicRecord(targetUid, events);
  const certSnap = await admin.firestore().collection('ela_certificates').where('studentId', '==', targetUid).limit(200).get();
  const transcript = core.buildTranscript(record, certSnap.docs.map((d) => d.data()));
  await appendAcademicEvent({ studentId: targetUid, type: 'TRANSCRIPT_GENERATED', requestedBy: uid });
  return { transcript: transcript };
});

/* ---------- Seed catalogue (admin) ----------
   Crée des programmes DRAFT pour les six académies. Le contenu
   pédagogique n'est PAS inventé : les nœuds restent en état DRAFT /
   MISSING tant qu'un contenu académique réel n'est pas fourni. */
exports.seedProgrammeCatalog = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const created = [];
  for (const code of inst.ACADEMY_CODES) {
    const a = inst.academy(code);
    for (const level of a.levels) {
      const pid = 'prog_' + code + '_' + level;
      const ref = admin.firestore().collection(PROGRAMMES).doc(pid);
      const snap = await ref.get();
      if (snap.exists) { created.push(pid); continue; }
      const prog = core.buildProgramme({
        id: pid, academyCode: code, language: a.language, level: level,
        framework: a.framework, title: a.language + ' ' + level + ' Programme',
        description: 'Institutional programme outline. Academic content state: MISSING until reviewed.',
        createdBy: uid
      });
      await ref.set(prog);
      created.push(pid);
    }
  }
  return { ok: true, count: created.length, programmes: created };
});

exports._collections = { PROGRAMMES, VERSIONS, NODES, ENROLLMENTS, ACADEMIC_EVENTS, ACADEMIC_RECORDS };
