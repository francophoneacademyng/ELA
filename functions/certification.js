/* ============================================================
   ELA — functions/certification.js
   ------------------------------------------------------------
   Phase 7 — Certification institutionnelle adossée à des faits
   académiques AUTORITATIFS.
   Chaîne :
     Enrollment → progression → assessments requis → attendance
     (si requis) → examen final 4 aptitudes → validation examinateur
     → éligibilité → grant → émission du certificat.
   Aucune émission ne peut reposer sur un score fourni par le client.
   ============================================================ */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { callable } = require('./callable.js');
const admin = require('firebase-admin');
const acad = require('./academic-core.js');
const core = require('./ela-certificate-core.js');
const inst = require('./institution.js');
const authz = require('./authz.js');
const ratelimit = require('./ratelimit.js');

const REGION = 'africa-south1';

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

/** Rassemble les faits autoritatifs pour un candidat + programme + examen. */
async function gatherFacts(db, studentId, programmeId, examinationId) {
  const programmeSnap = await db.collection('programmes').doc(programmeId).get();
  if (!programmeSnap.exists) throw new Error('programme-not-found');
  const programme = programmeSnap.data();
  const vSnap = await db.collection('programme_versions').doc(programmeId + '_v' + programme.currentVersion).get();
  const version = vSnap.exists ? vSnap.data() : { nodes: [], requirements: {} };
  const enrSnap = await db.collection('enrollments').doc(studentId + '_' + programmeId).get();
  const enrollment = enrSnap.exists ? enrSnap.data() : null;

  const completedNodeIds = enrollment ? (enrollment.completedNodeIds || []) : [];
  const progress = acad.computeProgression(completedNodeIds, version);

  // Assessments requis : results autoritatifs du candidat.
  const resultsSnap = await db.collection('results').where('studentId', '==', studentId).limit(500).get();
  const assessments = {};
  for (const d of resultsSnap.docs) {
    const r = d.data();
    if (r.source !== 'authoritative') continue;
    assessments[r.quizId || d.id] = { passed: !!r.passed, score: r.percentage || 0 };
    assessments[d.id] = { passed: !!r.passed, score: r.percentage || 0 };
  }

  // Attendance (si le programme l'exige).
  let attendancePercent = null;
  const attSnap = await db.collection('attendance_records')
    .where('studentId', '==', studentId).limit(1000).get();
  const att = attSnap.docs.map((x) => x.data()).filter((a) => !a.programmeId || a.programmeId === programmeId);
  if (att.length) {
    const present = att.filter((a) => a.status === 'present' || a.status === 'late').length;
    attendancePercent = Math.round((present / att.length) * 100);
  }

  // Examen final.
  let examinationResult = null;
  if (examinationId) {
    const exSnap = await db.collection('exam_results')
      .where('examinationId', '==', examinationId)
      .where('candidateUid', '==', studentId).limit(1).get();
    if (!exSnap.empty) {
      const r = exSnap.docs[0].data();
      examinationResult = { finalized: !!r.finalized, passed: !!r.passed, skills: r.skills || {}, score: r.score || 0, moderationStatus: r.moderationStatus || null };
    }
  }

  const examinerValidated = !!(examinationResult && (examinationResult.moderationStatus === 'confirmed' || examinationResult.moderationStatus === 'not-required'));
  return { programme, version, enrollment, progress, assessments, attendancePercent, examinationResult, examinerValidated };
}

exports.evaluateCertificationEligibility = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const d = request.data || {};
  const studentId = String(d.studentId || uid);
  if (studentId !== uid && role !== 'admin' && role !== 'system') fail('permission-denied', 'Not authorized.');
  const programmeId = String(d.programmeId || '');
  if (!programmeId) fail('invalid-argument', 'programmeId required.');
  let facts;
  try { facts = await gatherFacts(admin.firestore(), studentId, programmeId, d.examinationId ? String(d.examinationId) : null); }
  catch (e) { fail('failed-precondition', e.message); }
  const eligibility = acad.evaluateCertificationEligibility({
    programme: facts.programme, version: facts.version, progress: facts.progress,
    assessments: facts.assessments, attendancePercent: facts.attendancePercent,
    examinationResult: facts.examinationResult, examinerValidated: facts.examinerValidated
  });
  return { eligible: eligibility.eligible, checks: eligibility.checks, reasons: eligibility.reasons };
});

