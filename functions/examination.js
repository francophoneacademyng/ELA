/* ============================================================
   ELA — functions/examination.js
   ------------------------------------------------------------
   Phase 6 — Moteur d'examen final de certification (4 aptitudes).
   Distingue explicitement :
     FORMATIVE QUIZ (assessment.js) ≠ EXAMEN DE CERTIFICATION.
   Collections :
     examinations, examination_versions, exam_registrations,
     exam_attempts, exam_submissions, exam_results,
     examiner_assignments, moderation_events
   Sécurité :
     - les corrigés objectifs (answer keys) ne quittent JAMAIS le serveur ;
     - writing/speaking sont notés par un examinateur autorisé via rubrique ;
     - un résultat finalisé est immuable ; toute correction passe par la
       modération (auditée).
   ============================================================ */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { callable } = require('./callable.js');
const admin = require('firebase-admin');
const inst = require('./institution.js');
const authz = require('./authz.js');
const ratelimit = require('./ratelimit.js');
const academyScope = require('./academy-scope.js');

const REGION = 'africa-south1';
const EXAMS = 'examinations';
const EXAM_VERSIONS = 'examination_versions';
const REGISTRATIONS = 'exam_registrations';
const ATTEMPTS = 'exam_attempts';
const SUBMISSIONS = 'exam_submissions';
const RESULTS = 'exam_results';
const ASSIGNMENTS = 'examiner_assignments';
const MODERATION = 'moderation_events';

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
async function requireExaminer(uid) {
  const snap = await admin.firestore().collection('examiner_authorizations').doc(uid).get();
  const role = await authz.getUserRole(uid);
  const isAdmin = role === 'admin' || role === 'system';
  if (!isAdmin && !(snap.exists && snap.data().authorized === true)) fail('permission-denied', 'Examiner authorization required.');
  return snap.exists ? snap.data() : { skills: inst.EXAM_SKILLS, academies: [] };
}

/* ---------- Examination definitions ---------- */

exports.createExamination = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  if (!d.title) fail('invalid-argument', 'title required.');
  if (!inst.isValidAcademy(d.academyCode)) fail('invalid-argument', 'Unknown academy.');
  if (!inst.isValidLevel(d.academyCode, d.level)) fail('invalid-argument', 'Invalid level.');
  const exam = {
    title: String(d.title).slice(0, 200),
    academyCode: String(d.academyCode).toUpperCase(),
    level: String(d.level).toUpperCase(),
    programmeId: d.programmeId || null,
    status: 'draft',
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    createdBy: uid
  };
  const ref = await admin.firestore().collection(EXAMS).add(exam);
  return { ok: true, examinationId: ref.id };
});

exports.publishExaminationVersion = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const examId = String(d.examinationId || '');
  const examRef = admin.firestore().collection(EXAMS).doc(examId);
  const examSnap = await examRef.get();
  if (!examSnap.exists) fail('not-found', 'Examination not found.');
  const sections = Array.isArray(d.sections) ? d.sections : [];
  if (!sections.length) fail('invalid-argument', 'At least one section required.');
  for (const s of sections) {
    if (inst.EXAM_SKILLS.indexOf(String(s.skill)) < 0) fail('invalid-argument', 'Invalid skill: ' + s.skill);
  }
  const nextVersion = (Number(examSnap.data().currentVersion) || 0) + 1;
  const version = {
    examinationId: examId,
    version: nextVersion,
    status: 'published',
    durationMinutes: Number(d.durationMinutes) || 120,
    windowStart: d.windowStart || null,
    windowEnd: d.windowEnd || null,
    passMark: Number(d.passMark) || 60,
    retakePolicy: {
      allowed: !!(d.retakePolicy && d.retakePolicy.allowed),
      // Aligné sur le blueprint (academic-framework.buildExaminationBlueprint) :
      // retakeRules { allowed: true, maxAttempts: 2, cooldownDays: 30 }.
      maxAttempts: Number(d.retakePolicy && d.retakePolicy.maxAttempts) || 2,
      cooldownDays: Number(d.retakePolicy && d.retakePolicy.cooldownDays) || 30
    },
    moderationRequired: d.moderationRequired !== false,
    sections: sections.map((s) => ({
      id: String(s.id || (s.skill + '-1')),
      skill: String(s.skill),
      type: s.type === 'subjective' ? 'subjective' : 'objective',
      weight: Number(s.weight) || 25,
      // Minimum par compétence = 50 (blueprint allSkillsMinimum: 50),
      // distinct du pass mark global (60).
      passMark: Number(s.passMark) || 50,
      rubric: s.type === 'subjective' ? (s.rubric || []) : [],
      // Answer keys: SERVER ONLY (never returned to client).
      questions: s.type === 'subjective' ? [] : (s.questions || []).map((q) => ({ id: String(q.id), correctIndex: Number(q.correctIndex) }))
    })),
    createdBy: uid,
    createdAt: new Date().toISOString()
  };
  const versionId = examId + '_v' + nextVersion;
  await admin.firestore().collection(EXAM_VERSIONS).doc(versionId).set(version);
  await examRef.update({ currentVersion: nextVersion, status: 'published', updatedAt: new Date().toISOString() });
  // Version publique SANS corrigés, pour le client.
  return { ok: true, versionId: versionId, publicVersion: publicExamVersion(version) };
});

