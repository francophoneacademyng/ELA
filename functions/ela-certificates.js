/* ============================================================
   ELA — functions/ela-certificates.js
   ------------------------------------------------------------
   Cloud Functions de la centralisation des certificats ELA.
   - issueELACertificate      (callable)   : émission par une académie
   - verifyELACertificate     (HTTPS)      : vérification publique sans auth
   - generateELACertificatePdf(callable)   : PDF officiel + QR code
   - getELACertificatePdfUrl  (callable)   : URL signée temporaire
   - listELACertificates      (callable)   : mes certificats / liste admin
   - revokeELACertificate     (callable)   : révocation super admin
   - migrateLegacyCertificates(callable)   : migration one-shot
   Toutes en africa-south1. enforceAppCheck: false tant que
   l'application cliente n'a pas d'App Check activé (à durcir ensuite).
   AUCUNE réponse ne contient signatureHash, studentId ou email.
   ============================================================ */

const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const crypto = require('crypto');
const core = require('./ela-certificate-core.js');

const REGION = 'africa-south1';
// Firestore paresseux (fix timeout déploiement — voir index.js).
const db = new Proxy({}, {
  get: function (_t, prop) {
    return admin.firestore()[prop];
  }
});

/* ---------- Helpers ---------- */

/** Charge le rôle de l'appelant (users/{uid}.role). */
async function userRole(uid) {
  if (!uid) return null;
  const snap = await db.collection('users').doc(String(uid)).get();
  return snap.exists ? (snap.data().role || null) : null;
}

function ensure(condition, code, message) {
  if (!condition) throw new HttpsError(code, message || code);
}

/** Réponse callable publique-safe (jamais de hash / id interne élève). */
function safeIssueResponse(cert) {
  return { ok: true, certificate: core.ownerView(cert) };
}

/* ============================================================
   a) issueELACertificate — callable (rôle academy_admin | system)
   ============================================================ */
exports.issueELACertificate = onCall({ region: REGION, enforceAppCheck: false }, async (request) => {
  const uid = request.auth && request.auth.uid;
  ensure(uid, 'unauthenticated', 'Sign-in required.');
  const role = await userRole(uid);
  ensure(role === 'academy_admin' || role === 'system' || role === 'admin',
    'permission-denied', 'Only academy_admin or system may issue certificates.');

  const data = request.data || {};
  const academyCode = String(data.academyCode || '').toUpperCase();
  ensure(core.CALLABLE_ACADEMY_WHITELIST.indexOf(academyCode) >= 0,
    'invalid-argument', 'Academy not allowed to issue via callable yet.');

  try {
    const cert = await core.issueCertificate({
      academyCode: academyCode,
      studentId: data.studentId,
      studentName: data.studentName,
      cecrLevel: data.cecrLevel,
      skills: data.skills || {},
      score: data.score || 0,
      certificateType: data.certificateType,
      createdBy: uid
    });
    return safeIssueResponse(cert);
  } catch (err) {
    throw new HttpsError('invalid-argument', err.message || 'issue-failed');
  }
});

/* ============================================================
   b) verifyELACertificate — HTTPS onRequest, SANS auth, CORS ouvert
      GET ?id=ELA-XX-Y-XXXXXX → vue publique uniquement.
   ============================================================ */
exports.verifyELACertificate = onRequest({ region: REGION }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'method-not-allowed' }); return; }

  const id = String(req.query.id || '').trim().toUpperCase();
  if (!/^ELA-[A-Z]{2}-[A-C][1-2]-[A-Z0-9]{4,8}$/.test(id)) {
    res.status(200).json({ found: false, valid: false, error: 'invalid-format' });
    return;
  }
  try {
    const snap = await db.collection(core.CERTIFICATES).doc(id).get();
    if (!snap.exists) { res.status(200).json({ found: false, valid: false }); return; }
    // publicView : certificateId, studentName, institution, academyLabel,
    // cecrLevel, issueDate, expiryDate, status, valid — RIEN d'autre.
    const cert = snap.data();
    const integrity = core.verifyCertificateIntegrity(cert);
    const view = core.publicView(cert);
    const verificationState = core.classifyVerification(cert, integrity);
    // Statut d'intégrité/authenticité (aucune donnée privée exposée).
    res.status(200).json(Object.assign({}, view, {
      found: true,
      verificationState: verificationState,
      integrity: integrity.integrity,
      authenticity: integrity.authenticity,
      integrityValid: integrity.valid
    }));
  } catch (err) {
    console.error('[ELA-Cert] verify failed:', err.message);
    res.status(500).json({ found: false, valid: false, error: 'internal' });
  }
});
/* ============================================================
   c) generateELACertificatePdf — callable : PDF officiel (pdfkit
      + QR code) uploadé sur Storage (ela-certificates/{id}.pdf).
   ============================================================ */
