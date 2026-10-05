/**
 * ============================================================
 * E-Learn Language Academy (ELA) — Cloud Functions
 * ============================================================
 * RÈGLES DE SÉCURITÉ (héritées de la crise Francophone Academy) :
 * - AUCUNE clé secrète dans ce fichier ni dans le frontend
 * - Toutes les clés vivent dans functions/.env (jamais commité)
 * - 2nd-gen functions chargent automatiquement le .env
 * - Répondre TOUJOURS "N" aux invites Firebase qui proposent
 *   de supprimer des index ou des fonctions
 * ============================================================
 *
 * JALON 1 : squelette + santé du système (healthCheck).
 * JALON 2 : paiements Paystack.
 *   - initializePayment    (callable)  : initie un paiement côté serveur
 *   - verifyPaystackPayment(callable)  : vérifie un paiement côté serveur
 *   - paystackWebhook      (onRequest) : reçoit charge.success (idempotent)
 *   Les montants sont TOUJOURS recalculés côté serveur (table canonique),
 *   jamais depuis le client. Le secret vit dans functions/.env uniquement.
 * JALON 3 : assistantChat (Learning Assistant multi-langue, clé OpenRouter serveur).
 * JALON 4 : processReferral (filleul -15000 NGN 1er mois, parrain +10000 NGN).
 * JALON 5 : checkSubscriptionExpiry + notifications.
 * ============================================================
 */

const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
// Imports scheduler/firestore retirés : non utilisés dans ce fichier
// (chaque require v2 coûte ~1-2 s au chargement — fix timeout déploiement).
const crypto = require('crypto');
const admin = require('firebase-admin');

admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'ela-academy-7f868' });
// Firestore chargé PARESSEUSEMENT (fix timeout déploiement) : `admin.firestore()`
// charge toute la stack gRPC (~5 s). Un Proxy reporte ce coût au premier appel
// réel, le chargement du module reste < 10 s (limite de détection du CLI).
const db = new Proxy({}, {
  get: function (_t, prop) {
    return admin.firestore()[prop];
  }
});

const REGION = 'africa-south1';
const PAYSTACK_BASE = 'https://api.paystack.co';
const DEFAULT_CALLBACK_URL = 'https://elaacademy.ng/#/payment/result';

/**
 * Grille tarifaire canonique (NGN) — source de vérité côté serveur.
 * Le montant facturé/validé est TOUJOURS lu ici, jamais depuis le client.
 */
const PRICE_TABLE = {
  general:  { 1: 75000,  3: 200000, 6: 405000 },
  premium:  { 1: 120000, 3: 320000, 6: 648000 },
  business: { 1: 150000, 3: 420000, 6: 840000 }
};

function getAmountNaira(plan, duration) {
  const p = PRICE_TABLE[plan];
  if (!p) return null;
  const amount = p[duration];
  return amount ? amount : null;
}

function paystackSecret() {
  const secret = process.env.PAYSTACK_SECRET;
  if (!secret) throw new HttpsError('internal', 'Paystack is not configured.');
  return secret;
}

/* ============================================================
   JALON 4 — Parrainage
   - filleul : -15000 NGN sur son PREMIER paiement (jamais sous 0)
   - parrain : +10000 NGN de crédit académique (referralCredit)
   - crédit utilisé en priorité sur les paiements suivants
   ============================================================ */
const REFERRAL_DISCOUNT = 15000;
const REFERRAL_CREDIT = 10000;

async function findUserByReferralCode(code) {
  const snap = await db.collection('users').where('referralCode', '==', code).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, data: doc.data() };
}