function publicExamVersion(v) {
  return {
    examinationId: v.examinationId, version: v.version, durationMinutes: v.durationMinutes,
    passMark: v.passMark, windowStart: v.windowStart, windowEnd: v.windowEnd,
    retakePolicy: v.retakePolicy, moderationRequired: v.moderationRequired,
    sections: (v.sections || []).map((s) => ({
      id: s.id, skill: s.skill, type: s.type, weight: s.weight, passMark: s.passMark,
      rubric: s.rubric || [],
      questions: (s.questions || []).map((q) => ({ id: q.id })) // no correctIndex
    }))
  };
}

exports.getExamination = callable({ region: REGION }, async (request) => {
  uidOf(request);
  const d = request.data || {};
  const examId = String(d.examinationId || '');
  const examSnap = await admin.firestore().collection(EXAMS).doc(examId).get();
  if (!examSnap.exists) fail('not-found', 'Examination not found.');
  const version = Number(d.version) || examSnap.data().currentVersion;
  const vSnap = await admin.firestore().collection(EXAM_VERSIONS).doc(examId + '_v' + version).get();
  return { examination: examSnap.data(), version: vSnap.exists ? publicExamVersion(vSnap.data()) : null };
});

/* ---------- Listing (staff only, academy-scoped pour les teachers) ---------- */

exports.listExaminations = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const isStaff = ['teacher', 'examiner', 'admin', 'system'].indexOf(role) >= 0;
  if (!isStaff) fail('permission-denied', 'Staff only.');

  const snap = await admin.firestore().collection(EXAMS).limit(200).get();
  let exams = snap.docs.map((x) => {
    const v = x.data() || {};
    return {
      id: x.id,
      title: v.title || '',
      academyCode: String(v.academyCode || '').toUpperCase(),
      level: String(v.level || '').toUpperCase(),
      programmeId: v.programmeId || null,
      status: v.status || 'draft',
      currentVersion: Number(v.currentVersion) || 0,
      createdAt: v.createdAt || null
    };
  });

  // Un enseignant ne voit QUE les examens de SA académie.
  if (role === 'teacher') {
    const callerSnap = await admin.firestore().collection('users').doc(uid).get();
    const callerAcademy = callerSnap.exists ? academyScope.normalizeAcademyKey(callerSnap.data().academy) : null;
    exams = exams.filter((e) => callerAcademy && e.academyCode === callerAcademy);
  }

  exams.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return { examinations: exams };
});

/* ---------- Registration & attempts ---------- */

exports.registerExaminationCandidate = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const d = request.data || {};
  const candidateUid = String(d.candidateUid || uid);
  if (candidateUid !== uid && role !== 'admin' && role !== 'system' && role !== 'teacher') fail('permission-denied', 'Not authorized.');
  const examId = String(d.examinationId || '');
  const examSnap = await admin.firestore().collection(EXAMS).doc(examId).get();
  if (!examSnap.exists) fail('not-found', 'Examination not found.');
  const regId = examId + '_' + candidateUid;
  const ref = admin.firestore().collection(REGISTRATIONS).doc(regId);
  const existing = await ref.get();
  if (existing.exists) return { ok: true, registrationId: regId, already: true };
  const reg = {
    examinationId: examId, candidateUid: candidateUid, programmeId: examSnap.data().programmeId || null,
    status: 'registered', registeredAt: new Date().toISOString(), registeredBy: uid
  };
  await ref.set(reg);
  return { ok: true, registrationId: regId, registration: reg };
});

