/* ============================================================
   ELA — functions/academic-core.js   (PUR, sans accès base)
   ------------------------------------------------------------
   Modèle académique institutionnel :
     Institution → Academy → Language → Level → Programme →
     Course → Module → Unit → Lesson → Activity → Assessment →
     Examination → Attempt → Result → Academic Record → Certificate

   Principes :
     - VERSIONNEMENT : une version publiée est immuable ; les
       enregistrements étudiants référencent une version précise,
       donc restent historiquement reproductibles.
     - Les faits académiques autoritatifs sont produits côté serveur.
     - Aucune donnée privée n'est exposée par les vues publiques.
   ============================================================ */

const crypto = require('crypto');

const PROGRAMME_STATUS = ['draft', 'published', 'archived'];
const VERSION_STATUS = ['draft', 'published', 'archived'];
const ENROLLMENT_STATUS = ['active', 'completed', 'withdrawn', 'suspended'];
const ACADEMIC_STATES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'WITHDRAWN'];

function nowIso() { return new Date().toISOString(); }

function id(prefix) {
  return prefix + '-' + crypto.randomBytes(8).toString('hex');
}

function canonical(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonical).join(',') + ']';
  return '{' + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}

function checksum(obj) {
  return crypto.createHash('sha256').update(canonical(obj), 'utf8').digest('hex');
}

/* ---------- Programme ---------- */

function buildProgramme(o) {
  const academyCode = String(o.academyCode || '').toUpperCase();
  const level = String(o.level || '').toUpperCase();
  const status = PROGRAMME_STATUS.indexOf(o.status) >= 0 ? o.status : 'draft';
  if (!academyCode) throw new Error('academy-code-required');
  if (!level) throw new Error('level-required');
  const pid = o.id || id('prog');
  return {
    id: pid,
    academyCode: academyCode,
    language: String(o.language || academyCode),
    level: level,
    framework: String(o.framework || ''),
    title: String(o.title || (academyCode + ' ' + level + ' Programme')),
    description: String(o.description || ''),
    status: status,
    currentVersion: Number(o.currentVersion) || 0,
    prerequisites: Array.isArray(o.prerequisites) ? o.prerequisites.map(String) : [],
    createdAt: o.createdAt || nowIso(),
    createdBy: String(o.createdBy || 'system'),
    updatedAt: nowIso()
  };
}

/** Version de programme. Une version `published` est immuable (checksum). */
function buildProgrammeVersion(o) {
  if (!o.programmeId) throw new Error('programmeId-required');
  const version = Number(o.version);
  if (!version || version < 1) throw new Error('version-required');
  const status = VERSION_STATUS.indexOf(o.status) >= 0 ? o.status : 'draft';
  const body = {
    programmeId: String(o.programmeId),
    version: version,
    status: status,
    title: String(o.title || ''),
    outcomes: Array.isArray(o.outcomes) ? o.outcomes.map(String) : [],
    requirements: normalizeRequirements(o.requirements),
    nodes: Array.isArray(o.nodes) ? o.nodes.map((n) => buildCurriculumNode(Object.assign({}, n, { programmeId: o.programmeId, version: version }))) : [],
    createdBy: String(o.createdBy || 'system'),
    createdAt: o.createdAt || nowIso(),
    publishedAt: status === 'published' ? (o.publishedAt || nowIso()) : null
  };
  body.checksum = checksum({ programmeId: body.programmeId, version: body.version, nodes: body.nodes, requirements: body.requirements });
  return body;
}

function normalizeRequirements(r) {
  r = r || {};
  return {
    requiredLessonPercent: clampPercent(r.requiredLessonPercent != null ? r.requiredLessonPercent : 100),
    requiredAssessmentIds: Array.isArray(r.requiredAssessmentIds) ? r.requiredAssessmentIds.map(String) : [],
    requiredAttendancePercent: clampPercent(r.requiredAttendancePercent != null ? r.requiredAttendancePercent : 0),
    attendanceRequired: !!r.attendanceRequired,
    requiresFinalExamination: r.requiresFinalExamination !== false,
    requiredSkills: Array.isArray(r.requiredSkills) ? r.requiredSkills.map(String) : ['listening', 'reading', 'writing', 'speaking'],
    passMark: Number(r.passMark) || 60
  };
}

