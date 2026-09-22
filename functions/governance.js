/* ============================================================
   ELA — functions/governance.js
   ------------------------------------------------------------
   Gouvernance académique interne ELA (serveur uniquement).
   Collections :
     governance_roles, reviewer_profiles, academic_board_members,
     academic_reviews, review_assignments, review_issues,
     academic_decisions, academic_publications, academic_versions,
     conflict_declarations, academic_appeals, emergency_corrections,
     governance_audit_events
   Mécanisme INTERNE ELA — aucune revendication externe.
   ============================================================ */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { callable } = require('./callable.js');
const admin = require('firebase-admin');
const gc = require('./governance-core.js');
const authz = require('./authz.js');

const REGION = 'africa-south1';
const GOV_ROLES = 'governance_roles';
const REVIEWERS = 'reviewer_profiles';
const BOARD = 'academic_board_members';
const REVIEWS = 'academic_reviews';
const ASSIGNMENTS = 'review_assignments';
const ISSUES = 'review_issues';
const DECISIONS = 'academic_decisions';
const PUBLICATIONS = 'academic_publications';
const VERSIONS = 'academic_versions';
const CONFLICTS = 'conflict_declarations';
const APPEALS = 'academic_appeals';
const EMERGENCY = 'emergency_corrections';
const AUDIT = 'governance_audit_events';

function uidOf(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
  return uid;
}
function fail(code, msg) { throw new HttpsError(code, msg); }

async function getGovRoles(uid) {
  const snap = await admin.firestore().collection(GOV_ROLES).doc(String(uid)).get();
  return snap.exists ? (snap.data().roles || []) : [];
}
async function requireGovRole(uid, roles) {
  const r = await getGovRoles(uid);
  if (!roles.some((x) => r.indexOf(x) >= 0)) fail('permission-denied', 'Requires governance role: ' + roles.join('|'));
  return r;
}
async function requireAdmin(uid) {
  const role = await authz.getUserRole(uid);
  if (role !== 'admin' && role !== 'system') fail('permission-denied', 'Admin/system only.');
  return role;
}

async function audit(action, entry) {
  try {
    await admin.firestore().collection(AUDIT).add(Object.assign({
      action: String(action),
      actorUid: String((entry && entry.actorUid) || 'system'),
      role: (entry && entry.role) || null,
      objectType: (entry && entry.objectType) || null,
      objectId: (entry && entry.objectId) || null,
      reviewId: (entry && entry.reviewId) || null,
      fromState: (entry && entry.fromState) || null,
      toState: (entry && entry.toState) || null,
      reason: (entry && entry.reason) || null,
      version: (entry && entry.version) || null,
      metadata: (entry && entry.metadata) || {},
      at: new Date().toISOString()
    }));
  } catch (e) { console.error('[ELA-Gov] audit failed:', e.message); }
}

/* ============================================================
   Rôles de gouvernance & profils
   ============================================================ */
exports.setGovernanceRole = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const targetUid = String(d.uid || '');
  const role = String(d.role || '');
  const grant = d.grant !== false;
  if (!targetUid) fail('invalid-argument', 'uid required.');
  if (gc.GOVERNANCE_ROLES.indexOf(role) < 0) fail('invalid-argument', 'Unknown governance role.');
  const ref = admin.firestore().collection(GOV_ROLES).doc(targetUid);
  const snap = await ref.get();
  const current = snap.exists ? (snap.data().roles || []) : [];
  const next = grant ? Array.from(new Set(current.concat([role]))) : current.filter((r) => r !== role);
  await ref.set({ uid: targetUid, roles: next, updatedAt: new Date().toISOString(), updatedBy: uid }, { merge: true });
  await audit('GOVERNANCE_ROLE_CHANGED', { actorUid: uid, objectType: 'user', objectId: targetUid, metadata: { role: role, grant: grant, roles: next } });
  return { ok: true, roles: next };
});