exports.issueCertificateFromAcademicRecord = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  try { await ratelimit.requireWithinRateLimit('cert-issue:' + uid, 20, 60000); }
  catch (e) { fail('resource-exhausted', 'Too many certificate issuance requests. Retry later.'); }
  const d = request.data || {};
  const studentId = String(d.studentId || '');
  const programmeId = String(d.programmeId || '');
  const examinationId = d.examinationId ? String(d.examinationId) : null;
  if (!studentId || !programmeId) fail('invalid-argument', 'studentId and programmeId required.');

  const db = admin.firestore();
  let facts;
  try { facts = await gatherFacts(db, studentId, programmeId, examinationId); }
  catch (e) { fail('failed-precondition', e.message); }

  const eligibility = acad.evaluateCertificationEligibility({
    programme: facts.programme, version: facts.version, progress: facts.progress,
    assessments: facts.assessments, attendancePercent: facts.attendancePercent,
    examinationResult: facts.examinationResult, examinerValidated: facts.examinerValidated
  });
  if (!eligibility.eligible) fail('failed-precondition', 'Not eligible: ' + eligibility.reasons.join(','));

  // Idempotence : un seul certificat actif par (student, programme, exam).
  const grantId = 'cert_' + studentId + '_' + programmeId + (examinationId ? '_' + examinationId : '');
  const grantRef = db.collection('certificate_grants').doc(grantId);
  const grantSnap = await grantRef.get();
  if (grantSnap.exists) {
    return { ok: true, created: false, certificateId: grantSnap.data().certificateId, reason: 'already-issued' };
  }

  const prog = facts.programme;
  const userSnap = await db.collection('users').doc(studentId).get();
  const studentName = (userSnap.exists && userSnap.data().displayName) ? String(userSnap.data().displayName).slice(0, 160) : 'Student';
  const examScore = facts.examinationResult ? facts.examinationResult.score : (facts.progress.lessonPercent || 0);

  const cert = core.buildCertificateRecord({
    academyCode: prog.academyCode,
    cecrLevel: inst.levelToCefr(prog.academyCode, prog.level),
    certificateType: 'certification',
    studentId: studentId,
    studentName: studentName,
    score: examScore,
    skills: facts.examinationResult ? facts.examinationResult.skills : {},
    language: prog.language,
    createdBy: uid,
    sourceAttemptId: null,
    sourceResultId: examinationId || null,
    programmeId: programmeId,
    examinationId: examinationId,
    schemaVersion: 3 // nouveau modèle institutionnel (authenticité HMAC)
  });

  await db.collection('ela_certificates').doc(cert.id).set(cert);
  await grantRef.set({
    attemptId: grantId, studentId: studentId, certificateId: cert.id,
    programmeId: programmeId, examinationId: examinationId,
    createdAt: new Date().toISOString()
  });
  await core.appendEvent({
    certificateId: cert.id, action: 'ISSUED', performedBy: uid, academyCode: cert.academyCode,
    metadata: { programmeId: programmeId, examinationId: examinationId, source: 'academic-record', authenticity: cert.authenticity }
  });
  try {
    await db.collection('academic_events').add({
      studentId: studentId, type: 'CERTIFICATE_ISSUED', certificateId: cert.id,
      programmeId: programmeId, level: cert.cecrLevel, status: 'active', at: new Date().toISOString()
    });
  } catch (e) { /* audit best-effort */ }

  return { ok: true, created: true, certificateId: cert.id, authenticity: cert.authenticity };
});

exports._gatherFacts = gatherFacts;
