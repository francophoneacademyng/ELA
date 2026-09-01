/* ============================================================
   ELA — functions/ela-certificate-core.js
   ------------------------------------------------------------
   Noyau métier de la centralisation des certificats sous ELA.
   ELA est la SEULE institution certifiante ; une académie
   (ex: Francophone Academy) demande l'émission, elle ne délivre
   rien elle-même. Ce module est utilisé par les Cloud Functions
   (ela-certificates.js) et par le trigger generateCertificate.
   Ne contient AUCUN secret. Append-only : aucune donnée supprimée.
   ============================================================ */

const crypto = require('crypto');
const admin = require('firebase-admin');
// DB lazy : permet le test unitaire des fonctions pures sans Firebase.
let _db = null;
function getDb() {
  if (!_db) {
    if (!admin.apps.length) admin.initializeApp();
    _db = admin.firestore();
  }
  return _db;
}

const CERTIFICATES = 'ela_certificates';
const EVENTS = 'ela_certificate_events';

const INSTITUTION = 'E-Learn Language Academy';
const INSTITUTION_SHORT = 'ELA';
const SIGNED_BY = 'ELA Certification Authority';
const SIGNATURE_ALGORITHM = 'SHA-256';
const VERIFY_BASE_URL = 'https://elaacademy.ng/verify.html';

/** Types de certificats ELA. */
const CERTIFICATE_TYPES = ['completion', 'achievement', 'certification'];

/** Whitelist des codes académie autorisés à demander une émission
 *  via le callable (extensible : EN, DE, ZH, AR, RU ensuite). */
const CALLABLE_ACADEMY_WHITELIST = ['FR'];

/** Codes académie + libellés (mappage des académies existantes). */
const ACADEMY_LABELS = {
  FR: 'Francophone Academy',
  EN: 'English Academy',
  DE: 'German Academy',
  ZH: 'Mandarin Academy',
  AR: 'Arabic Academy',
  RU: 'Russian Academy'
};

/** Mappage des académies internes (quiz.academy) → code ELA. */
const ACADEMY_KEY_TO_CODE = {
  french: 'FR', francophone: 'FR', fr: 'FR',
  english: 'EN', en: 'EN',
  german: 'DE', de: 'DE',
  mandarin: 'ZH', chinese: 'ZH', zh: 'ZH',
  arabic: 'AR', ar: 'AR',
  russian: 'RU', ru: 'RU'
};

const CECRL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/* ---------- Identifiant unique ---------- */

function randomToken(len) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  const buf = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += alphabet.charAt(buf[i] % alphabet.length);
  return out;
}

/** ELA-{ACADEMY_CODE}-{CECRL}-{RANDOM} — ex: ELA-FR-B1-8X92KD */
function generateCertificateId(academyCode, cecrLevel) {
  return 'ELA-' + String(academyCode).toUpperCase() + '-' +
    String(cecrLevel).toUpperCase() + '-' + randomToken(6);
}

/* ---------- Signature ---------- */