exports.getGovernanceProfile = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const targetUid = String((request.data && request.data.uid) || uid);
  const adminRole = await authz.getUserRole(uid);
  if (targetUid !== uid && adminRole !== 'admin' && adminRole !== 'system') fail('permission-denied', 'Not accessible.');
  const roles = await getGovRoles(targetUid);
  const rp = await admin.firestore().collection(REVIEWERS).doc(targetUid).get();
  const bm = await admin.firestore().collection(BOARD).doc(targetUid).get();
  return { roles: roles, reviewerProfile: rp.exists ? rp.data() : null, boardMember: bm.exists ? bm.data() : null };
});

exports.registerReviewerProfile = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const languages = Array.isArray(d.languages) ? d.languages.map((x) => String(x).toUpperCase()) : [];
  const subjects = Array.isArray(d.subjects) ? d.subjects.map(String) : [];
  const levels = Array.isArray(d.levels) ? d.levels.map((x) => String(x).toUpperCase()) : [];
  if (!languages.length) fail('invalid-argument', 'At least one language required.');
  const profile = {
    uid: uid, languages: languages, subjects: subjects, levels: levels,
    qualifications: Array.isArray(d.qualifications) ? d.qualifications : [],
    experience: String(d.experience || ''),
    evidenceReferences: Array.isArray(d.evidenceReferences) ? d.evidenceReferences : [],
    verificationStatus: 'SELF_DECLARED',
    approvalStatus: 'PENDING',
    active: true,
    updatedAt: new Date().toISOString()
  };
  await admin.firestore().collection(REVIEWERS).doc(uid).set(profile, { merge: true });
  await audit('REVIEWER_PROFILE_REGISTERED', { actorUid: uid, objectType: 'reviewer', objectId: uid, metadata: { languages: languages } });
  return { ok: true, profile: profile };
});

exports.verifyReviewerProfile = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const targetUid = String(d.uid || '');
  const status = String(d.verificationStatus || 'DOCUMENT_VERIFIED');
  if (['SELF_DECLARED', 'DOCUMENT_VERIFIED', 'APPROVED'].indexOf(status) < 0) fail('invalid-argument', 'Invalid verification status.');
  await admin.firestore().collection(REVIEWERS).doc(targetUid).set({ verificationStatus: status, approvalStatus: status === 'APPROVED' ? 'APPROVED' : 'PENDING', verifiedBy: uid, verifiedAt: new Date().toISOString() }, { merge: true });
  await audit('REVIEWER_VERIFIED', { actorUid: uid, objectType: 'reviewer', objectId: targetUid, metadata: { status: status } });
  return { ok: true };
});

exports.appointBoardMember = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const targetUid = String(d.uid || '');
  if (!targetUid) fail('invalid-argument', 'uid required.');
  const member = {
    uid: targetUid, scope: d.scope || 'ACADEMIC', academy: d.academy || null,
    expertise: Array.isArray(d.expertise) ? d.expertise : [],
    appointmentStatus: 'INTERNAL_APPOINTED', startDate: d.startDate || new Date().toISOString(),
    endDate: d.endDate || null, active: true, appointedBy: uid, appointedAt: new Date().toISOString()
  };
  await admin.firestore().collection(BOARD).doc(targetUid).set(member, { merge: true });
  // L'appartenance au conseil implique le rôle de gouvernance.
  const ref = admin.firestore().collection(GOV_ROLES).doc(targetUid);
  const snap = await ref.get();
  const current = snap.exists ? (snap.data().roles || []) : [];
  await ref.set({ uid: targetUid, roles: Array.from(new Set(current.concat(['ACADEMIC_BOARD_MEMBER']))) }, { merge: true });
  await audit('BOARD_MEMBER_APPOINTED', { actorUid: uid, objectType: 'board_member', objectId: targetUid, metadata: { scope: member.scope } });
  return { ok: true, member: member };
});

/* ============================================================
   Revue académique
   ============================================================ */