exports.startExaminationAttempt = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const examId = String((request.data && request.data.examinationId) || '');
  const examSnap = await admin.firestore().collection(EXAMS).doc(examId).get();
  if (!examSnap.exists) fail('not-found', 'Examination not found.');
  const exam = examSnap.data();
  const versionId = examId + '_v' + exam.currentVersion;
  const vSnap = await admin.firestore().collection(EXAM_VERSIONS).doc(versionId).get();
  if (!vSnap.exists) fail('failed-precondition', 'Examination version unavailable.');
  const version = vSnap.data();
  const regSnap = await admin.firestore().collection(REGISTRATIONS).doc(examId + '_' + uid).get();
  if (!regSnap.exists) fail('failed-precondition', 'Candidate not registered.');
  // Fenêtre d'examen
  const now = Date.now();
  if (version.windowStart && now < new Date(version.windowStart).getTime()) fail('failed-precondition', 'Examination window not open.');
  if (version.windowEnd && now > new Date(version.windowEnd).getTime()) fail('failed-precondition', 'Examination window closed.');
  // Anti-replay / retake policy
  const attemptsSnap = await admin.firestore().collection(ATTEMPTS)
    .where('examinationId', '==', examId).where('candidateUid', '==', uid).get();
  const attempts = attemptsSnap.docs.map((x) => x.data());
  const finalized = attempts.filter((a) => a.status === 'finalized');
  if (finalized.length && !(version.retakePolicy && version.retakePolicy.allowed)) fail('failed-precondition', 'No retake allowed.');
  if (attempts.length >= ((version.retakePolicy && version.retakePolicy.maxAttempts) || 2)) fail('failed-precondition', 'Maximum attempts reached.');
  const active = attempts.filter((a) => a.status === 'in_progress');
  if (active.length) return { ok: true, attemptId: active[0].id, resumed: true, expiresAt: active[0].expiresAt };
  const attemptNumber = attempts.length + 1;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + version.durationMinutes * 60000);
  const attemptRef = admin.firestore().collection(ATTEMPTS).doc();
  const attempt = {
    id: attemptRef.id,
    examinationId: examId, version: version.version, candidateUid: uid,
    attemptNumber: attemptNumber,
    status: 'in_progress',
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    submittedSections: [],
    createdAt: startedAt.toISOString()
  };
  await attemptRef.set(attempt);
  await admin.firestore().collection(REGISTRATIONS).doc(examId + '_' + uid).set({ status: 'attempting' }, { merge: true });
  return { ok: true, attemptId: attemptRef.id, attempt: attempt, version: publicExamVersion(version) };
});

/* ---------- Section submission & scoring ---------- */

