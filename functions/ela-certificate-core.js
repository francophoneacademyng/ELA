/* ============================================================
   ELA — functions/ela-certificate-core.js   (Phase 2C — local)
   ------------------------------------------------------------
   Noyau métier de la centralisation des certificats sous ELA.
   ELA est la SEULE institution certifiante ; une académie
   (ex: Francophone Academy) demande l'émission, elle ne délivre
   rien elle-même. Ce module est utilisé par les Cloud Functions
   (ela-certificates.js, eligibility.js) et le trigger.
   Ne contient AUCUN secret. Append-only : aucune donnée supprimée.

   PHASE 2C — durcissements locaux (aucun changement du format
   historique des enregistrements existants) :
   1. buildCertificateRecord() — assemble les champs FINAUX puis
      calcule l'empreinte d'intégrité. Garantit hash == champs finaux.
   2. issueCertificate() — émission normale (compat. historique).
   3. migrateLegacyCertificate() — plus aucun écrasement d'issueDate
      post-hash ; champs définitifs figés AVANT l'empreinte.
   4. reissueCertificate() — réémission liée, hash sémantiquement
      préservé, acteur + motif + REISSUED.
   5. revokeCertificate() — idempotent.
   6. reconcileCertificateAudit() — quorum d'audit (ISSUED/RECONCILED).
   7. assertImmutableFields() — garde d'immutabilité.
   8. Traçabilité source : sourceAttemptId, sourceResultId,
      programmeId, examinationId, schemaVersion.
   ============================================================ */

const crypto = require('crypto');
const admin = require('firebase-admin');

/* ---------- Accès base (paresseux) — pour tests unitaires purs ---------- */
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
const GRANTS = 'certificate_grants';

const INSTITUTION = 'E-Learn Language Academy';
const INSTITUTION_SHORT = 'ELA';
const SIGNED_BY = 'ELA Certification Authority';
/* Terminologie exacte (Phase 2B/2C) : empreinte d'intégrité SHA-256,
   PAS une signature cryptographique (aucune clé privée impliquée). */
const SIGNATURE_ALGORITHM = 'SHA-256'; // empreinte d'intégrité, pas une signature à clé
const VERIFY_BASE_URL = 'https://elaacademy.ng/verify.html';
const SCHEMA_VERSION = 2; // 1 = moteur historique ; 2 = traceabilité source (Phase 2C)

const CERTIFICATE_TYPES = ['completion', 'achievement', 'certification'];

const CALLABLE_ACADEMY_WHITELIST = ['FR'];

const ACADEMY_LABELS = {
  FR: 'Francophone Academy',
  EN: 'English Academy',
  DE: 'German Academy',
  ZH: 'Mandarin Academy',
  AR: 'Arabic Academy',
  RU: 'Russian Academy'
};

const ACADEMY_KEY_TO_CODE = {
  french: 'FR', francophone: 'FR', fr: 'FR',
  english: 'EN', en: 'EN',
  german: 'DE', de: 'DE',
  mandarin: 'ZH', chinese: 'ZH', zh: 'ZH',
  arabic: 'AR', ar: 'AR',
  russian: 'RU', ru: 'RU'
};

const CECRL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/* Champs certifiés immuables après émission (hors cycle de vie). */
const IMMUTABLE_FIELDS = [
  'id', 'studentId', 'studentName', 'academyCode', 'academyLabel',
  'language', 'cecrLevel', 'certificateType', 'scoreGlobal',
  'issueDate', 'expiryDate', 'signatureHash', 'verificationUrl',
  'credentialId', 'sourceQuizId', 'sourceAttemptId', 'sourceResultId',
  'programmeId', 'examinationId', 'schemaVersion'
];

/* Champs de cycle de vie seuls modifiables par opération contrôlée. */
const LIFECYCLE_FIELDS = ['status', 'revokedAt', 'revokedReason', 'revokedBy', 'supersededBy'];

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

/* ---------- Empreinte d'intégrité ---------- */

