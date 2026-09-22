/* ============================================================
   ELA — functions/governance-core.js   (PUR, sans accès base)
   ------------------------------------------------------------
   Modèle de gouvernance académique interne ELA.
   - rôles de gouvernance
   - machine à états de revue
   - séparation des tâches
   - portes de qualité (approbation / publication)
   - classification des changements
   Ceci est un mécanisme INTERNE ELA. Aucune revendication
   d'agrément gouvernemental, de FME, ou d'autorisation externe.
   ============================================================ */

const REVIEW_STATES = [
  'DRAFT', 'SUBMITTED_FOR_REVIEW', 'IN_REVIEW', 'REVISION_REQUIRED',
  'RESUBMITTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED'
];

/* Transitions autorisées (serveur uniquement). */
const TRANSITIONS = {
  DRAFT: ['SUBMITTED_FOR_REVIEW'],
  SUBMITTED_FOR_REVIEW: ['IN_REVIEW'],
  IN_REVIEW: ['REVISION_REQUIRED', 'APPROVED'],
  REVISION_REQUIRED: ['RESUBMITTED', 'DRAFT'],
  RESUBMITTED: ['IN_REVIEW'],
  APPROVED: ['PUBLISHED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: []
};

const GOVERNANCE_ROLES = [
  'ACADEMIC_ADMIN', 'ACADEMIC_DIRECTOR', 'CURRICULUM_AUTHOR', 'CURRICULUM_REVIEWER',
  'LANGUAGE_REVIEWER', 'ASSESSMENT_REVIEWER', 'EXAMINATION_REVIEWER', 'EXAM_MODERATOR',
  'ACADEMIC_BOARD_MEMBER', 'PUBLISHER'
];

const BASE_ROLES = ['student', 'teacher', 'examiner', 'admin', 'system'];

const SUBJECT_TYPES = ['programme', 'curriculum', 'lesson', 'assessment', 'examination', 'rubric'];

const CHANGE_TYPES = [
  'EDITORIAL', 'MINOR_ACADEMIC', 'MAJOR_ACADEMIC', 'ASSESSMENT_CHANGE',
  'EXAMINATION_CHANGE', 'CERTIFICATION_IMPACTING'
];

const ADVANCED_LEVELS = ['C1', 'C2', 'HSK5', 'HSK6'];

const ISSUE_SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR', 'EDITORIAL'];

const DECISIONS = ['APPROVE', 'APPROVE_WITH_CONDITIONS', 'REVISION_REQUIRED', 'REJECT', 'DEFER'];

function canTransition(from, to) {
  return (TRANSITIONS[from] || []).indexOf(to) >= 0;
}

function isAdvancedLevel(level) {
  return ADVANCED_LEVELS.indexOf(String(level || '').toUpperCase()) >= 0;
}

/* Rôles de revue requis par type de sujet. */
function requiredReviewRoles(subjectType, level) {
  const base = {
    programme: ['CURRICULUM_REVIEWER', 'LANGUAGE_REVIEWER'],
    curriculum: ['CURRICULUM_REVIEWER', 'LANGUAGE_REVIEWER'],
    lesson: ['CURRICULUM_REVIEWER', 'LANGUAGE_REVIEWER'],
    assessment: ['ASSESSMENT_REVIEWER', 'LANGUAGE_REVIEWER'],
    examination: ['EXAMINATION_REVIEWER', 'EXAM_MODERATOR', 'ASSESSMENT_REVIEWER', 'LANGUAGE_REVIEWER'],
    rubric: ['ASSESSMENT_REVIEWER', 'LANGUAGE_REVIEWER']
  }[subjectType] || ['CURRICULUM_REVIEWER'];
  return base.slice();
}

/* L'approbation finale exige un membre du conseil ou le directeur académique. */
const FINAL_APPROVAL_ROLES = ['ACADEMIC_BOARD_MEMBER', 'ACADEMIC_DIRECTOR'];

function isFinalApprover(roles) {
  return FINAL_APPROVAL_ROLES.some((r) => (roles || []).indexOf(r) >= 0);
}

/** Portes de qualité avant APPROVED. Retourne { ok, failures }. */
function evaluateApprovalGates(ctx) {
  const failures = [];
  const review = ctx.review || {};
  const subject = ctx.subject || {};
  const issues = ctx.issues || [];
  const completedRoles = ctx.completedRoles || [];
  const authorUid = review.submittedBy;
  const approverUid = ctx.approverUid;

  if (!review.subjectId) failures.push('missing-subject');
  if (!subject.programmeId) failures.push('missing-programme');
  if (!subject.level) failures.push('missing-level');
  if (!subject.language) failures.push('missing-language');

  // Metadata / mapping selon le type
  if (review.subjectType === 'programme' || review.subjectType === 'curriculum') {
    if (!(subject.outcomeIds && subject.outcomeIds.length)) failures.push('missing-learning-outcomes');
    if (!(subject.competencyIds && subject.competencyIds.length)) failures.push('missing-competency-mapping');
    if (subject.assessmentMapped !== true) failures.push('missing-assessment-mapping');
    if (subject.examinationMapped !== true) failures.push('missing-examination-mapping');
  }
  if (review.subjectType === 'examination') {
    if (subject.sectionCount !== 4) failures.push('examination-requires-four-sections');
  }

  const unresolvedCritical = issues.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const unresolvedMajor = issues.filter((i) => i.severity === 'MAJOR' && i.status !== 'RESOLVED').length;
  if (unresolvedCritical > 0) failures.push('unresolved-critical-issues');
  if (unresolvedMajor > 0) failures.push('unresolved-major-issues');

  const required = requiredReviewRoles(review.subjectType, subject.level);
  const missingReviews = required.filter((r) => completedRoles.indexOf(r) < 0);
  if (missingReviews.length) failures.push('missing-reviews:' + missingReviews.join(','));

  if (approverUid && authorUid && approverUid === authorUid) failures.push('separation-of-duties-author-cannot-approve');
  if (!isFinalApprover(ctx.approverRoles)) failures.push('approver-not-authorized');

  // Niveaux avancés : conseil requis
  if (isAdvancedLevel(subject.level) && (ctx.approverRoles || []).indexOf('ACADEMIC_BOARD_MEMBER') < 0 && (ctx.approverRoles || []).indexOf('ACADEMIC_DIRECTOR') < 0) {
    failures.push('advanced-level-requires-board-approval');
  }
  return { ok: failures.length === 0, failures: failures };
}

/** Portes de qualité avant PUBLISHED. */
function evaluatePublicationGates(ctx) {
  const failures = [];
  const review = ctx.review || {};
  if (review.status !== 'APPROVED') failures.push('not-approved');
  if (!ctx.releaseId) failures.push('missing-release-record');
  if (!ctx.publisherRoles || ctx.publisherRoles.indexOf('PUBLISHER') < 0) failures.push('publisher-not-authorized');
  const issues = ctx.issues || [];
  if (issues.some((i) => (i.severity === 'CRITICAL' || i.severity === 'MAJOR') && i.status !== 'RESOLVED')) failures.push('blocking-issue-open');
  return { ok: failures.length === 0, failures: failures };
}

/** Classification de changement : exige-t-elle une gouvernance renforcée ? */
function changeRequiresBoard(changeType) {
  return changeType === 'EXAMINATION_CHANGE' || changeType === 'CERTIFICATION_IMPACTING' || changeType === 'MAJOR_ACADEMIC';
}

function nextVersion(current, changeType) {
  const v = String(current || '1.0');
  const parts = v.split('.');
  const major = parseInt(parts[0], 10) || 1;
  const minor = parseInt(parts[1], 10) || 0;
  if (changeType === 'EDITORIAL' || changeType === 'MINOR_ACADEMIC') return major + '.' + (minor + 1);
  return (major + 1) + '.0';
}

/** Conflit d'intérêt : un auteur ne peut pas être reviewer/approbateur. */
function hasConflict(authorUid, reviewerUid) {
  return !!authorUid && !!reviewerUid && String(authorUid) === String(reviewerUid);
}

module.exports = {
  REVIEW_STATES, TRANSITIONS, GOVERNANCE_ROLES, BASE_ROLES, SUBJECT_TYPES, CHANGE_TYPES,
  ADVANCED_LEVELS, ISSUE_SEVERITIES, DECISIONS, FINAL_APPROVAL_ROLES,
  canTransition, isAdvancedLevel, requiredReviewRoles, isFinalApprover,
  evaluateApprovalGates, evaluatePublicationGates, changeRequiresBoard, nextVersion, hasConflict
};