exports.submitForReview = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireGovRole(uid, ['CURRICULUM_AUTHOR', 'ACADEMIC_ADMIN', 'ACADEMIC_DIRECTOR']);
  const d = request.data || {};
  const subjectType = String(d.subjectType || '');
  if (gc.SUBJECT_TYPES.indexOf(subjectType) < 0) fail('invalid-argument', 'Invalid subjectType.');
  if (!d.subjectId) fail('invalid-argument', 'subjectId required.');
  const review = {
    subjectType: subjectType, subjectId: String(d.subjectId),
    programmeId: d.programmeId ? String(d.programmeId) : null,
    programmeVersion: Number(d.programmeVersion) || 1,
    academyCode: String(d.academyCode || '').toUpperCase(),
    language: String(d.language || '').toUpperCase(),
    level: String(d.level || '').toUpperCase(),
    version: String(d.version || '1.0'),
    status: 'SUBMITTED_FOR_REVIEW',
    submittedBy: uid, submittedAt: new Date().toISOString(),
    subject: {
      programmeId: d.programmeId ? String(d.programmeId) : null,
      level: String(d.level || '').toUpperCase(),
      language: String(d.language || '').toUpperCase(),
      outcomeIds: Array.isArray(d.outcomeIds) ? d.outcomeIds : [],
      competencyIds: Array.isArray(d.competencyIds) ? d.competencyIds : [],
      assessmentMapped: d.assessmentMapped === true,
      examinationMapped: d.examinationMapped === true,
      sectionCount: Number(d.sectionCount) || 0
    },
    completedRoles: [],
    revisionCount: 0,
    createdAt: new Date().toISOString()
  };
  const ref = await admin.firestore().collection(REVIEWS).add(review);
  await audit('REVIEW_SUBMITTED', { actorUid: uid, objectType: subjectType, objectId: review.subjectId, reviewId: ref.id, toState: 'SUBMITTED_FOR_REVIEW' });
  return { ok: true, reviewId: ref.id, status: 'SUBMITTED_FOR_REVIEW' };
});

exports.assignReviewer = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireGovRole(uid, ['ACADEMIC_ADMIN', 'ACADEMIC_DIRECTOR']);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  const reviewerUid = String(d.reviewerUid || '');
  const role = String(d.role || '');
  if (gc.GOVERNANCE_ROLES.indexOf(role) < 0) fail('invalid-argument', 'Invalid reviewer role.');
  const rSnap = await admin.firestore().collection(REVIEWS).doc(reviewId).get();
  if (!rSnap.exists) fail('not-found', 'Review not found.');
  const review = rSnap.data();
  if (gc.hasConflict(review.submittedBy, reviewerUid)) fail('failed-precondition', 'conflict-of-interest: author cannot review own content');
  // Le reviewer doit être autorisé pour la langue (LANGUAGE_REVIEWER).
  if (role === 'LANGUAGE_REVIEWER') {
    const rp = await admin.firestore().collection(REVIEWERS).doc(reviewerUid).get();
    const langs = rp.exists ? (rp.data().languages || []) : [];
    if (langs.indexOf(review.language) < 0) fail('failed-precondition', 'reviewer-not-authorized-for-language:' + review.language);
  }
  const assignment = {
    reviewId: reviewId, reviewerUid: reviewerUid, role: role,
    language: review.language, academyCode: review.academyCode, level: review.level,
    status: 'ASSIGNED', conflictOfInterest: false,
    assignedBy: uid, assignedAt: new Date().toISOString(), completedAt: null
  };
  const ref = await admin.firestore().collection(ASSIGNMENTS).add(assignment);
  if (review.status === 'SUBMITTED_FOR_REVIEW') {
    await admin.firestore().collection(REVIEWS).doc(reviewId).update({ status: 'IN_REVIEW' });
  }
  await audit('REVIEWER_ASSIGNED', { actorUid: uid, role: role, objectType: 'review', objectId: reviewId, reviewId: reviewId, metadata: { reviewerUid: reviewerUid } });
  return { ok: true, assignmentId: ref.id, status: 'ASSIGNED' };
});

exports.declareConflict = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  await admin.firestore().collection(CONFLICTS).add({ reviewId: reviewId, declaredBy: uid, reason: String(d.reason || ''), status: 'CONFLICT_DECLARED', at: new Date().toISOString() });
  await audit('CONFLICT_DECLARED', { actorUid: uid, objectType: 'review', objectId: reviewId, reviewId: reviewId });
  return { ok: true, status: 'CONFLICT_DECLARED' };
});

