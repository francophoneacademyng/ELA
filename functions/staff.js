/* ============================================================
   ELA — functions/staff.js
   ------------------------------------------------------------
   Phase 4 — Professeurs, examinateurs, gestion des rôles.
   Collections :
     teacher_profiles, examiner_authorizations, staff_applications
   Règles :
     - un utilisateur ne peut pas modifier son propre rôle ;
     - toute modification de rôle est journalisée (role_audit_events) ;
     - l'autorisation d'examinateur est DISTINCTE du statut professeur ;
     - un professeur ne modifie que des champs de profil non privilégiés.
   ============================================================ */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { callable } = require('./callable.js');
const admin = require('firebase-admin');
const inst = require('./institution.js');
const authz = require('./authz.js');

const REGION = 'africa-south1';
const TEACHER_PROFILES = 'teacher_profiles';
const EXAMINER_AUTH = 'examiner_authorizations';
const APPLICATIONS = 'staff_applications';

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

const SELF_EDITABLE_FIELDS = ['legalName', 'displayName', 'photoUrl', 'bio', 'languages', 'subjects', 'yearsExperience', 'qualifications', 'certificates', 'cvUrl', 'phone', 'country'];

/* ---------- Teacher application / approval workflow ---------- */

exports.submitTeacherApplication = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  if (!d.legalName || String(d.legalName).trim().length < 3) fail('invalid-argument', 'Legal name required.');
  const languages = Array.isArray(d.languages) ? d.languages.map(String) : [];
  if (!languages.length) fail('invalid-argument', 'At least one language specialization required.');
  const application = {
    uid: uid,
    legalName: String(d.legalName).slice(0, 160),
    languages: languages,
    subjects: Array.isArray(d.subjects) ? d.subjects.map(String) : [],
    yearsExperience: Number(d.yearsExperience) || 0,
    qualifications: Array.isArray(d.qualifications) ? d.qualifications : [],
    teachingQualifications: Array.isArray(d.teachingQualifications) ? d.teachingQualifications : [],
    certificates: Array.isArray(d.certificates) ? d.certificates : [],
    cvUrl: d.cvUrl || null,
    photoUrl: d.photoUrl || null,
    identityVerificationStatus: 'unverified',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    reviewReason: null
  };
  const ref = await admin.firestore().collection(APPLICATIONS).add(application);
  return { ok: true, applicationId: ref.id, status: 'pending' };
});

exports.reviewTeacherApplication = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const appId = String(d.applicationId || '');
  const decision = String(d.decision || '');
  if (['approved', 'rejected', 'review_required'].indexOf(decision) < 0) fail('invalid-argument', 'decision must be approved|rejected|review_required.');
  const ref = admin.firestore().collection(APPLICATIONS).doc(appId);
  const snap = await ref.get();
  if (!snap.exists) fail('not-found', 'Application not found.');
  const app = snap.data();
  await ref.update({
    status: decision, reviewedAt: new Date().toISOString(), reviewedBy: uid,
    reviewReason: d.reason || null
  });
  if (decision === 'approved') {
    const profileRef = admin.firestore().collection(TEACHER_PROFILES).doc(app.uid);
    await profileRef.set({
      uid: app.uid,
      legalName: app.legalName,
      displayName: app.legalName,
      languages: app.languages || [],
      subjects: app.subjects || [],
      yearsExperience: app.yearsExperience || 0,
      qualifications: app.qualifications || [],
      teachingQualifications: app.teachingQualifications || [],
      certificates: app.certificates || [],
      cvUrl: app.cvUrl || null,
      photoUrl: app.photoUrl || null,
      identityVerificationStatus: app.identityVerificationStatus || 'unverified',
      approvalStatus: 'approved',
      active: true,
      approvedAt: new Date().toISOString(),
      approvedBy: uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    const prevRole = await authz.getUserRole(app.uid);
    await admin.firestore().collection('users').doc(app.uid).set({ role: 'teacher' }, { merge: true });
    await authz.writeRoleAudit({ targetUid: app.uid, actorUid: uid, action: 'TEACHER_APPROVED', fromRole: prevRole, toRole: 'teacher', reason: d.reason || null, metadata: { applicationId: appId } });
  }
  return { ok: true, status: decision };
});

exports.getTeacherProfile = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const role = await authz.getUserRole(uid);
  const targetUid = String((request.data && request.data.uid) || uid);
  if (targetUid !== uid && role !== 'admin' && role !== 'system') fail('permission-denied', 'Profile not accessible.');
  const snap = await admin.firestore().collection(TEACHER_PROFILES).doc(targetUid).get();
  return { profile: snap.exists ? snap.data() : null };
});