exports.generateELACertificatePdf = onCall({ region: REGION, enforceAppCheck: false }, async (request) => {
  const uid = request.auth && request.auth.uid;
  ensure(uid, 'unauthenticated', 'Sign-in required.');
  const id = String((request.data || {}).id || '').trim().toUpperCase();

  const snap = await db.collection(core.CERTIFICATES).doc(id).get();
  ensure(snap.exists, 'not-found', 'Certificate not found.');
  const cert = snap.data();
  ensure(cert.studentId === uid || (await userRole(uid)) === 'admin',
    'permission-denied', 'Not allowed.');

  try {
    const pdfBuffer = await require('./ela-pdf.js').makeOfficialPdfBuffer(cert);

    const bucket = admin.storage().bucket();
    const filePath = 'ela-certificates/' + id + '.pdf';
    const file = bucket.file(filePath);
    await file.save(pdfBuffer, { contentType: 'application/pdf', resumable: false });
    await file.makePublic();
    const pdfUrl = 'https://storage.googleapis.com/' + bucket.name + '/' + filePath;

    await db.collection(core.CERTIFICATES).doc(id).update({
      pdfUrl: pdfUrl, pdfStoragePath: filePath, updatedAt: new Date().toISOString()
    });
    return { ok: true, url: pdfUrl, storagePath: filePath };
  } catch (err) {
    console.error('[ELA-Cert] PDF generation failed:', err.message);
    throw new HttpsError('internal', 'pdf-generation-failed');
  }
});

/* drawOfficialPdf déplacé dans ela-pdf.js (template unique partagé). */
/* ============================================================
   d) getELACertificatePdfUrl — callable : URL signée temporaire
   ============================================================ */
exports.getELACertificatePdfUrl = onCall({ region: REGION, enforceAppCheck: false }, async (request) => {
  const uid = request.auth && request.auth.uid;
  ensure(uid, 'unauthenticated', 'Sign-in required.');
  const id = String((request.data || {}).id || '').trim().toUpperCase();

  const snap = await db.collection(core.CERTIFICATES).doc(id).get();
  ensure(snap.exists, 'not-found', 'Certificate not found.');
  const cert = snap.data();
  ensure(cert.studentId === uid || (await userRole(uid)) === 'admin',
    'permission-denied', 'Not allowed.');

  const path = cert.pdfStoragePath || ('ela-certificates/' + id + '.pdf');
  try {
    const file = admin.storage().bucket().file(path);
    const [exists] = await file.exists();
    if (!exists) return { ok: false, error: 'pdf-not-generated' };
    const [url] = await file.getSignedUrl({
      action: 'read', expires: Date.now() + 15 * 60 * 1000 // 15 min
    });
    return { ok: true, url: url };
  } catch (err) {
    console.error('[ELA-Cert] signed url failed:', err.message);
    return { ok: false, error: 'pdf-url-failed' };
  }
});

/* ============================================================
   e) listELACertificates — callable :
      - élève          → ses propres certificats (ownerView)
      - admin/teacher  → liste paginée + filtres (academyCode, status)
   ============================================================ */
exports.listELACertificates = onCall({ region: REGION, enforceAppCheck: false }, async (request) => {
  const uid = request.auth && request.auth.uid;
  ensure(uid, 'unauthenticated', 'Sign-in required.');
  const data = request.data || {};
  const role = await userRole(uid);

  const pageSize = Math.min(Math.max(Number(data.pageSize) || 20, 1), 100);

  if (role === 'admin' || role === 'teacher') {
    let q = db.collection(core.CERTIFICATES).orderBy('createdAt', 'desc').limit(pageSize);
    if (data.academyCode) q = q.where('academyCode', '==', String(data.academyCode).toUpperCase());
    if (data.status) q = q.where('status', '==', String(data.status));
    // after a where + orderBy('createdAt') an extra orderBy keeps order stable
    const snap = await q.get();
    const items = snap.docs.map((d) => {
      const c = d.data();
      return {
        id: c.id, certificateType: c.certificateType, academyLabel: c.academyLabel,
        academyCode: c.academyCode, studentName: c.studentName, cecrLevel: c.cecrLevel,
        scoreGlobal: c.scoreGlobal, issueDate: c.issueDate, expiryDate: c.expiryDate,
        status: c.status, pdfUrl: c.pdfUrl || null, verificationUrl: c.verificationUrl,
        createdAt: c.createdAt
      };
    });
    return {
      ok: true, scope: 'admin', items: items,
      nextCursor: items.length === pageSize ? items[items.length - 1].id : null
    };
  }

  // Élève : ses certificats uniquement (ownerView, sans hash).
  const own = await db.collection(core.CERTIFICATES)
    .where('studentId', '==', uid).orderBy('createdAt', 'desc')
    .get();
  const QRCode = require('qrcode');
  const items = [];
  for (const d of own.docs) {
    const item = core.ownerView(d.data());
    try { item.qrDataUrl = await QRCode.toDataURL(item.verificationUrl, { margin: 1, width: 160 }); }
    catch (e) { item.qrDataUrl = null; }
    items.push(item);
  }
  return { ok: true, scope: 'owner', items: items };
});