exports.addReviewIssue = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  const severity = String(d.severity || 'MINOR');
  if (gc.ISSUE_SEVERITIES.indexOf(severity) < 0) fail('invalid-argument', 'Invalid severity.');
  const aSnap = await admin.firestore().collection(ASSIGNMENTS).where('reviewId', '==', reviewId).where('reviewerUid', '==', uid).limit(1).get();
  if (aSnap.empty) fail('permission-denied', 'Not assigned to this review.');
  const issue = {
    reviewId: reviewId, severity: severity, category: String(d.category || 'general'),
    description: String(d.description || ''), location: d.location || null,
    recommendation: d.recommendation || null, status: 'OPEN',
    reviewerUid: uid, response: null, resolution: null, resolvedBy: null, resolvedAt: null,
    createdAt: new Date().toISOString()
  };
  const ref = await admin.firestore().collection(ISSUES).add(issue);
  await audit('ISSUE_ADDED', { actorUid: uid, objectType: 'issue', objectId: ref.id, reviewId: reviewId, metadata: { severity: severity } });
  return { ok: true, issueId: ref.id };
});

exports.resolveIssue = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const issueId = String(d.issueId || '');
  const ref = admin.firestore().collection(ISSUES).doc(issueId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Issue not found.');
  await ref.update({ status: 'RESOLVED', resolution: String(d.resolution || ''), resolvedBy: uid, resolvedAt: new Date().toISOString() });
  await audit('ISSUE_RESOLVED', { actorUid: uid, objectType: 'issue', objectId: issueId, reviewId: snap.data().reviewId });
  return { ok: true };
});

exports.submitReviewDecision = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  const decision = String(d.decision || '');
  if (['PASS', 'REVISION_REQUIRED', 'REJECT'].indexOf(decision) < 0) fail('invalid-argument', 'Invalid decision.');
  const aSnap = await admin.firestore().collection(ASSIGNMENTS).where('reviewId', '==', reviewId).where('reviewerUid', '==', uid).limit(1).get();
  if (aSnap.empty) fail('permission-denied', 'Not assigned to this review.');
  const assignment = aSnap.docs[0];
  const reviewRef = admin.firestore().collection(REVIEWS).doc(reviewId);
  const rSnap = await reviewRef.get();
  const review = rSnap.data();

  if (decision === 'REVISION_REQUIRED') {
    if (!gc.canTransition(review.status, 'REVISION_REQUIRED')) fail('failed-precondition', 'Invalid transition from ' + review.status);
    await reviewRef.update({ status: 'REVISION_REQUIRED', revisionCount: (review.revisionCount || 0) + 1 });
    await assignment.ref.update({ status: 'COMPLETED', completedAt: new Date().toISOString(), decision: decision });
    await admin.firestore().collection(DECISIONS).add({ reviewId: reviewId, reviewerUid: uid, role: assignment.data().role, decision: decision, comments: String(d.comments || ''), at: new Date().toISOString() });
    await audit('REVISION_REQUIRED', { actorUid: uid, objectType: 'review', objectId: reviewId, reviewId: reviewId, fromState: review.status, toState: 'REVISION_REQUIRED' });
    return { ok: true, status: 'REVISION_REQUIRED' };
  }
  if (decision === 'REJECT') {
    await assignment.ref.update({ status: 'COMPLETED', completedAt: new Date().toISOString(), decision: decision });
    await admin.firestore().collection(DECISIONS).add({ reviewId: reviewId, reviewerUid: uid, role: assignment.data().role, decision: decision, comments: String(d.comments || ''), at: new Date().toISOString() });
    await reviewRef.update({ status: 'REVISION_REQUIRED', rejected: true });
    await audit('REVIEW_REJECTED', { actorUid: uid, objectType: 'review', objectId: reviewId, reviewId: reviewId });
    return { ok: true, status: 'REVISION_REQUIRED', rejected: true };
  }
  // PASS
  await assignment.ref.update({ status: 'COMPLETED', completedAt: new Date().toISOString(), decision: decision });
  await admin.firestore().collection(DECISIONS).add({ reviewId: reviewId, reviewerUid: uid, role: assignment.data().role, decision: decision, comments: String(d.comments || ''), at: new Date().toISOString() });
  const completed = Array.from(new Set((review.completedRoles || []).concat([assignment.data().role])));
  await reviewRef.update({ completedRoles: completed });
  await audit('REVIEW_PASSED', { actorUid: uid, role: assignment.data().role, objectType: 'review', objectId: reviewId, reviewId: reviewId });
  return { ok: true, status: 'PASS', completedRoles: completed };
});