async function computePricing(uid, plan, duration, referralCode) {
  const base = getAmountNaira(plan, duration);
  if (!base) return null;

  const userSnap = await db.collection('users').doc(uid).get();
  const user = userSnap.exists ? userSnap.data() : {};

  const firstPayment = !user.firstPaymentDone;
  const credit = user.referralCredit || 0;

  let discount = 0;
  let creditUsed = 0;
  let referrerUid = null;
  let codeValid = null;
  let error = null;

  const code = String(referralCode || user.referralCodeUsed || '').trim();
  if (code && firstPayment) {
    const referrer = await findUserByReferralCode(code);
    if (!referrer) {
      error = 'invalid-referral-code';
    } else if (referrer.uid === uid) {
      error = 'self-referral-not-allowed';
    } else {
      codeValid = true;
      referrerUid = referrer.uid;
      discount = REFERRAL_DISCOUNT;
    }
  }

  if (!firstPayment && credit > 0) {
    creditUsed = Math.min(credit, Math.max(0, base - discount));
  }

  const total = Math.max(0, base - discount - creditUsed);
  return { base, discount, creditUsed, total, firstPayment, credit, referrerUid, codeValid, error };
}

/** Health check — vérifier que les fonctions répondent après déploiement */

const core = require('./core');
const assessment = require('./assessment');
const eligibility = require('./eligibility');
const quizbank = require('./quizbank');
const payment = require('./payment');
const auth = require('./auth');
const live = require('./live');
const adm = require('./admin');
const certificate = require('./certificate');
const nurture = require('./nurture');
// TODO: Restaurer quand le refactor certificats/curriculum sera terminé.
// (fichiers supprimés encore référencés : ela-certificate-core.js, ela-pdf.js,
// curriculum.js, curriculum-quizzes.js, seed-a1/* — via teacher/ela-certificates)
const teacher = require('./teacher');
// const elaCert = require('./ela-certificates');

exports.healthCheck = core.healthCheck;
exports.learningAssistant = core.learningAssistant;
exports.getDashboardData = core.getDashboardData;
exports.seedAcademyA1 = core.seedAcademyA1;
exports.getTrialLessons = core.getTrialLessons;
exports.getMyAcademies = core.getMyAcademies;
exports.seedCurriculum = core.seedCurriculum;
exports.seedAcademyTree = core.seedAcademyTree;
exports.getAcademyTree = core.getAcademyTree;
exports.getCatalog = core.getCatalog;
exports.getQuizCatalog = core.getQuizCatalog;
exports.getPublicQuiz = core.getPublicQuiz;
exports.getCourse = core.getCourse;

exports.initializePayment = payment.initializePayment;
exports.previewPayment = payment.previewPayment;
exports.verifyPaystackPayment = payment.verifyPaystackPayment;
exports.paystackWebhook = payment.paystackWebhook;

exports.checkSubscriptionExpiry = auth.checkSubscriptionExpiry;
exports.setUserRole = auth.setUserRole;
exports.createAccount = auth.createAccount;
exports.checkEmailUnique = auth.checkEmailUnique;
exports.ensureProfile = auth.ensureProfile;

exports.getLiveMeetingLink = live.getLiveMeetingLink;
exports.getLiveCatalog = live.getLiveCatalog;
exports.seedLiveClasses = live.seedLiveClasses;

const jaas = require('./jaas');
exports.getJaasToken = jaas.getJaasToken;

const liveClasses = require('./liveClasses');
exports.setAssignedStudents = liveClasses.setAssignedStudents;
exports.listEligibleStudents = liveClasses.listEligibleStudents;

exports.getAdminQueue = adm.getAdminQueue;
exports.reviewContent = adm.reviewContent;
exports.getAdminPanelData = adm.getAdminPanelData;
exports.submitContent = adm.submitContent;
/* updateUserProfile : version étendue (management.js) — plan, durée,
   révocation d'abonnement. Remplace la version limitée de admin.js. */
const mgmt = require('./management');
exports.updateUserProfile = mgmt.updateUserProfile;
exports.getContentStats = mgmt.getContentStats;
exports.createCustomInvoice = mgmt.createCustomInvoice;
exports.getInvoiceList = mgmt.getInvoiceList;
exports.getWhatsAppLogs = mgmt.getWhatsAppLogs;