exports.updateTeacherProfile = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const d = request.data || {};
  const ref = admin.firestore().collection(TEACHER_PROFILES).doc(uid);
  const snap = await ref.get();
  if (!snap.exists) fail('failed-precondition', 'Teacher profile not found.');
  const patch = {};
  for (const k of SELF_EDITABLE_FIELDS) if (d[k] !== undefined) patch[k] = d[k];
  if (!Object.keys(patch).length) fail('invalid-argument', 'No editable fields supplied.');
  // Interdiction absolue de s'auto-attribuer un statut privilégié.
  for (const forbidden of ['approvalStatus', 'role', 'active', 'identityVerificationStatus']) {
    if (d[forbidden] !== undefined) fail('permission-denied', 'Field not self-editable: ' + forbidden);
  }
  patch.updatedAt = new Date().toISOString();
  await ref.update(patch);
  return { ok: true, updated: Object.keys(patch) };
});

/* ---------- Examiner authorization (separate from teacher) ---------- */

exports.authorizeExaminer = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const targetUid = String(d.uid || '');
  if (!targetUid) fail('invalid-argument', 'uid required.');
  const skills = Array.isArray(d.skills) ? d.skills.map(String) : [];
  const validSkills = skills.filter((s) => inst.EXAM_SKILLS.indexOf(s) >= 0);
  if (!validSkills.length) fail('invalid-argument', 'At least one valid examination skill required.');
  const academies = Array.isArray(d.academies) ? d.academies.map((c) => String(c).toUpperCase()).filter(inst.isValidAcademy) : [];
  const auth = {
    uid: targetUid,
    skills: validSkills,
    academies: academies,
    authorized: true,
    authorizedBy: uid,
    authorizedAt: new Date().toISOString(),
    expiresAt: d.expiresAt || null,
    updatedAt: new Date().toISOString()
  };
  await admin.firestore().collection(EXAMINER_AUTH).doc(targetUid).set(auth, { merge: true });
  const prevRole = await authz.getUserRole(targetUid);
  await admin.firestore().collection('users').doc(targetUid).set({ examiner: true }, { merge: true });
  await authz.writeRoleAudit({ targetUid: targetUid, actorUid: uid, action: 'EXAMINER_AUTHORIZED', fromRole: prevRole, toRole: prevRole, reason: d.reason || null, metadata: { skills: validSkills, academies: academies } });
  return { ok: true, authorization: auth };
});

exports.revokeExaminer = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const targetUid = String((request.data && request.data.uid) || '');
  if (!targetUid) fail('invalid-argument', 'uid required.');
  await admin.firestore().collection(EXAMINER_AUTH).doc(targetUid).set({
    authorized: false, revokedBy: uid, revokedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }, { merge: true });
  await admin.firestore().collection('users').doc(targetUid).set({ examiner: false }, { merge: true });
  await authz.writeRoleAudit({ targetUid: targetUid, actorUid: uid, action: 'EXAMINER_REVOKED', reason: (request.data && request.data.reason) || null });
  return { ok: true };
});

exports.getExaminerAuthorization = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const targetUid = String((request.data && request.data.uid) || uid);
  const role = await authz.getUserRole(uid);
  if (targetUid !== uid && role !== 'admin' && role !== 'system') fail('permission-denied', 'Not accessible.');
  const snap = await admin.firestore().collection(EXAMINER_AUTH).doc(targetUid).get();
  return { authorization: snap.exists ? snap.data() : null };
});

/* ---------- Role management (audited) ---------- */

exports.setUserRoleAudited = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const d = request.data || {};
  const targetUid = String(d.uid || '');
  const toRole = String(d.role || '');
  if (!targetUid) fail('invalid-argument', 'uid required.');
  if (inst.ROLES.indexOf(toRole) < 0) fail('invalid-argument', 'Invalid role.');
  if (toRole === 'system') fail('permission-denied', 'system role cannot be assigned via client.');
  const fromRole = await authz.getUserRole(targetUid);
  await admin.firestore().collection('users').doc(targetUid).set({ role: toRole }, { merge: true });
  await authz.writeRoleAudit({ targetUid: targetUid, actorUid: uid, action: 'ROLE_CHANGED', fromRole: fromRole, toRole: toRole, reason: d.reason || null });
  return { ok: true, fromRole: fromRole, toRole: toRole };
});

exports.listStaff = callable({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  await requireAdmin(uid);
  const profiles = await admin.firestore().collection(TEACHER_PROFILES).limit(500).get();
  const examiners = await admin.firestore().collection(EXAMINER_AUTH).limit(500).get();
  return {
    teachers: profiles.docs.map((d) => d.data()),
    examiners: examiners.docs.map((d) => d.data())
  };
});

exports._collections = { TEACHER_PROFILES, EXAMINER_AUTH, APPLICATIONS };