exports.resubmitForReview = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  const ref = admin.firestore().collection(REVIEWS).doc(reviewId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Review not found.');
  const review = snap.data();
  if (review.submittedBy !== uid) fail('permission-denied', 'Only the author may resubmit.');
  if (review.status !== 'REVISION_REQUIRED') fail('failed-precondition', 'Review is not in revision.');
  if (!gc.canTransition(review.status, 'RESUBMITTED')) fail('failed-precondition', 'Invalid transition.');
  await ref.update({ status: 'RESUBMITTED', resubmittedAt: new Date().toISOString() });
  await ref.update({ status: 'IN_REVIEW' });
  await audit('RESUBMITTED', { actorUid: uid, objectType: 'review', objectId: reviewId, reviewId: reviewId, fromState: 'REVISION_REQUIRED', toState: 'RESUBMITTED' });
  return { ok: true, status: 'IN_REVIEW' };
});

/* ============================================================
   Approbation / publication / archivage
   ============================================================ */
exports.approveContent = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const roles = await requireGovRole(uid, gc.FINAL_APPROVAL_ROLES);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  const ref = admin.firestore().collection(REVIEWS).doc(reviewId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Review not found.');
  const review = snap.data();
  if (!gc.canTransition(review.status, 'APPROVED')) fail('failed-precondition', 'Invalid transition from ' + review.status);
  const issuesSnap = await admin.firestore().collection(ISSUES).where('reviewId', '==', reviewId).get();
  const issues = issuesSnap.docs.map((x) => x.data());
  const gates = gc.evaluateApprovalGates({ review: review, subject: review.subject, issues: issues, completedRoles: review.completedRoles || [], approverUid: uid, approverRoles: roles });
  if (!gates.ok) fail('failed-precondition', 'Approval gates failed: ' + gates.failures.join(','));
  const decision = String(d.decision || 'APPROVE');
  if (gc.DECISIONS.indexOf(decision) < 0) fail('invalid-argument', 'Invalid decision.');
  await ref.update({ status: 'APPROVED', approvedBy: uid, approvedAt: new Date().toISOString(), decision: decision });
  const decisionRef = await admin.firestore().collection(DECISIONS).add({
    reviewId: reviewId, decision: decision, decisionMaker: uid, supportingReviewers: review.completedRoles || [],
    scope: review.subjectType, rationale: String(d.rationale || ''), conditions: d.conditions || null,
    at: new Date().toISOString()
  });
  const versionId = review.subjectId + '@' + review.version;
  await admin.firestore().collection(VERSIONS).doc(versionId).set({
    objectType: review.subjectType, objectId: review.subjectId, version: review.version,
    programmeId: review.programmeId, academyCode: review.academyCode, level: review.level,
    status: 'APPROVED', approvedBy: uid, approvedAt: new Date().toISOString(),
    decisionId: decisionRef.id
  }, { merge: true });
  await audit('CONTENT_APPROVED', { actorUid: uid, objectType: review.subjectType, objectId: review.subjectId, reviewId: reviewId, fromState: review.status, toState: 'APPROVED', version: review.version });
  return { ok: true, status: 'APPROVED', version: review.version };
});