exports.generateCertificate = certificate.generateCertificate;
// PHASE 1B (local, non déployé) : socle d'évaluation sécurisée.
// Le trigger historique generateCertificate (quizScores) reste INCHANGÉ
// en production ; la bascule vers results fera l'objet d'un plan dédié.
exports.startAssessmentAttempt = assessment.startAssessmentAttempt;
exports.submitAssessmentAttempt = assessment.submitAssessmentAttempt;
exports.checkAssessmentEligibility = eligibility.checkAssessmentEligibility;
exports.issueCertificateFromResult = eligibility.issueCertificateFromResult; // PHASE 2C local : émission transactionnelle (admin) depuis un result
exports.publishQuizBank = quizbank.publishQuizBank; // PHASE 1B local : staff-only, non déployé
/* PHASE 2A/2C — fichiers moteur restaurés (ela-certificate-core.js, ela-pdf.js) :
   on recâble les fonctions certificat ELA (additif — aucune suppression). */
const elaCert = require('./ela-certificates');
exports.issueELACertificate = elaCert.issueELACertificate;
exports.verifyELACertificate = elaCert.verifyELACertificate;
exports.listELACertificates = elaCert.listELACertificates;
exports.revokeELACertificate = elaCert.revokeELACertificate;
exports.reissueELACertificate = elaCert.reissueELACertificate; // PHASE 2C local
exports.migrateLegacyCertificates = elaCert.migrateLegacyCertificates;
exports.generateELACertificatePdf = elaCert.generateELACertificatePdf;
exports.getELACertificatePdfUrl = elaCert.getELACertificatePdfUrl;
exports.runCertificateAuditReconciliation = elaCert.runCertificateAuditReconciliation; // PHASE 2C local

/* ============================================================
   PROGRAMME INSTITUTIONNEL — Phases 3 à 7 (local, non déployé)
   Moteur académique, personnel, présence, examens, certification.
   Additif : n'altère aucun flux existant.
   ============================================================ */
const academic = require('./academic');
exports.createProgramme = academic.createProgramme;
exports.publishProgrammeVersion = academic.publishProgrammeVersion;
exports.getProgrammeCatalog = academic.getProgrammeCatalog;
exports.getProgramme = academic.getProgramme;
exports.enrollStudent = academic.enrollStudent;
exports.updateEnrollmentStatus = academic.updateEnrollmentStatus;
exports.reEnrollStudent = academic.reEnrollStudent;
exports.recordLessonCompletion = academic.recordLessonCompletion;
exports.getAcademicRecord = academic.getAcademicRecord;
exports.generateTranscript = academic.generateTranscript;
exports.seedProgrammeCatalog = academic.seedProgrammeCatalog;

const staff = require('./staff');
exports.submitTeacherApplication = staff.submitTeacherApplication;
exports.reviewTeacherApplication = staff.reviewTeacherApplication;
exports.getTeacherProfile = staff.getTeacherProfile;
exports.updateTeacherProfile = staff.updateTeacherProfile;
exports.authorizeExaminer = staff.authorizeExaminer;
exports.revokeExaminer = staff.revokeExaminer;
exports.getExaminerAuthorization = staff.getExaminerAuthorization;
exports.setUserRoleAudited = staff.setUserRoleAudited;
exports.listStaff = staff.listStaff;

const attendance = require('./attendance');
exports.scheduleClassSession = attendance.scheduleClassSession;
exports.startClassSession = attendance.startClassSession;
exports.joinClassSession = attendance.joinClassSession;
exports.leaveClassSession = attendance.leaveClassSession;
exports.endClassSession = attendance.endClassSession;
exports.validateAttendance = attendance.validateAttendance;
exports.correctAttendance = attendance.correctAttendance;
exports.getAttendanceReport = attendance.getAttendanceReport;
exports.listClassSessions = attendance.listClassSessions;