exports.submitExaminationSection = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  try { await ratelimit.requireWithinRateLimit('exam-submit:' + uid, 120, 60000); }
  catch (e) { fail('resource-exhausted', 'Too many submissions. Retry later.'); }
  const d = request.data || {};
  const attemptId = String(d.attemptId || '');
  const sectionId = String(d.sectionId || '');
  const attemptRef = admin.firestore().collection(ATTEMPTS).doc(attemptId);
  const aSnap = await attemptRef.get();
  if (!aSnap.exists) fail('not-found', 'Attempt not found.');
  const attempt = aSnap.data();
  if (attempt.candidateUid !== uid) fail('permission-denied', 'Not your attempt.');
  if (attempt.status !== 'in_progress') fail('failed-precondition', 'Attempt not in progress.');
  if (new Date(attempt.expiresAt).getTime() < Date.now() - 60000) fail('deadline-exceeded', 'Attempt time expired.');
  const vSnap = await admin.firestore().collection(EXAM_VERSIONS).doc(attempt.examinationId + '_v' + attempt.version).get();
  const version = vSnap.data();
  const section = (version.sections || []).filter((s) => s.id === sectionId)[0];
  if (!section) fail('not-found', 'Section not found.');
  const subRef = admin.firestore().collection(SUBMISSIONS).doc(attemptId + '_' + sectionId);
  const existing = await subRef.get();
  if (existing.exists) fail('already-exists', 'Section already submitted.');

  let submission;
  if (section.type === 'objective') {
    const answers = Array.isArray(d.answers) ? d.answers : [];
    const keyById = {};
    for (const q of (section.questions || [])) keyById[q.id] = q.correctIndex;
    let correct = 0;
    for (const ans of answers) {
      if (keyById[ans.questionId] !== undefined && Number(ans.index) === Number(keyById[ans.questionId])) correct++;
    }
    const total = (section.questions || []).length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    submission = {
      attemptId: attemptId, examinationId: attempt.examinationId, version: attempt.version,
      candidateUid: uid, sectionId: sectionId, skill: section.skill, type: 'objective',
      answers: answers, correct: correct, total: total, percent: percent,
      passed: percent >= (section.passMark || 60),
      graded: true, gradedBy: 'server', submittedAt: new Date().toISOString()
    };
  } else {
    if (!d.response || String(d.response).trim().length < 1) fail('invalid-argument', 'Response required.');
    submission = {
      attemptId: attemptId, examinationId: attempt.examinationId, version: attempt.version,
      candidateUid: uid, sectionId: sectionId, skill: section.skill, type: 'subjective',
      response: String(d.response).slice(0, 20000),
      mediaUrl: d.mediaUrl || null,
      rubricScores: null, percent: null, passed: false,
      graded: false, gradedBy: null, submittedAt: new Date().toISOString(),
      finalized: false
    };
  }
  await subRef.set(submission);
  await attemptRef.update({ submittedSections: admin.firestore.FieldValue.arrayUnion(sectionId) });
  return { ok: true, submission: submission, autoGraded: section.type === 'objective' };
});

/* ---------- Examiner assignment & grading ---------- */

exports.assignExaminer = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const examinationId = String(d.examinationId || '');
  const examinerUid = String(d.examinerUid || '');
  const skills = Array.isArray(d.skills) ? d.skills.filter((s) => inst.EXAM_SKILLS.indexOf(s) >= 0) : [];
  if (!examinationId || !examinerUid || !skills.length) fail('invalid-argument', 'examinationId, examinerUid and skills required.');
  const auth = await requireExaminer(examinerUid);
  const notAuthorized = skills.filter((s) => (auth.skills || []).indexOf(s) < 0);
  if (notAuthorized.length && !(auth.skills || []).includes('*')) fail('failed-precondition', 'Examiner not authorized for: ' + notAuthorized.join(','));
  const assignment = { examinationId: examinationId, examinerUid: examinerUid, skills: skills, assignedBy: uid, assignedAt: new Date().toISOString(), active: true };
  await admin.firestore().collection(ASSIGNMENTS).add(assignment);
  return { ok: true, assignment: assignment };
});

exports.getExaminationQueue = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const auth = await requireExaminer(uid);
  const snap = await admin.firestore().collection(SUBMISSIONS).where('graded', '==', false).limit(200).get();
  const mine = snap.docs.map((x) => x.data()).filter((s) => (auth.skills || []).indexOf(s.skill) >= 0);

  // Enrichit chaque copie avec l'examen/version/rubrique nécessaires au
  // formulaire de notation (aucun corrigé d'objectif n'est exposé).
  const versionsCache = {};
  const queue = [];
  for (const s of mine) {
    const key = String(s.examinationId || '') + '_v' + String(s.version || '');
    let rubric = [];
    if (!versionsCache[key]) {
      try {
        const vSnap = await admin.firestore().collection(EXAM_VERSIONS).doc(key).get();
        versionsCache[key] = vSnap.exists ? vSnap.data() : null;
      } catch (e) { versionsCache[key] = null; }
    }
    const version = versionsCache[key];
    if (version) {
      const section = (version.sections || []).filter((x) => x.id === s.sectionId)[0] || {};
      rubric = Array.isArray(section.rubric) ? section.rubric : [];
    }
    queue.push({
      attemptId: s.attemptId,
      sectionId: s.sectionId,
      skill: s.skill,
      candidateUid: s.candidateUid,
      examinationId: s.examinationId || null,
      version: s.version || null,
      response: s.response || null,
      rubric: rubric,
      submittedAt: s.submittedAt
    });
  }
  return { queue };
});

