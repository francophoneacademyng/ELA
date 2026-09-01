/* ============================================================
   ELA — src/ela/certification/models/ELACertificate.js
   ------------------------------------------------------------
   Modèle de domaine du certificat centralisé ELA.
   ELA ("E-Learn Language Academy") est la SEULE institution
   certifiante. Une académie (ex: "Francophone Academy") demande
   l'émission à ELA — elle ne délivre jamais ses propres certificats.
   Aucune donnée sensible (studentEmail) n'apparaît dans ce modèle.
   ============================================================ */

export const INSTITUTION = 'E-Learn Language Academy';
export const INSTITUTION_SHORT = 'ELA';
export const SIGNED_BY = 'ELA Certification Authority';
export const SIGNATURE_ALGORITHM = 'SHA-256';
export const VERIFY_BASE_URL = 'https://elaacademy.ng/verify.html';

/** Types de certificats (label affichable). */
export const CERTIFICATE_TYPES = {
  completion:    { label: 'Attestation de participation ELA' },
  achievement:   { label: 'Certificat de réussite ELA' },
  certification: { label: 'Certificat ELA — Niveau CECRL (officiel)' }
};

/** Codes académie autorisés (whitelist extensible). */
export const ACADEMY_CODES = ['FR', 'EN', 'DE', 'ZH', 'AR', 'RU'];

/** Libellé lisible de chaque académie déléguante. */
export const ACADEMY_LABELS = {
  FR: 'Francophone Academy',
  EN: 'English Academy',
  DE: 'German Academy',
  ZH: 'Mandarin Academy',
  AR: 'Arabic Academy',
  RU: 'Russian Academy'
};

/** Niveaux CECRL valides. */
export const CECRL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Statuts possibles d'un certificat. */
export const CERTIFICATE_STATUSES = ['active', 'revoked', 'expired'];

/* ---------- Génération d'identifiant unique ---------- */

/** 6 caractères aléatoires non ambigus (A-Z sans I/O, 2-9). */
function randomToken(len) {
  var alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var out = '';
  var buf = new Uint32Array(len);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
    for (var i = 0; i < len; i++) out += alphabet.charAt(buf[i] % alphabet.length);
    return out;
  }
  for (var j = 0; j < len; j++) out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  return out;
}

/**
 * ID au format ELA-{ACADEMY_CODE}-{CECRL}-{RANDOM}
 * ex: ELA-FR-B1-8X92KD
 */
export function generateCertificateId(academyCode, cecrLevel) {
  return 'ELA-' + String(academyCode).toUpperCase() + '-' + String(cecrLevel).toUpperCase() + '-' + randomToken(6);
}

/* ---------- Canonical JSON + hash SHA-256 ---------- */

/**
 * JSON canonique : clés triées, séparateurs compacts —
 * base déterministe du hash de signature.
 */
export function canonicalJson(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJson).join(',') + ']';
  var keys = Object.keys(obj).sort();
  return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + canonicalJson(obj[k]); }).join(',') + '}';
}

/** Hash SHA-256 hexadécimal (Web Crypto en browser). */
export function sha256Hex(str) {
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    var bytes = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }
  return Promise.reject(new Error('sha256-unavailable'));
}
/* ---------- Fabrique ---------- */

/**
 * Construit un objet ELACertificate complet à partir des données
 * d'émission. Le hash est calculé de façon asynchrone (Promise).
 */
export function createCertificate(input) {
  var academyCode = String(input.academyCode || '').toUpperCase();
  var cecrLevel = String(input.cecrLevel || '').toUpperCase();
  var type = CERTIFICATE_TYPES[input.certificateType] ? input.certificateType : 'certification';

  var now = new Date();
  var issueDate = now.toISOString().slice(0, 10);
  var expiry = new Date(now.getTime() + 3 * 365 * 86400000); // validité 3 ans
  var id = input.id || generateCertificateId(academyCode, cecrLevel);

  var cert = {
    id: id,
    certificateType: type,
    institution: INSTITUTION,
    institutionShort: INSTITUTION_SHORT,
    academyCode: academyCode,
    academyLabel: input.academyLabel || ACADEMY_LABELS[academyCode] || 'Academy',
    studentId: input.studentId,
    studentName: input.studentName,
    cecrLevel: cecrLevel,
    skills: input.skills || {},
    scoreGlobal: Number(input.score) || 0,
    issueDate: issueDate,
    expiryDate: expiry.toISOString().slice(0, 10),
    signedBy: SIGNED_BY,
    signatureAlgorithm: SIGNATURE_ALGORITHM,
    signatureHash: null,
    status: 'active',
    verificationUrl: VERIFY_BASE_URL + '?id=' + encodeURIComponent(id),
    pdfUrl: input.pdfUrl || null,
    pdfStoragePath: input.pdfStoragePath || null,
    credentialId: id,
    createdAt: now.toISOString(),
    createdBy: input.createdBy || 'system',
    updatedAt: now.toISOString()
  };

  return sha256Hex(canonicalJson({
    id: cert.id, certificateType: cert.certificateType, institution: cert.institution,
    academyCode: cert.academyCode, studentId: cert.studentId, studentName: cert.studentName,
    cecrLevel: cert.cecrLevel, scoreGlobal: cert.scoreGlobal, issueDate: cert.issueDate,
    expiryDate: cert.expiryDate, signedBy: cert.signedBy
  })).then(function (hash) {
    cert.signatureHash = hash;
    return cert;
  });
}

/**
 * Vue "publiquement sûre" — JAMAIS de studentId, studentEmail,
 * skills, scores ou signatureHash ici.
 */
export function publicView(cert) {
  if (!cert) return null;
  return {
    certificateId: cert.id,
    studentName: cert.studentName,
    institution: cert.institution,
    academyLabel: cert.academyLabel,
    cecrLevel: cert.cecrLevel,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    status: cert.status,
    valid: cert.status === 'active' &&
      (!cert.expiryDate || cert.expiryDate >= new Date().toISOString().slice(0, 10))
  };
}

/** Vue "privée titulaire" (dashboard élève) — sans hash ni email. */
export function ownerView(cert) {
  if (!cert) return null;
  return {
    id: cert.id,
    certificateType: cert.certificateType,
    typeLabel: (CERTIFICATE_TYPES[cert.certificateType] || {}).label || cert.certificateType,
    institution: cert.institution,
    academyLabel: cert.academyLabel,
    cecrLevel: cert.cecrLevel,
    scoreGlobal: cert.scoreGlobal,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    status: cert.status,
    verificationUrl: cert.verificationUrl,
    pdfUrl: cert.pdfUrl || null,
    pdfStoragePath: cert.pdfStoragePath || null
  };
}

/** Reconstitue un certificat depuis un document Firestore. */
export function fromFirestore(docId, data) {
  if (!data) return null;
  data.id = docId;
  if (data.credentialId !== data.id) data.credentialId = data.id;
  return data;
}