const examination = require('./examination');
exports.createExamination = examination.createExamination;
exports.publishExaminationVersion = examination.publishExaminationVersion;
exports.getExamination = examination.getExamination;
exports.listExaminations = examination.listExaminations;
exports.registerExaminationCandidate = examination.registerExaminationCandidate;
exports.startExaminationAttempt = examination.startExaminationAttempt;
exports.submitExaminationSection = examination.submitExaminationSection;
exports.assignExaminer = examination.assignExaminer;
exports.getExaminationQueue = examination.getExaminationQueue;
exports.gradeExaminationSection = examination.gradeExaminationSection;
exports.moderateExaminationResult = examination.moderateExaminationResult;
exports.finalizeExaminationResult = examination.finalizeExaminationResult;
exports.getExaminationResult = examination.getExaminationResult;
exports.correctExaminationResult = examination.correctExaminationResult;

const certification = require('./certification');
exports.evaluateCertificationEligibility = certification.evaluateCertificationEligibility;
exports.issueCertificateFromAcademicRecord = certification.issueCertificateFromAcademicRecord;

const curriculum = require('./curriculum');
exports.seedAcademicFramework = curriculum.seedAcademicFramework;
exports.getProgrammeDefinition = curriculum.getProgrammeDefinition;
exports.getCurriculum = curriculum.getCurriculum;
exports.validateCurriculumCallable = curriculum.validateCurriculumCallable;
exports.getContentStatusReport = curriculum.getContentStatusReport;
exports.auditLessonContentQuality = curriculum.auditLessonContentQuality;

/* ============================================================
   GOUVERNANCE ACADÉMIQUE INTERNE (serveur uniquement)
   ============================================================ */
const governance = require('./governance');
exports.setGovernanceRole = governance.setGovernanceRole;
exports.getGovernanceProfile = governance.getGovernanceProfile;
exports.registerReviewerProfile = governance.registerReviewerProfile;
exports.verifyReviewerProfile = governance.verifyReviewerProfile;
exports.appointBoardMember = governance.appointBoardMember;
exports.submitForReview = governance.submitForReview;
exports.assignReviewer = governance.assignReviewer;
exports.declareConflict = governance.declareConflict;
exports.addReviewIssue = governance.addReviewIssue;
exports.resolveIssue = governance.resolveIssue;
exports.submitReviewDecision = governance.submitReviewDecision;
exports.resubmitForReview = governance.resubmitForReview;
exports.approveContent = governance.approveContent;
exports.publishContent = governance.publishContent;
exports.archiveContent = governance.archiveContent;
exports.createNewVersion = governance.createNewVersion;
exports.emergencyCorrection = governance.emergencyCorrection;
exports.createAppeal = governance.createAppeal;
exports.decideAppeal = governance.decideAppeal;
exports.getReviewDashboard = governance.getReviewDashboard;
exports.getGovernanceMetrics = governance.getGovernanceMetrics;
exports.getTraceabilityMatrix = curriculum.getTraceabilityMatrix;
exports.publishProgrammeContent = curriculum.publishProgrammeContent;
/* Mission 7 — Nurturing email des leads (envoi désactivé par défaut :
   NURTURE_SEND_ENABLED doit valoir "true"). */
exports.nurtureOnLeadCreated = nurture.nurtureOnLeadCreated;
exports.nurtureScheduler = nurture.nurtureScheduler;
exports.nurtureOnUserCreated = nurture.nurtureOnUserCreated;
exports.nurtureOnSubscriptionActive = nurture.nurtureOnSubscriptionActive;
exports.nurtureUnsubscribe = nurture.nurtureUnsubscribe;
// TODO: Restaurer quand le refactor certificats/curriculum sera terminé.
// (exports portés par teacher.js / ela-certificates.js → fichiers supprimés)
// exports.listELACertificates = elaCert.listELACertificates;
// exports.revokeELACertificate = elaCert.revokeELACertificate;

// exports.getTeacherStats = teacher.getTeacherStats;
exports.getTeacherStats = teacher.getTeacherStats;