exports.gradeExaminationSection = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const auth = await requireExaminer(uid);
  const d = request.data || {};
  const attemptId = String(d.attemptId || '');
  const sectionId = String(d.sectionId || '');
  const rubricScores = Array.isArray(d.rubricScores) ? d.rubricScores : [];
  const comments = String(d.comments || '');
  const subRef = admin.firestore().collection(SUBMISSIONS).doc(attemptId + '_' + sectionId);
  const snap = await subRef.get();
  if (!snap.exists) fail('not-found', 'Submission not found.');
  const sub = snap.data();
  if (sub.finalized) fail('failed-precondition', 'Submission already finalized.');
  if ((auth.skills || []).indexOf(sub.skill) < 0) fail('permission-denied', 'Not authorized for skill: ' + sub.skill);
  const vSnap = await admin.firestore().collection(EXAM_VERSIONS).doc(sub.examinationId + '_v' + sub.version).get();
  const section = (vSnap.data().sections || []).filter((s) => s.id === sectionId)[0] || {};
  const maxTotal = (section.rubric || []).reduce((a, r) => a + (Number(r.max) || 0), 0) || 100;
  const obtained = rubricScores.reduce((a, r) => a + (Number(r.score) || 0), 0);
  const percent = maxTotal ? Math.round((obtained / maxTotal) * 100) : 0;
  await subRef.update({
    rubricScores: rubricScores, comments: comments, examinerUid: uid,
    percent: percent, passed: percent >= (section.passMark || 60),
    graded: true, gradedBy: uid, gradedAt: new Date().toISOString()
  });
  return { ok: true, percent: percent, passed: percent >= (section.passMark || 60) };
});

/* ---------- Moderation & finalization ---------- */

exports.moderateExaminationResult = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const attemptId = String(d.attemptId || '');
  const resultRef = admin.firestore().collection(RESULTS).doc(attemptId);
  const snap = await resultRef.get();
  if (!snap.exists) fail('not-found', 'Result not found.');
  if (snap.data().finalized) fail('failed-precondition', 'Result already finalized; use correction workflow.');
  await admin.firestore().collection(MODERATION).add({
    attemptId: attemptId, actorUid: uid, decision: String(d.decision || 'reviewed'),
    notes: String(d.notes || ''), at: new Date().toISOString()
  });
  await resultRef.update({ moderationStatus: String(d.decision || 'reviewed'), moderatedBy: uid, moderatedAt: new Date().toISOString() });
  return { ok: true };
});

exports.finalizeExaminationResult = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  try { await ratelimit.requireWithinRateLimit('exam-finalize:' + uid, 60, 60000); }
  catch (e) { fail('resource-exhausted', 'Too many finalization requests. Retry later.'); }
  const auth = await requireExaminer(uid);
  const role = await authz.getUserRole(uid);
  const d = request.data || {};
  const attemptId = String(d.attemptId || '');
  const attemptRef = admin.firestore().collection(ATTEMPTS).doc(attemptId);
  const aSnap = await attemptRef.get();
  if (!aSnap.exists) fail('not-found', 'Attempt not found.');
  const attempt = aSnap.data();
  const vSnap = await admin.firestore().collection(EXAM_VERSIONS).doc(attempt.examinationId + '_v' + attempt.version).get();
  const version = vSnap.data();
  const subsSnap = await admin.firestore().collection(SUBMISSIONS).where('attemptId', '==', attemptId).get();
  const subs = subsSnap.docs.map((x) => x.data());
  if (subs.some((s) => !s.graded)) fail('failed-precondition', 'All sections must be graded before finalization.');
  const skills = {};
  let weighted = 0, weightSum = 0;
  for (const s of (version.sections || [])) {
    const sub = subs.filter((x) => x.sectionId === s.id)[0];
    if (!sub) fail('failed-precondition', 'Missing submission for section ' + s.id);
    skills[s.skill] = { score: sub.percent, passed: !!sub.passed, sectionId: s.id };
    weighted += (sub.percent || 0) * (Number(s.weight) || 0);
    weightSum += (Number(s.weight) || 0);
  }
  const totalPercent = weightSum ? Math.round(weighted / weightSum) : 0;
  const allSkillsPassed = Object.keys(skills).every((k) => skills[k].passed);
  const passed = allSkillsPassed && totalPercent >= (version.passMark || 60);
  const moderationOk = !version.moderationRequired || (d.moderationConfirmed === true && (role === 'admin' || role === 'system'));
  const resultRef = admin.firestore().collection(RESULTS).doc(attemptId);
  const existing = await resultRef.get();
  if (existing.exists && existing.data().finalized) fail('already-exists', 'Result already finalized.');
  const result = {
    attemptId: attemptId, examinationId: attempt.examinationId, version: attempt.version,
    candidateUid: attempt.candidateUid, skills: skills, score: totalPercent, passed: passed,
    allSkillsPassed: allSkillsPassed,
    moderationStatus: moderationOk ? 'confirmed' : (existing.exists ? existing.data().moderationStatus : 'not-required'),
    finalized: true, finalizedBy: uid, finalizedAt: new Date().toISOString(),
    source: 'authoritative', schemaVersion: 1
  };
  await resultRef.set(result);
  // Les copies (écriture/oral) deviennent immuables après finalisation.
  const batch = admin.firestore().batch();
  for (const sub of subs) {
    batch.update(admin.firestore().collection(SUBMISSIONS).doc(attemptId + '_' + sub.sectionId), { finalized: true, finalizedAt: new Date().toISOString() });
  }
  batch.update(attemptRef, { status: 'finalized', finalizedAt: new Date().toISOString() });
  await batch.commit();
  await admin.firestore().collection(MODERATION).add({
    attemptId: attemptId, actorUid: uid, decision: 'FINALIZED',
    notes: 'Examination result finalized', at: new Date().toISOString()
  });
  return { ok: true, result: result };
});