exports.publishContent = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const roles = await requireGovRole(uid, ['PUBLISHER', 'ACADEMIC_ADMIN']);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  const ref = admin.firestore().collection(REVIEWS).doc(reviewId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Review not found.');
  const review = snap.data();
  if (!gc.canTransition(review.status, 'PUBLISHED')) fail('failed-precondition', 'Invalid transition from ' + review.status);
  const issuesSnap = await admin.firestore().collection(ISSUES).where('reviewId', '==', reviewId).get();
  const issues = issuesSnap.docs.map((x) => x.data());
  const releaseId = 'REL-' + review.subjectId + '-' + review.version + '-' + Date.now().toString(36);
  const gates = gc.evaluatePublicationGates({ review: review, releaseId: releaseId, publisherRoles: roles, issues: issues });
  if (!gates.ok) fail('failed-precondition', 'Publication gates failed: ' + gates.failures.join(','));
  await ref.update({ status: 'PUBLISHED', publishedBy: uid, publishedAt: new Date().toISOString(), releaseId: releaseId });
  await admin.firestore().collection(PUBLICATIONS).add({
    reviewId: reviewId, subjectType: review.subjectType, subjectId: review.subjectId,
    version: review.version, programmeId: review.programmeId, programmeVersion: review.programmeVersion,
    releaseId: releaseId, publishedBy: uid, publishedAt: new Date().toISOString()
  });
  await admin.firestore().collection(VERSIONS).doc(review.subjectId + '@' + review.version).set({ status: 'PUBLISHED', releaseId: releaseId, publishedBy: uid, publishedAt: new Date().toISOString() }, { merge: true });
  await audit('CONTENT_PUBLISHED', { actorUid: uid, objectType: review.subjectType, objectId: review.subjectId, reviewId: reviewId, fromState: review.status, toState: 'PUBLISHED', version: review.version, metadata: { releaseId: releaseId } });
  return { ok: true, status: 'PUBLISHED', releaseId: releaseId };
});

exports.archiveContent = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireGovRole(uid, ['PUBLISHER', 'ACADEMIC_ADMIN', 'ACADEMIC_DIRECTOR']);
  const reviewId = String((request.data && request.data.reviewId) || '');
  const ref = admin.firestore().collection(REVIEWS).doc(reviewId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Review not found.');
  if (!gc.canTransition(snap.data().status, 'ARCHIVED')) fail('failed-precondition', 'Invalid transition.');
  await ref.update({ status: 'ARCHIVED', archivedBy: uid, archivedAt: new Date().toISOString() });
  await audit('CONTENT_ARCHIVED', { actorUid: uid, objectType: snap.data().subjectType, objectId: snap.data().subjectId, reviewId: reviewId, fromState: snap.data().status, toState: 'ARCHIVED' });
  return { ok: true, status: 'ARCHIVED' };
});

/* ============================================================
   Versionnement / changements
   ============================================================ */
exports.createNewVersion = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireGovRole(uid, ['CURRICULUM_AUTHOR', 'ACADEMIC_ADMIN', 'ACADEMIC_DIRECTOR']);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  const changeType = String(d.changeType || 'MINOR_ACADEMIC');
  if (gc.CHANGE_TYPES.indexOf(changeType) < 0) fail('invalid-argument', 'Invalid changeType.');
  const ref = admin.firestore().collection(REVIEWS).doc(reviewId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Review not found.');
  const review = snap.data();
  if (review.status !== 'APPROVED' && review.status !== 'PUBLISHED') fail('failed-precondition', 'Only approved/published content can be versioned.');
  const newVersion = gc.nextVersion(review.version, changeType);
  // L'ancienne version reste immuable.
  await admin.firestore().collection(VERSIONS).doc(review.subjectId + '@' + review.version).set({ immutable: true, supersededBy: review.subjectId + '@' + newVersion }, { merge: true });
  const newRef = await admin.firestore().collection(REVIEWS).add({
    subjectType: review.subjectType, subjectId: review.subjectId, programmeId: review.programmeId,
    programmeVersion: review.programmeVersion, academyCode: review.academyCode, language: review.language,
    level: review.level, version: newVersion, status: 'DRAFT', submittedBy: uid,
    subject: review.subject, completedRoles: [], revisionCount: 0,
    changeType: changeType, supersedes: review.subjectId + '@' + review.version,
    boardRequired: gc.changeRequiresBoard(changeType), createdAt: new Date().toISOString()
  });
  await admin.firestore().collection(VERSIONS).doc(review.subjectId + '@' + newVersion).set({
    objectType: review.subjectType, objectId: review.subjectId, version: newVersion,
    status: 'DRAFT', changeType: changeType, supersedes: review.subjectId + '@' + review.version, createdAt: new Date().toISOString()
  });
  await audit('NEW_VERSION_CREATED', { actorUid: uid, objectType: review.subjectType, objectId: review.subjectId, reviewId: newRef.id, version: newVersion, metadata: { changeType: changeType, previousVersion: review.version } });
  return { ok: true, reviewId: newRef.id, version: newVersion, boardRequired: gc.changeRequiresBoard(changeType) };
});