/** JSON canonique : clés triées, séparateurs compacts, déterministe. */
function canonicalJson(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJson).join(',') + ']';
  return '{' + Object.keys(obj).sort().map((k) =>
    JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/** Entrée canonique de l'empreinte sur les CHAMPS CERTIFIÉS finaux.
 *  Ne contient ni email, ni PDF, ni métadonnées opérationnelles. */
function integrityInput(facts) {
  return {
    id: facts.id,
    certificateType: facts.certificateType,
    institution: INSTITUTION,
    academyCode: facts.academyCode,
    studentId: facts.studentId,
    studentName: facts.studentName,
    cecrLevel: facts.cecrLevel,
    scoreGlobal: facts.scoreGlobal,
    issueDate: facts.issueDate,
    expiryDate: facts.expiryDate,
    signedBy: SIGNED_BY
  };
}

/** Empreinte d'intégrité déterministe d'un certificat (champs certifiés finaux). */
function computeIntegrityHash(facts) {
  return sha256Hex(canonicalJson(integrityInput(facts)));
}

/* ---------- Authenticité serveur (Phase 7) ----------
   Le moteur historique (schemaVersion 1/2) utilise une empreinte SHA-256
   d'intégrité (PAS une signature). Pour les NOUVEAUX certificats, on ajoute
   une authentification HMAC-SHA256 calculée côté serveur avec une clé qui
   ne quitte jamais le serveur (functions/.env → ELA_CERT_SIGNING_KEY).
   Compatibilité historique : si aucune clé n'est configurée, on retombe
   exactement sur le comportement historique (empreinte SHA-256 seule), donc
   AUCUN hash historique n'est modifié et les certificats existants restent
   vérifiables. La clé HMAC n'est jamais incluse dans le document. */
const SIGNING_ALGORITHM = 'HMAC-SHA256';

function hmacHex(message, key) {
  return crypto.createHmac('sha256', String(key)).update(String(message), 'utf8').digest('hex');
}

function signingKey(opts) {
  const k = (opts && opts.signingKey) || process.env.ELA_CERT_SIGNING_KEY || '';
  return k ? String(k) : '';
}

/** Calcule empreinte d'intégrité + éventuelle authentification HMAC. */
function computeAuthenticity(facts, opts) {
  const integrityHash = computeIntegrityHash(facts);
  const key = signingKey(opts);
  if (key) {
    return {
      signatureHash: integrityHash,
      signature: hmacHex(integrityHash, key),
      signatureAlgorithm: SIGNING_ALGORITHM,
      authenticity: 'hmac'
    };
  }
  return {
    signatureHash: integrityHash,
    signature: null,
    signatureAlgorithm: SIGNATURE_ALGORITHM,
    authenticity: 'integrity-only'
  };
}

/** Vérifie l'intégrité (SHA-256) et, si présente, l'authenticité HMAC.
 *  Compatible avec les certificats historiques (signature absente). */
function verifyCertificateIntegrity(cert, opts) {
  if (!cert) return { valid: false, reason: 'missing-certificate', integrity: false, authenticity: 'none' };
  const facts = {
    id: cert.id, certificateType: cert.certificateType, academyCode: cert.academyCode,
    studentId: cert.studentId, studentName: cert.studentName, cecrLevel: cert.cecrLevel,
    scoreGlobal: cert.scoreGlobal, issueDate: cert.issueDate, expiryDate: cert.expiryDate
  };
  const expected = computeIntegrityHash(facts);
  const integrity = expected === cert.signatureHash;
  if (!integrity) return { valid: false, reason: 'integrity-mismatch', integrity: false, authenticity: cert.signature ? 'hmac' : 'integrity-only' };
  if (!cert.signature) return { valid: true, reason: 'integrity-ok', integrity: true, authenticity: 'integrity-only' };
  const key = signingKey(opts);
  if (!key) return { valid: true, reason: 'integrity-ok-key-unavailable', integrity: true, authenticity: 'hmac-unverifiable' };
  const authenticity = hmacHex(expected, key) === cert.signature;
  return { valid: authenticity, reason: authenticity ? 'hmac-ok' : 'hmac-mismatch', integrity: true, authenticity: authenticity ? 'hmac' : 'hmac-invalid' };
}

/* États de vérification publique (Phase 7C). */
const VERIFICATION_STATES = ['VALID', 'REVOKED', 'SUPERSEDED', 'REISSUED', 'EXPIRED', 'NOT_FOUND', 'INTEGRITY_FAILURE'];

/** Classe un certificat pour la vérification publique. Aucune donnée privée. */
function classifyVerification(cert, integrity) {
  if (!cert) return 'NOT_FOUND';
  if (integrity && integrity.integrity === false) return 'INTEGRITY_FAILURE';
  if ((cert.status || '') === 'revoked') return 'REVOKED';
  if (cert.supersededBy) return 'SUPERSEDED';
  if (cert.reissueOf || (cert.extraMetadata && cert.extraMetadata.reissueOf)) return 'REISSUED';
  const today = new Date().toISOString().slice(0, 10);
  if (cert.expiryDate && cert.expiryDate < today) return 'EXPIRED';
  return 'VALID';
}


/* ---------- Audit trail (append-only, jamais supprimé) ---------- */

/** Écrit un event dans ela_certificate_events. Non-bloquant (l'audit ne doit
 *  pas casser une émission), mais tout certificat doit pouvoir être rapproché
 *  d'un event de quorum (ISSUED / RECONCILED_ISSUED). */
function appendEvent(evt) {
  const doc = {
    certificateId: String(evt.certificateId || ''),
    action: String(evt.action || ''),   // ISSUED|REVOKED|REISSUED|MIGRATED|RECONCILED_ISSUED
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

/** Vérifie qu'une transaction ne modifie AUCUN champ immuable. */
function assertImmutableFields(prev, next) {
  if (!prev || !next) return;
  for (const k of IMMUTABLE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(next, k)) continue;
    if (String(prev[k] === undefined ? '' : prev[k]) !== String(next[k] === undefined ? '' : next[k])) {
      throw new Error('immutable-field-changed:' + k);
    }
  }
}

/* ---------- Assembleur de certificat (PUR : aucun accès DB) ---------- */

/**
 * Assemble les champs FINAUX du certificat PUIS calcule l'empreinte
 * d'intégrité sur ces champs. Aucun champ n'est modifié après le hash —
 * c'est le point de garantie hash == champs finaux.
 */
function buildCertificateRecord(o) {
  const academyCode = String(o.academyCode || '').toUpperCase();
  const cecrLevel = String(o.cecrLevel || '').toUpperCase();
  const certificateType = CERTIFICATE_TYPES.indexOf(o.certificateType) >= 0
    ? o.certificateType : 'certification';

  if (!ACADEMY_LABELS[academyCode]) throw new Error('invalid-academy-code');
  if (CECRL_LEVELS.indexOf(cecrLevel) < 0) throw new Error('invalid-cecr-level');
  if (!o.studentId || !o.studentName) throw new Error('missing-student');

  const hasExplicitDate = o.issueDate && /\d{4}-\d{2}-\d{2}/.test(String(o.issueDate));
  const issueBase = hasExplicitDate ? new Date(String(o.issueDate) + 'T00:00:00Z') : new Date();
  const id = generateCertificateId(academyCode, cecrLevel);
  const issueDate = hasExplicitDate ? String(o.issueDate) : issueBase.toISOString().slice(0, 10);
  const expiryDate = (o.expiryDate && /\d{4}-\d{2}-\d{2}/.test(String(o.expiryDate)))
    ? String(o.expiryDate)
    : new Date(issueBase.getTime() + 3 * 365 * 86400000).toISOString().slice(0, 10);

  const scoreGlobal = Number(o.score) || 0;
  const studentId = String(o.studentId);
  const studentName = String(o.studentName);
  const authenticity = computeAuthenticity({
    id: id, certificateType: certificateType, academyCode: academyCode,
    studentId: studentId, studentName: studentName, cecrLevel: cecrLevel,
    scoreGlobal: scoreGlobal, issueDate: issueDate, expiryDate: expiryDate
  }, o);

  const cert = {
    id: id,
    certificateType: certificateType,
    institution: INSTITUTION,
    institutionShort: INSTITUTION_SHORT,
    academyCode: academyCode,
    academyLabel: ACADEMY_LABELS[academyCode],
    language: String(o.language || academyCode),
    studentId: studentId,
    studentName: studentName,
    // JAMAIS de studentEmail ici (donnée sensible exclue du modèle).
    cecrLevel: cecrLevel,
    skills: o.skills || {},
    scoreGlobal: scoreGlobal,
    issueDate: issueDate,
    expiryDate: expiryDate,
    signedBy: SIGNED_BY,
    signatureAlgorithm: authenticity.signatureAlgorithm,
    signatureHash: authenticity.signatureHash,
    signature: authenticity.signature,
    authenticity: authenticity.authenticity,
    status: 'active',
    verificationUrl: VERIFY_BASE_URL + '?id=' + encodeURIComponent(id),
    pdfUrl: null,
    pdfStoragePath: null,
    credentialId: id,
    sourceQuizId: o.sourceQuizId || null,
    // Traceabilité source (Phase 2C) — absente sur l'historique.
    sourceAttemptId: o.sourceAttemptId || null,
    sourceResultId: o.sourceResultId || null,
    programmeId: o.programmeId || null,
    examinationId: o.examinationId || null,
    schemaVersion: Number(o.schemaVersion) || SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    createdBy: String(o.createdBy || 'system'),
    updatedAt: new Date().toISOString()
  };
  // Métadonnées opérationnelles (hors champs certifiés — non hachées) :
  // legacyId, legacyCollection, legacyVerificationCode, pdfUrl hérités, etc.
  if (o.extraMetadata && typeof o.extraMetadata === 'object') {
    for (const k of Object.keys(o.extraMetadata)) {
      if (cert[k] === undefined && !IMMUTABLE_FIELDS.includes(k)) cert[k] = o.extraMetadata[k];
    }
  }
  return cert;
}

/* ---------- Émission ---------- */

/** Émet un certificat (logique serveur). Délégue à buildCertificateRecord
 *  pour garantir hash == champs finaux, puis persiste + event ISSUED. */
async function issueCertificate(input) {
  const cert = buildCertificateRecord(input);
  await getDb().collection(CERTIFICATES).doc(cert.id).set(cert);
  await appendEvent({
    certificateId: cert.id, action: 'ISSUED', performedBy: cert.createdBy,
    academyCode: cert.academyCode,
    metadata: {
      certificateType: cert.certificateType, cecrLevel: cert.cecrLevel,
      sourceQuizId: cert.sourceQuizId, sourceAttemptId: cert.sourceAttemptId
    }
  });
  return cert;
}
/* ---------- Vue publique / titulaire ---------- */

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

/** Vue titulaire (dashboard) — sans hash ni email ni identifiants internes. */
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

/* ---------- Révocation (idempotente) ---------- */

/** Révocation (super admin ELA) + event REVOKED. Idempotente : un certificat
 *  déjà révoqué est ignoré (pas de double event). */
async function revokeCertificate(id, reason, performedBy) {
  const ref = getDb().collection(CERTIFICATES).doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) throw new Error('certificate-not-found');
  if ((snap.data().status || '') === 'revoked') return true; // idempotent
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

/* ---------- Réémission (autorisée, liée, non destructive) ---------- */

/**
 * Réémission d'un certificat. L'original est PRÉSERVÉ (seul supersededBy,
 * champ de cycle de vie, est mis à jour). Le nouveau certificat :
 *  - garde les faits certifiés identiques (académie, niveau, élève, score,
 *    dates) ⇒ empreinte sémantiquement préservée (le hash inclut l'id, donc
 *    un nouvel id ⇒ nouveau hash, mais aucune donnée certifiée n'est altérée) ;
 *  - reçoit un NOUVEL id et le lien source reissueOf ;
 *  - porte event REISSUED (acteur + motif + horodatage serveur).
 * Interdite si l'original est révoqué.
 */
async function reissueCertificate(originalId, reason, performedBy) {
  const id = String(originalId || '');
  if (!id) throw new Error('certificate-id-required');
  const reasonStr = String(reason || '').trim();
  if (reasonStr.length < 3) throw new Error('reason-required');
  const ref = getDb().collection(CERTIFICATES).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('certificate-not-found');
  const orig = snap.data();
  if ((orig.status || '') === 'revoked') throw new Error('cannot-reissue-revoked');

  const newCert = buildCertificateRecord({
    academyCode: orig.academyCode,
    cecrLevel: orig.cecrLevel,
    certificateType: orig.certificateType || 'achievement',
    studentId: orig.studentId,
    studentName: orig.studentName,
    score: orig.scoreGlobal,
    skills: orig.skills || {},
    language: orig.language,
    issueDate: orig.issueDate,
    expiryDate: orig.expiryDate,
    createdBy: String(performedBy || 'system'),
    sourceQuizId: orig.sourceQuizId,
    sourceAttemptId: orig.sourceAttemptId,
    sourceResultId: orig.sourceResultId,
    programmeId: orig.programmeId,
    examinationId: orig.examinationId,
    schemaVersion: orig.schemaVersion,
    extraMetadata: { reissueOf: id, reissueReason: reasonStr, reissuedBy: String(performedBy || 'system') }
  });

  await getDb().collection(CERTIFICATES).doc(newCert.id).set(newCert);
  // Cycle de vie de l'original — supersededBy est le seul champ modifiable.
  await getDb().collection(CERTIFICATES).doc(id).update({
    supersededBy: newCert.id, updatedAt: new Date().toISOString()
  });
  await appendEvent({
    certificateId: newCert.id, action: 'REISSUED', performedBy: String(performedBy || 'system'),
    reason: reasonStr, academyCode: orig.academyCode,
    metadata: { originalId: id, supersededBy: newCert.id }
  });
  return newCert;
}
/* ---------- Migration legacy (idempotente, non destructive, déterministe) ---------- */

/** Migration one-shot legacy → ela_certificates (event MIGRATED).
 *  Corrigé Phase 2C : issueDate/expiryDate legacy fixées AVANT le hash
 *  (buildCertificateRecord) ; AUCUN écrasement post-hash. L'ancien document
 *  est marqué migratedToELA — JAMAIS supprimé. */
async function migrateLegacyCertificate(legacyId, legacy) {
  const existing = await getDb().collection(CERTIFICATES)
    .where('legacyId', '==', String(legacyId)).limit(1).get();
  if (!existing.empty) return null; // déjà migré (idempotent)

  const academyCode = ACADEMY_KEY_TO_CODE[String(legacy.academy || '').toLowerCase()] || 'FR';
  const cecrLevel = CECRL_LEVELS.indexOf(String(legacy.level || '').toUpperCase()) >= 0
    ? String(legacy.level).toUpperCase() : 'B1';
  const issued = (legacy.issuedAt && legacy.issuedAt.toDate) ? legacy.issuedAt.toDate() : new Date();
  const issueDate = issued.toISOString().slice(0, 10);
  const expiryDate = new Date(issued.getTime() + 3 * 365 * 86400000).toISOString().slice(0, 10);

  const cert = buildCertificateRecord({
    academyCode: academyCode,
    cecrLevel: cecrLevel,
    certificateType: 'achievement',
    studentId: String(legacy.userId || legacyId),
    studentName: String(legacy.studentName || 'Student'),
    score: legacy.percentage || 0,
    issueDate: issueDate,
    expiryDate: expiryDate,
    createdBy: 'migration',
    sourceQuizId: legacy.quizId || null,
    extraMetadata: {
      legacyId: String(legacyId),
      legacyCollection: 'certificates',
      legacyVerificationCode: legacy.verificationCode || null,
      pdfUrl: legacy.pdfUrl || null
    }
  });

  await getDb().collection(CERTIFICATES).doc(cert.id).set(cert); // écriture unique, champs finaux
  await appendEvent({
    certificateId: cert.id, action: 'MIGRATED', performedBy: 'migration',
    academyCode: academyCode,
    metadata: { legacyId: String(legacyId), legacyCollection: 'certificates' }
  });
  await getDb().collection('certificates').doc(String(legacyId))
    .update({ migratedToELA: cert.id, migratedAt: new Date().toISOString() })
    .catch(() => null);
  return cert.id;
}

/* ---------- Réconciliation d'audit (quorum, idempotente, serveur only) ---------- */

/** Pour chaque certificat sans event de quorum (ISSUED ou RECONCILED_ISSUED),
 *  ajoute un event RECONCILED_ISSUED. Ne modifie JAMAIS le certificat lui-même
 *  et n'invente AUCUNE donnée historique d'acteur. Idempotente. */
async function reconcileCertificateAudit(limit) {
  const cap = limit || 500;
  const certs = await getDb().collection(CERTIFICATES).limit(cap).get();
  let reconciled = 0, withQuorum = 0;
  for (const d of certs.docs) {
    const certId = d.id;
    const ev = await getDb().collection(EVENTS)
      .where('certificateId', '==', certId).limit(50).get();
    const actions = new Set(ev.docs.map((e) => e.data().action));
    if (actions.has('ISSUED') || actions.has('RECONCILED_ISSUED')) { withQuorum++; continue; }
    await appendEvent({
      certificateId: certId, action: 'RECONCILED_ISSUED', performedBy: 'reconciliation',
      reason: 'missing-ISSUED-quorum',
      academyCode: (d.data().academyCode) || '',
      metadata: { reconciledAt: new Date().toISOString() }
    });
    reconciled++;
  }
  // GAP 2 fix (Phase 2C) : inspection NON destructive des gardes d'idempotence.
  const grants = await reconcileCertificateGrants(cap);
  return {
    scanned: certs.size,
    withQuorum: withQuorum,
    reconciled: reconciled,
    grants: grants
  };
}

/** Réconciliation des gardes certificate_grants/{attemptId} (GAP 2).
 *  Détecte, SANS RIEN MODIFIER, les anomalies d'intégrité :
 *   - orphan       : la garde référence un certificat inexistant ;
 *   - duplicate    : plusieurs gardes partagent le même attemptId ;
 *   - inconsistent : la garde et le certificat ne concordent pas
 *                    (sourceAttemptId du certificat ≠ attemptId de la garde).
 *  Idempotente, en lecture seule, jamais destructive. */
async function reconcileCertificateGrants(limit) {
  const cap = limit || 500;
  const snap = await getDb().collection(GRANTS).limit(cap).get();
  const byAttempt = new Map();
  for (const g of snap.docs) {
    const data = g.data() || {};
    const attemptId = String(data.attemptId || g.id);
    if (!byAttempt.has(attemptId)) byAttempt.set(attemptId, []);
    byAttempt.get(attemptId).push({ id: g.id, data: data });
  }
  let orphanGrants = 0, duplicateGrants = 0, inconsistentGrants = 0;
  const details = [];
  for (const [attemptId, list] of byAttempt) {
    if (list.length > 1) {
      duplicateGrants += (list.length - 1);
      details.push({ type: 'duplicate', attemptId: attemptId, count: list.length });
    }
    for (const item of list) {
      const certId = String(item.data.certificateId || '');
      if (!certId) { inconsistentGrants++; details.push({ type: 'inconsistent', grantId: item.id, attemptId: attemptId, reason: 'missing-certificateId' }); continue; }
      const certSnap = await getDb().collection(CERTIFICATES).doc(certId).get();
      if (!certSnap.exists) {
        orphanGrants++;
        details.push({ type: 'orphan', grantId: item.id, attemptId: attemptId, certificateId: certId });
        continue;
      }
      const c = certSnap.data() || {};
      if (c.sourceAttemptId && String(c.sourceAttemptId) !== attemptId) {
        inconsistentGrants++;
        details.push({ type: 'inconsistent', grantId: item.id, attemptId: attemptId, certificateId: certId, certSourceAttemptId: String(c.sourceAttemptId) });
      }
    }
  }
  return {
    scanned: snap.size,
    orphanGrants: orphanGrants,
    duplicateGrants: duplicateGrants,
    inconsistentGrants: inconsistentGrants,
    details: details
  };
}

module.exports.CERTIFICATES = CERTIFICATES;
module.exports.EVENTS = EVENTS;
module.exports.INSTITUTION = INSTITUTION;
module.exports.INSTITUTION_SHORT = INSTITUTION_SHORT;
module.exports.SIGNED_BY = SIGNED_BY;
module.exports.SIGNATURE_ALGORITHM = SIGNATURE_ALGORITHM;
module.exports.VERIFY_BASE_URL = VERIFY_BASE_URL;
module.exports.SCHEMA_VERSION = SCHEMA_VERSION;
module.exports.CERTIFICATE_TYPES = CERTIFICATE_TYPES;
module.exports.CALLABLE_ACADEMY_WHITELIST = CALLABLE_ACADEMY_WHITELIST;
module.exports.ACADEMY_LABELS = ACADEMY_LABELS;
module.exports.ACADEMY_KEY_TO_CODE = ACADEMY_KEY_TO_CODE;
module.exports.CECRL_LEVELS = CECRL_LEVELS;
module.exports.IMMUTABLE_FIELDS = IMMUTABLE_FIELDS;
module.exports.LIFECYCLE_FIELDS = LIFECYCLE_FIELDS;
module.exports.generateCertificateId = generateCertificateId;
module.exports.canonicalJson = canonicalJson;
module.exports.sha256Hex = sha256Hex;
module.exports.computeIntegrityHash = computeIntegrityHash;
module.exports.computeAuthenticity = computeAuthenticity;
module.exports.verifyCertificateIntegrity = verifyCertificateIntegrity;
module.exports.classifyVerification = classifyVerification;
module.exports.VERIFICATION_STATES = VERIFICATION_STATES;
module.exports.hmacHex = hmacHex;
module.exports.SIGNING_ALGORITHM = SIGNING_ALGORITHM;
module.exports.appendEvent = appendEvent;
module.exports.assertImmutableFields = assertImmutableFields;
module.exports.buildCertificateRecord = buildCertificateRecord;
module.exports.issueCertificate = issueCertificate;
module.exports.publicView = publicView;
module.exports.ownerView = ownerView;
module.exports.revokeCertificate = revokeCertificate;
module.exports.reissueCertificate = reissueCertificate;
module.exports.migrateLegacyCertificate = migrateLegacyCertificate;
module.exports.reconcileCertificateAudit = reconcileCertificateAudit;
module.exports.reconcileCertificateGrants = reconcileCertificateGrants;
module.exports.GRANTS = GRANTS;