/* ============================================================
   f) revokeELACertificate — callable : super admin ELA uniquement.
      Motif obligatoire. Event REVOKED écrit par le core.
   ============================================================ */
exports.revokeELACertificate = onCall({ region: REGION, enforceAppCheck: false }, async (request) => {
  const uid = request.auth && request.auth.uid;
  ensure(uid, 'unauthenticated', 'Sign-in required.');
  const role = await userRole(uid);
  ensure(role === 'admin' || role === 'system', 'permission-denied', 'Super admin ELA only.');

  const data = request.data || {};
  const id = String(data.id || '').trim().toUpperCase();
  const reason = String(data.reason || '').trim();
  ensure(id, 'invalid-argument', 'Certificate id required.');
  ensure(reason.length >= 3, 'invalid-argument', 'A revocation reason is required.');

  try {
    await core.revokeCertificate(id, reason, uid);
    return { ok: true };
  } catch (err) {
    throw new HttpsError('not-found', err.message || 'revoke-failed');
  }
});

/* ============================================================
   g) migrateLegacyCertificates — callable one-shot (admin).
      Migrer certificates/* → ela_certificates (event MIGRATED),
      sans supprimer aucune donnée. Idempotent.
   ============================================================ */
exports.migrateLegacyCertificates = onCall({ region: REGION, enforceAppCheck: false, timeoutSeconds: 300 }, async (request) => {
  const uid = request.auth && request.auth.uid;
  ensure(uid, 'unauthenticated', 'Sign-in required.');
  const role = await userRole(uid);
  ensure(role === 'admin' || role === 'system', 'permission-denied', 'Super admin ELA only.');

  const legacySnap = await db.collection('certificates')
    .where('migratedToELA', '==', null).limit(200).get();
  // fallback : si aucun champ migratedToELA, tout le reste n'est pas migré
  let snap = legacySnap;
  if (legacySnap.empty) {
    snap = await db.collection('certificates').limit(200).get();
    const remaining = snap.docs.filter((d) => !d.data().migratedToELA);
    let migrated = 0, skipped = 0;
    for (const doc of remaining) {
      const r = await core.migrateLegacyCertificate(doc.id, doc.data());
      if (r) migrated++; else skipped++;
    }
    return { ok: true, scanned: remaining.length, migrated: migrated, skipped: skipped };
  }
  let migrated = 0, skipped = 0;
  for (const doc of snap.docs) {
    const r = await core.migrateLegacyCertificate(doc.id, doc.data());
    if (r) migrated++; else skipped++;
  }
  return { ok: true, scanned: snap.size, migrated: migrated, skipped: skipped };
});

/* ============================================================
   h) reissueELACertificate — callable : réémission liée (admin/system).
      Exige motif. Préserve l'original + lien reissueOf + REISSUED.
   ============================================================ */
exports.reissueELACertificate = onCall({ region: REGION, enforceAppCheck: false }, async (request) => {
  const uid = request.auth && request.auth.uid;
  ensure(uid, 'unauthenticated', 'Sign-in required.');
  const role = await userRole(uid);
  ensure(role === 'admin' || role === 'system', 'permission-denied', 'Super admin ELA only.');

  const data = request.data || {};
  const reason = String(data.reason || '').trim();
  ensure(reason.length >= 3, 'invalid-argument', 'A reissue reason (>= 3 chars) is required.');

  try {
    const cert = await core.reissueCertificate(String(data.id || '').trim().toUpperCase(), reason, uid);
    return { ok: true, certificate: core.ownerView(cert), reissueOf: data.id };
  } catch (err) {
    throw new HttpsError('invalid-argument', err.message || 'reissue-failed');
  }
});

/* ============================================================
   i) runCertificateAuditReconciliation — callable : réconciliation
      server-only du quorum d'audit (ISSUED / RECONCILED_ISSUED).
   ============================================================ */
exports.runCertificateAuditReconciliation = onCall({ region: REGION, enforceAppCheck: false }, async (request) => {
  const uid = request.auth && request.auth.uid;
  ensure(uid, 'unauthenticated', 'Sign-in required.');
  const role = await userRole(uid);
  ensure(role === 'admin' || role === 'system', 'permission-denied', 'Super admin ELA only.');

  const cap = Math.min(Number((request.data && request.data.limit) || 500), 2000);
  const result = await core.reconcileCertificateAudit(cap);
  return { ok: true, result: result };
});