exports.emergencyCorrection = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireGovRole(uid, ['ACADEMIC_DIRECTOR', 'ACADEMIC_BOARD_MEMBER']);
  const d = request.data || {};
  const reviewId = String(d.reviewId || '');
  const reason = String(d.reason || '').trim();
  if (reason.length < 10) fail('invalid-argument', 'Emergency correction requires a detailed reason (>=10 chars).');
  const ref = admin.firestore().collection(REVIEWS).doc(reviewId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Review not found.');
  const review = snap.data();
  if (review.status !== 'PUBLISHED') fail('failed-precondition', 'Emergency correction applies to published content.');
  const newVersion = gc.nextVersion(review.version, 'EDITORIAL');
  const emRef = await admin.firestore().collection(EMERGENCY).add({
    reviewId: reviewId, subjectId: review.subjectId, originalVersion: review.version,
    newVersion: newVersion, reason: reason, authorityUid: uid, at: new Date().toISOString(),
    preservesOriginal: true
  });
  await admin.firestore().collection(VERSIONS).doc(review.subjectId + '@' + review.version).set({ immutable: true, emergencySupersededBy: review.subjectId + '@' + newVersion }, { merge: true });
  const newRef = await admin.firestore().collection(REVIEWS).add({
    subjectType: review.subjectType, subjectId: review.subjectId, programmeId: review.programmeId,
    programmeVersion: review.programmeVersion, academyCode: review.academyCode, language: review.language,
    level: review.level, version: newVersion, status: 'DRAFT', submittedBy: uid,
    subject: review.subject, completedRoles: [], revisionCount: 0,
    emergencyCorrectionId: emRef.id, supersedes: review.subjectId + '@' + review.version,
    boardRequired: true, createdAt: new Date().toISOString()
  });
  await audit('EMERGENCY_CORRECTION', { actorUid: uid, objectType: review.subjectType, objectId: review.subjectId, reviewId: reviewId, version: newVersion, reason: reason });
  return { ok: true, emergencyCorrectionId: emRef.id, newReviewId: newRef.id, newVersion: newVersion, originalPreserved: true };
});

/* ============================================================
   Appels
   ============================================================ */
exports.createAppeal = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const reason = String(d.reason || '').trim();
  if (reason.length < 5) fail('invalid-argument', 'Appeal reason required.');
  const ref = await admin.firestore().collection(APPEALS).add({
    appellantUid: uid, objectType: String(d.objectType || 'review'), objectId: String(d.objectId || ''),
    reviewId: d.reviewId || null, reason: reason, evidence: d.evidence || null,
    status: 'SUBMITTED', assignedReviewer: null, decision: null, decidedAt: null,
    originalDecisionMaker: d.originalDecisionMaker || null, createdAt: new Date().toISOString()
  });
  await audit('APPEAL_CREATED', { actorUid: uid, objectType: 'appeal', objectId: ref.id });
  return { ok: true, appealId: ref.id };
});

exports.decideAppeal = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireGovRole(uid, ['ACADEMIC_BOARD_MEMBER', 'ACADEMIC_DIRECTOR']);
  const d = request.data || {};
  const appealId = String(d.appealId || '');
  const ref = admin.firestore().collection(APPEALS).doc(appealId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Appeal not found.');
  const appeal = snap.data();
  if (appeal.originalDecisionMaker && String(appeal.originalDecisionMaker) === uid) fail('failed-precondition', 'The original decision maker cannot decide the appeal.');
  await ref.update({ status: 'DECIDED', assignedReviewer: uid, decision: String(d.decision || 'UPHELD'), rationale: String(d.rationale || ''), decidedAt: new Date().toISOString() });
  await audit('APPEAL_DECIDED', { actorUid: uid, objectType: 'appeal', objectId: appealId, metadata: { decision: d.decision || 'UPHELD' } });
  return { ok: true, status: 'DECIDED' };
});