/** JSON canonique : clés triées, séparateurs compacts. */
function canonicalJson(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJson).join(',') + ']';
  return '{' + Object.keys(obj).sort().map((k) =>
    JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/* ---------- Audit trail (append-only, jamais supprimé) ---------- */

/**
 * Écrit un event dans ela_certificate_events. Ne renvoie JAMAIS
 * d'erreur bloquante (l'audit ne doit pas casser l'émission).
 */
function appendEvent(evt) {
  const doc = {
    certificateId: String(evt.certificateId || ''),
    action: String(evt.action || ''),           // ISSUED|REVOKED|REISSUED|MIGRATED
    performedBy: String(evt.performedBy || 'system'),
    performedAt: new Date().toISOString(),
    reason: evt.reason || null,
    academyCode: String(evt.academyCode || ''),
    metadata: evt.metadata || {}
  };
  return getDb().collection(EVENTS).add(doc)
    .then(() => null)
    .catch((err) => { console.error('[ELA-Cert] event write failed:', err.message); return null; });
}

module.exports = {
  CERTIFICATES, EVENTS, INSTITUTION, INSTITUTION_SHORT, SIGNED_BY,
  SIGNATURE_ALGORITHM, VERIFY_BASE_URL, CERTIFICATE_TYPES,
  CALLABLE_ACADEMY_WHITELIST, ACADEMY_LABELS, ACADEMY_KEY_TO_CODE, CECRL_LEVELS,
  generateCertificateId, canonicalJson, sha256Hex, appendEvent
};
/* ---------- Émission ---------- */

/**
 * Émet un certificat ELA (logique pure côté serveur).
 * @param {{academyCode, studentId, studentName, cecrLevel, skills?, score?,
 *          certificateType?, createdBy?, sourceQuizId?}} input
 * @returns {Promise<object>} le certificat complet écrit dans ela_certificates
 */
async function issueCertificate(input) {
  const academyCode = String(input.academyCode || '').toUpperCase();
  const cecrLevel = String(input.cecrLevel || '').toUpperCase();
  const certificateType = CERTIFICATE_TYPES.indexOf(input.certificateType) >= 0
    ? input.certificateType : 'certification';

  if (!ACADEMY_LABELS[academyCode]) throw new Error('invalid-academy-code');
  if (CECRL_LEVELS.indexOf(cecrLevel) < 0) throw new Error('invalid-cecr-level');
  if (!input.studentId || !input.studentName) throw new Error('missing-student');

  const now = new Date();
  const id = generateCertificateId(academyCode, cecrLevel);
  const issueDate = now.toISOString().slice(0, 10);
  const expiryDate = new Date(now.getTime() + 3 * 365 * 86400000).toISOString().slice(0, 10);

  const signatureHash = sha256Hex(canonicalJson({
    id: id, certificateType: certificateType, institution: INSTITUTION,
    academyCode: academyCode, studentId: String(input.studentId),
    studentName: String(input.studentName), cecrLevel: cecrLevel,
    scoreGlobal: Number(input.score) || 0, issueDate: issueDate,
    expiryDate: expiryDate, signedBy: SIGNED_BY
  }));

  const cert = {
    id: id,
    certificateType: certificateType,
    institution: INSTITUTION,
    institutionShort: INSTITUTION_SHORT,
    academyCode: academyCode,
    academyLabel: ACADEMY_LABELS[academyCode],
    studentId: String(input.studentId),
    studentName: String(input.studentName),
    // JAMAIS de studentEmail ici (donnée sensible exclue du modèle).
    cecrLevel: cecrLevel,
    skills: input.skills || {},
    scoreGlobal: Number(input.score) || 0,
    issueDate: issueDate,
    expiryDate: expiryDate,
    signedBy: SIGNED_BY,
    signatureAlgorithm: SIGNATURE_ALGORITHM,
    signatureHash: signatureHash,
    status: 'active',
    verificationUrl: VERIFY_BASE_URL + '?id=' + encodeURIComponent(id),
    pdfUrl: null,
    pdfStoragePath: null,
    credentialId: id,
    sourceQuizId: input.sourceQuizId || null,
    createdAt: now.toISOString(),
    createdBy: String(input.createdBy || 'system'),
    updatedAt: now.toISOString()
  };

  await getDb().collection(CERTIFICATES).doc(id).set(cert);
  await appendEvent({
    certificateId: id, action: 'ISSUED', performedBy: cert.createdBy,
    academyCode: academyCode,
    metadata: { certificateType: certificateType, cecrLevel: cecrLevel, sourceQuizId: cert.sourceQuizId }
  });
  return cert;
}

/** Vue publiquement sûre — JAMAIS studentId/email/skills/scores/hash. */
function publicView(cert) {
  if (!cert) return null;
  const today = new Date().toISOString().slice(0, 10);
  return {
    certificateId: cert.id,
    studentName: cert.studentName,
    institution: cert.institution,
    academyLabel: cert.academyLabel,
    cecrLevel: cert.cecrLevel,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    status: cert.status,
    valid: cert.status === 'active' && (!cert.expiryDate || cert.expiryDate >= today)
  };
}
/** Vue privée titulaire (sans hash ni email). */
function ownerView(cert) {
  if (!cert) return null;
  return {
    id: cert.id, certificateType: cert.certificateType, institution: cert.institution,
    academyLabel: cert.academyLabel, cecrLevel: cert.cecrLevel, scoreGlobal: cert.scoreGlobal,
    issueDate: cert.issueDate, expiryDate: cert.expiryDate, status: cert.status,
    verificationUrl: cert.verificationUrl, pdfUrl: cert.pdfUrl,
    pdfStoragePath: cert.pdfStoragePath
  };
}

/** Révocation (super admin ELA) + event REVOKED. */
async function revokeCertificate(id, reason, performedBy) {
  const ref = getDb().collection(CERTIFICATES).doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) throw new Error('certificate-not-found');
  await ref.update({
    status: 'revoked',
    revokedAt: new Date().toISOString(),
    revokedReason: String(reason || '').slice(0, 500),
    revokedBy: String(performedBy || 'system'),
    updatedAt: new Date().toISOString()
  });
  await appendEvent({
    certificateId: String(id), action: 'REVOKED', performedBy: performedBy,
    reason: String(reason || '').slice(0, 500),
    academyCode: (snap.data() && snap.data().academyCode) || ''
  });
  return true;
}