/* ---------- Correction workflow (Phase 6F) ----------
   Après finalisation, un résultat est immuable. Toute correction passe par
   ce flux contrôlé : motif, autorisation admin/system, préservation de la
   valeur précédente, nouvelle valeur, horodatage, acteur, événement d'audit. */
exports.correctExaminationResult = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const attemptId = String(d.attemptId || '');
  const reason = String(d.reason || '').trim();
  if (reason.length < 5) fail('invalid-argument', 'A correction reason (>=5 chars) is required.');
  if (typeof d.correction !== 'object' || d.correction === null) fail('invalid-argument', 'correction object required.');
  const allowed = ['skills', 'score', 'passed', 'moderationStatus'];
  const keys = Object.keys(d.correction);
  if (!keys.length || keys.some((k) => allowed.indexOf(k) < 0)) fail('invalid-argument', 'Only ' + allowed.join(',') + ' may be corrected.');
  const resultRef = admin.firestore().collection(RESULTS).doc(attemptId);
  const snap = await resultRef.get();
  if (!snap.exists) fail('not-found', 'Result not found.');
  const previous = snap.data();
  if (!previous.finalized) fail('failed-precondition', 'Only finalized results can be corrected.');
  const updated = {};
  for (const k of keys) updated[k] = d.correction[k];
  const correctionRef = await admin.firestore().collection('result_corrections').add({
    attemptId: attemptId, previous: previous, newValues: updated,
    reason: reason, actorUid: uid, at: new Date().toISOString()
  });
  await resultRef.update(Object.assign({}, updated, {
    corrected: true, correctedAt: new Date().toISOString(), correctedBy: uid, correctionReason: reason, correctionId: correctionRef.id
  }));
  await admin.firestore().collection(MODERATION).add({
    attemptId: attemptId, actorUid: uid, decision: 'CORRECTED',
    notes: reason, metadata: { correctionId: correctionRef.id, fields: keys }, at: new Date().toISOString()
  });
  return { ok: true, correctionId: correctionRef.id, correctedFields: keys };
});

exports.getExaminationResult = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const attemptId = String((request.data && request.data.attemptId) || '');
  const snap = await admin.firestore().collection(RESULTS).doc(attemptId).get();
  if (!snap.exists) fail('not-found', 'Result not found.');
  const result = snap.data();
  const isStaff = role === 'examiner' || role === 'admin' || role === 'system' || role === 'teacher';
  if (result.candidateUid !== uid && !isStaff) fail('permission-denied', 'Not authorized.');
  return { result: result };
});

exports._collections = { EXAMS, EXAM_VERSIONS, REGISTRATIONS, ATTEMPTS, SUBMISSIONS, RESULTS, ASSIGNMENTS, MODERATION, CORRECTIONS: 'result_corrections' };
exports.publicExamVersion = publicExamVersion;