/* ============================================================
   Tableau de bord / métriques
   ============================================================ */
exports.getReviewDashboard = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const roles = await getGovRoles(uid);
  if (!roles.length && (await authz.getUserRole(uid)) !== 'admin' && (await authz.getUserRole(uid)) !== 'system') fail('permission-denied', 'Governance access only.');
  const reviewsSnap = await admin.firestore().collection(REVIEWS).limit(500).get();
  const reviews = reviewsSnap.docs.map((x) => Object.assign({ id: x.id }, x.data()));
  const mine = reviews.filter((r) => r.submittedBy === uid);
  const assignmentsSnap = await admin.firestore().collection(ASSIGNMENTS).where('reviewerUid', '==', uid).where('status', '==', 'ASSIGNED').get();
  const assigned = assignmentsSnap.docs.map((x) => x.data());
  const issuesSnap = await admin.firestore().collection(ISSUES).limit(1000).get();
  const issues = issuesSnap.docs.map((x) => x.data());
  return {
    pendingReview: reviews.filter((r) => ['SUBMITTED_FOR_REVIEW', 'IN_REVIEW'].indexOf(r.status) >= 0).length,
    assignedToMe: assigned.length,
    revisionRequests: reviews.filter((r) => r.status === 'REVISION_REQUIRED').length,
    approved: reviews.filter((r) => r.status === 'APPROVED').length,
    published: reviews.filter((r) => r.status === 'PUBLISHED').length,
    archived: reviews.filter((r) => r.status === 'ARCHIVED').length,
    mySubmissions: mine.length,
    highSeverityIssues: issues.filter((i) => (i.severity === 'CRITICAL' || i.severity === 'MAJOR') && i.status !== 'RESOLVED').length,
    examinationReviews: reviews.filter((r) => r.subjectType === 'examination').length,
    programmeReviews: reviews.filter((r) => r.subjectType === 'programme' || r.subjectType === 'curriculum').length
  };
});

exports.getGovernanceMetrics = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireGovRole(uid, ['ACADEMIC_ADMIN', 'ACADEMIC_DIRECTOR', 'ACADEMIC_BOARD_MEMBER']);
  const reviewsSnap = await admin.firestore().collection(REVIEWS).limit(2000).get();
  const reviews = reviewsSnap.docs.map((x) => x.data());
  const issuesSnap = await admin.firestore().collection(ISSUES).limit(5000).get();
  const issues = issuesSnap.docs.map((x) => x.data());
  const versionsSnap = await admin.firestore().collection(VERSIONS).limit(2000).get();
  const pubsSnap = await admin.firestore().collection(PUBLICATIONS).limit(2000).get();
  const byStatus = {};
  for (const r of reviews) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  const revisions = reviews.filter((r) => (r.revisionCount || 0) > 0).length;
  return {
    contentAwaitingReview: reviews.filter((r) => ['SUBMITTED_FOR_REVIEW', 'IN_REVIEW'].indexOf(r.status) >= 0).length,
    byStatus: byStatus,
    revisionRate: reviews.length ? Math.round((revisions / reviews.length) * 100) : 0,
    approvalCount: reviews.filter((r) => r.status === 'APPROVED' || r.status === 'PUBLISHED').length,
    rejectionCount: reviews.filter((r) => r.rejected).length,
    unresolvedIssues: issues.filter((i) => i.status !== 'RESOLVED').length,
    criticalIssues: issues.filter((i) => i.severity === 'CRITICAL').length,
    publicationCount: pubsSnap.size,
    versionCount: versionsSnap.size,
    archivedVersions: reviews.filter((r) => r.status === 'ARCHIVED').length
  };
});

exports._collections = { GOV_ROLES, REVIEWERS, BOARD, REVIEWS, ASSIGNMENTS, ISSUES, DECISIONS, PUBLICATIONS, VERSIONS, CONFLICTS, APPEALS, EMERGENCY, AUDIT };