/** Migration one-shot d'un certificat legacy → ela_certificates (event MIGRATED). */
async function migrateLegacyCertificate(legacyId, legacy) {
  const existing = await getDb().collection(CERTIFICATES)
    .where('legacyId', '==', String(legacyId)).limit(1).get();
  if (!existing.empty) return null; // déjà migré (idempotent)

  const academyCode = ACADEMY_KEY_TO_CODE[String(legacy.academy || '').toLowerCase()] || 'FR';
  const cecrLevel = CECRL_LEVELS.indexOf(String(legacy.level || '').toUpperCase()) >= 0
    ? String(legacy.level).toUpperCase() : 'B1';
  const issued = legacy.issuedAt && legacy.issuedAt.toDate
    ? legacy.issuedAt.toDate() : new Date();

  const cert = await issueCertificate({
    academyCode: academyCode,
    studentId: String(legacy.userId || legacyId),
    studentName: String(legacy.studentName || 'Student'),
    cecrLevel: cecrLevel,
    score: legacy.percentage || 0,
    certificateType: 'achievement',
    createdBy: 'migration',
    sourceQuizId: legacy.quizId || null
  });

  await getDb().collection(CERTIFICATES).doc(cert.id).update({
    legacyId: String(legacyId),
    legacyCollection: 'certificates',
    legacyVerificationCode: legacy.verificationCode || null,
    pdfUrl: legacy.pdfUrl || null,
    issueDate: issued.toISOString().slice(0, 10)
  });
  await appendEvent({
    certificateId: cert.id, action: 'MIGRATED', performedBy: 'migration',
    academyCode: academyCode,
    metadata: { legacyId: String(legacyId), legacyCollection: 'certificates' }
  });
  // L'ancien document est marqué migré — JAMAIS supprimé.
  await getDb().collection('certificates').doc(String(legacyId))
    .update({ migratedToELA: cert.id, migratedAt: new Date().toISOString() })
    .catch(() => null);
  return cert.id;
}

module.exports.issueCertificate = issueCertificate;
module.exports.publicView = publicView;
module.exports.ownerView = ownerView;
module.exports.revokeCertificate = revokeCertificate;
module.exports.migrateLegacyCertificate = migrateLegacyCertificate;