function clampPercent(v) {
  const n = Number(v);
  if (isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function buildCurriculumNode(o) {
  const type = String(o.type || 'lesson');
  const state = ['READY', 'DRAFT', 'REVIEW_REQUIRED', 'MISSING'].indexOf(o.state) >= 0 ? o.state : 'DRAFT';
  return {
    id: String(o.id || id('node')),
    programmeId: String(o.programmeId || ''),
    version: Number(o.version) || 0,
    type: type,
    parentId: o.parentId || null,
    title: String(o.title || ''),
    order: Number(o.order) || 0,
    state: state,
    skills: Array.isArray(o.skills) ? o.skills.map(String) : [],
    outcomeIds: Array.isArray(o.outcomeIds) ? o.outcomeIds.map(String) : [],
    competencies: Array.isArray(o.competencies) ? o.competencies.map(String) : [],
    contentRef: o.contentRef || null
  };
}

/** Vérifie que chaque assessment du programme est relié à au moins un
 *  learning outcome déclaré. Retourne { ok, unmapped, orphanOutcomes }. */
function mapAssessmentsToOutcomes(version) {
  const nodes = (version && version.nodes) || [];
  const declaredOutcomes = new Set(((version && version.outcomes) || []).map((o) => typeof o === 'string' ? o : (o.id || o)));
  const assessments = nodes.filter((n) => n.type === 'assessment');
  const unmapped = assessments.filter((n) => !(n.outcomeIds || []).length).map((n) => n.id);
  const used = new Set();
  for (const n of nodes) for (const oid of (n.outcomeIds || [])) used.add(oid);
  const orphanOutcomes = Array.from(declaredOutcomes).filter((o) => !used.has(o));
  return { ok: unmapped.length === 0 && orphanOutcomes.length === 0, unmapped: unmapped, orphanOutcomes: orphanOutcomes };
}

/* ---------- Enrollment ---------- */

function buildEnrollment(o) {
  if (!o.studentId || !o.programmeId) throw new Error('studentId-and-programmeId-required');
  const status = ENROLLMENT_STATUS.indexOf(o.status) >= 0 ? o.status : 'active';
  return {
    id: String(o.id || (String(o.studentId) + '_' + String(o.programmeId))),
    studentId: String(o.studentId),
    programmeId: String(o.programmeId),
    version: Number(o.version) || 1,
    academyCode: String(o.academyCode || '').toUpperCase(),
    level: String(o.level || '').toUpperCase(),
    status: status,
    enrolledAt: o.enrolledAt || nowIso(),
    completedAt: o.completedAt || null,
    enrolledBy: String(o.enrolledBy || 'system'),
    updatedAt: nowIso()
  };
}

/* ---------- Progression ---------- */

function computeProgression(completedIds, version) {
  const nodes = (version && version.nodes) || [];
  const done = new Set((completedIds || []).map(String));
  const byType = {};
  for (const n of nodes) {
    const t = n.type || 'lesson';
    if (!byType[t]) byType[t] = { total: 0, completed: 0 };
    byType[t].total++;
    if (done.has(String(n.id))) byType[t].completed++;
  }
  const lessonTotal = byType.lesson ? byType.lesson.total : 0;
  const lessonCompleted = byType.lesson ? byType.lesson.completed : 0;
  const requiredLessonPercent = version && version.requirements ? version.requirements.requiredLessonPercent : 100;
  const lessonPercent = lessonTotal ? Math.round((lessonCompleted / lessonTotal) * 100) : 0;
  const allNodesDone = nodes.length > 0 && nodes.every((n) => done.has(String(n.id)));
  return {
    lessonTotal: lessonTotal,
    lessonCompleted: lessonCompleted,
    lessonPercent: lessonPercent,
    byType: byType,
    allNodesDone: allNodesDone,
    requirementsMet: lessonPercent >= requiredLessonPercent
  };
}

/* ---------- Enrollment lifecycle & prerequisites ---------- */

/* Transitions autorisées du statut d'inscription. */
const ENROLLMENT_TRANSITIONS = {
  active: ['completed', 'withdrawn', 'suspended'],
  suspended: ['active', 'withdrawn'],
  withdrawn: ['active'],
  completed: ['active']
};

function canTransitionEnrollment(from, to) {
  const allowed = ENROLLMENT_TRANSITIONS[from] || [];
  return allowed.indexOf(to) >= 0;
}

/** Vérifie que les prérequis (programmes terminés) sont satisfaits. */
function evaluatePrerequisites(programme, completedProgrammeIds) {
  const required = (programme && programme.prerequisites) || [];
  const done = new Set((completedProgrammeIds || []).map(String));
  const missing = required.filter((p) => !done.has(String(p)));
  return { satisfied: missing.length === 0, missing: missing };
}

/** Éligibilité au repassage d'un examen selon la politique de retake. */
function evaluateRetakeEligibility(attempts, retakePolicy, nowMs) {
  const list = attempts || [];
  const finalized = list.filter((a) => a.status === 'finalized');
  const policy = retakePolicy || { allowed: false, maxAttempts: 1, cooldownDays: 0 };
  if (!policy.allowed) return { eligible: false, reason: 'retake-not-allowed' };
  if (list.length >= (policy.maxAttempts || 1)) return { eligible: false, reason: 'max-attempts-reached' };
  if (policy.cooldownDays && finalized.length) {
    const last = finalized.reduce((a, b) => (String(a.finalizedAt) > String(b.finalizedAt) ? a : b));
    const nextAllowed = new Date(last.finalizedAt || 0).getTime() + policy.cooldownDays * 86400000;
    if (nowMs && nowMs < nextAllowed) return { eligible: false, reason: 'cooldown-active', nextAllowed: new Date(nextAllowed).toISOString() };
  }
  return { eligible: true, reason: 'eligible' };
}

/* ---------- Academic record ---------- */

/** Réduit une liste d'événements académiques en un dossier structuré et
 *  reproductible. Ne fabrique aucune donnée absente. */
function buildAcademicRecord(uid, events) {
  const record = {
    studentId: String(uid),
    generatedAt: nowIso(),
    enrollments: [],
    lessonCompletions: [],
    assessments: [],
    examinations: [],
    attendance: [],
    certificates: [],
    progression: {}
  };
  for (const e of (events || [])) {
    const t = e.type;
    if (t === 'ENROLLED') record.enrollments.push({ programmeId: e.programmeId, version: e.version, academyCode: e.academyCode, level: e.level, at: e.at, status: e.status || 'active' });
    else if (t === 'LESSON_COMPLETED') record.lessonCompletions.push({ nodeId: e.nodeId, programmeId: e.programmeId, at: e.at });
    else if (t === 'ASSESSMENT_RESULT') record.assessments.push({ assessmentId: e.assessmentId, score: e.score, passed: e.passed, at: e.at, source: e.source || 'authoritative' });
    else if (t === 'EXAMINATION_RESULT') record.examinations.push({ examinationId: e.examinationId, skills: e.skills || {}, score: e.score, passed: e.passed, finalized: !!e.finalized, at: e.at });
    else if (t === 'ATTENDANCE') record.attendance.push({ sessionId: e.sessionId, programmeId: e.programmeId, status: e.status, at: e.at });
    else if (t === 'CERTIFICATE_ISSUED') record.certificates.push({ certificateId: e.certificateId, programmeId: e.programmeId, level: e.level, at: e.at, status: e.status || 'active' });
  }
  return record;
}

function buildTranscript(record, certificates) {
  return {
    studentId: record.studentId,
    generatedAt: nowIso(),
    institution: 'E-Learn Language Academy',
    enrollments: record.enrollments,
    assessments: record.assessments,
    examinations: record.examinations,
    certificates: (certificates || []).map((c) => ({
      certificateId: c.id, programmeId: c.programmeId || null, level: c.cecrLevel,
      academyCode: c.academyCode, status: c.status, issueDate: c.issueDate,
      verificationUrl: c.verificationUrl
    })),
    attendance: record.attendance,
    note: 'Transcript generated from authoritative academic records. Not a public document.'
  };
}

/* ---------- Certification eligibility ---------- */

/** Évalue l'éligibilité à la certification à partir de faits AUTORITATIFS.
 *  Retourne { eligible, checks, reasons }. Aucune écriture. */
function evaluateCertificationEligibility(input) {
  input = input || {};
  const programme = input.programme || {};
  const version = input.version || {};
  const requirements = version.requirements || normalizeRequirements({});
  const progress = input.progress || {};
  const attendancePercent = input.attendancePercent;
  const exam = input.examinationResult || null;
  const examinerValidated = !!input.examinerValidated;
  const checks = [];

  const lessonPercent = Number(progress.lessonPercent || 0);
  checks.push({ name: 'lessons', ok: lessonPercent >= requirements.requiredLessonPercent, detail: lessonPercent + '% >= ' + requirements.requiredLessonPercent + '%' });

  const assessments = input.assessments || {};
  const missingAssessments = requirements.requiredAssessmentIds.filter((aid) => !assessments[aid] || !assessments[aid].passed);
  checks.push({ name: 'assessments', ok: missingAssessments.length === 0, detail: missingAssessments.length ? ('missing:' + missingAssessments.join(',')) : 'all-required-passed' });

  if (requirements.attendanceRequired) {
    const ap = Number(attendancePercent || 0);
    checks.push({ name: 'attendance', ok: ap >= requirements.requiredAttendancePercent, detail: ap + '% >= ' + requirements.requiredAttendancePercent + '%' });
  } else {
    checks.push({ name: 'attendance', ok: true, detail: 'not-required' });
  }

  if (requirements.requiresFinalExamination) {
    const finalized = !!(exam && exam.finalized);
    const passed = !!(exam && exam.passed);
    checks.push({ name: 'examination-finalized', ok: finalized, detail: finalized ? 'finalized' : 'not-finalized' });
    const skills = (exam && exam.skills) || {};
    const missingSkills = requirements.requiredSkills.filter((s) => !skills[s] || !skills[s].passed);
    checks.push({ name: 'examination-skills', ok: passed && missingSkills.length === 0, detail: missingSkills.length ? ('missing:' + missingSkills.join(',')) : (passed ? 'all-skills-passed' : 'examination-not-passed') });
    checks.push({ name: 'examiner-validation', ok: examinerValidated, detail: examinerValidated ? 'validated' : 'pending' });
  } else {
    checks.push({ name: 'examination', ok: true, detail: 'not-required' });
  }

  const reasons = checks.filter((c) => !c.ok).map((c) => c.name);
  return { eligible: reasons.length === 0, checks: checks, reasons: reasons };
}

module.exports = {
  PROGRAMME_STATUS,
  VERSION_STATUS,
  ENROLLMENT_STATUS,
  ACADEMIC_STATES,
  nowIso,
  id,
  canonical,
  checksum,
  buildProgramme,
  buildProgrammeVersion,
  buildCurriculumNode,
  mapAssessmentsToOutcomes,
  normalizeRequirements,
  buildEnrollment,
  computeProgression,
  ENROLLMENT_TRANSITIONS,
  canTransitionEnrollment,
  evaluatePrerequisites,
  evaluateRetakeEligibility,
  buildAcademicRecord,
  buildTranscript,
  evaluateCertificationEligibility
};
