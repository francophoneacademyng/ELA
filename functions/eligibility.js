/**
 * ELA — functions/eligibility.js (PHASE 1B — local, non déployé)
 * Chaîne future : results/{attemptId} → éligibilité → émission certificat.
 * AUCUNE émission ici : pure décision serveur, idempotente, auditable.
 * Le trigger historique quizScores → generateCertificate reste INCHANGÉ
 * en production ; cette fonction servira la migration Phase 1F.
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

const db = new Proxy({}, { get: function (_t, p) { return admin.firestore()[p]; } });
const REGION = 'africa-south1';
const CERT_PASS_THRESHOLD = 80;

function uidOf(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');
  return uid;
}

/**
 * checkAssessmentEligibility — callable (lecture seule + audit).
 * in:  { attemptId }  | out: { eligible, reason, result, existingCertificate }
 * Règles : result finalisé + source authoritative + passed + seuil + examen
 *          + pas de doublon (ela_certificates.sourceAttemptId == attemptId).
 */
async function evaluateEligibility(uid, attemptId) {
  const id = String(attemptId || '').slice(0, 160);
  if (!id) throw new HttpsError('invalid-argument', 'attemptId required.');
  const rSnap = await db.collection('results').doc(id).get();
  if (!rSnap.exists) return { eligible: false, reason: 'result-not-found' };
  const r = rSnap.data() || {};
  if (r.studentId !== uid) throw new HttpsError('permission-denied', 'Not your result.');
  if (!r.finalized) return { eligible: false, reason: 'result-not-finalized' };
  if (r.source !== 'authoritative') return { eligible: false, reason: 'legacy-untrusted' };
  if (!r.passed || (r.percentage || 0) < CERT_PASS_THRESHOLD) return { eligible: false, reason: 'threshold-not-met' };
  const dup = await db.collection('ela_certificates').where('sourceAttemptId', '==', id).limit(1).get();
  if (!dup.empty) return { eligible: true, reason: 'already-issued', result: publicResult(r), existingCertificate: dup.docs[0].id };
  return { eligible: true, reason: 'eligible', result: publicResult(r), existingCertificate: null };
}

function publicResult(r) {
  return {
    quizId: r.quizId || '', academy: r.academy || '', level: r.level || '',
    score: r.score || 0, total: r.total || 0, percentage: r.percentage || 0,
    passed: !!r.passed, source: r.source || ''
  };
}

exports.checkAssessmentEligibility = onCall({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const out = await evaluateEligibility(uid, request.data && request.data.attemptId);
  try {
    await db.collection('assessment_events').add({
      attemptId: String((request.data && request.data.attemptId) || '').slice(0, 160),
      studentId: uid, type: 'ELIGIBILITY_CHECKED', eligible: out.eligible,
      reason: out.reason, at: admin.firestore.FieldValue.serverTimestamp(), source: 'authoritative'
    });
  } catch (e) { /* audit best-effort */ }
  return out;
});

/* ---------- Phase 2C — émission transactionnelle (issue unique) ---------- */

const core = require('./ela-certificate-core.js');

/**
 * Décision d'émission (PUR, testable) : étant donnés un result et l'état
 * d'un garde d'idempotence certificate_grants/{attemptId}, détermine s'il
 * faut émettre un nouveau certificat ou renvoyer l'existant.
 * - guardExists  : un document certificate_grants/{attemptId} existe déjà ?
 * - existingId   : identifiant du certificat existant pour ce attemptId
 *   (cherché par sourceAttemptId), ou null.
 * Retourne { action: 'create'|'duplicate', certificateId? }
 */
function selectIssuanceDecision(result, guardExists, existingId) {
  if (guardExists || (existingId && result.studentId)) {
    return { action: 'duplicate', certificateId: existingId };
  }
  return { action: 'create', certificateId: null };
}

/**
 * Émission transactionnelle d'un certificat depuis un result autoritatif.
 * Garantit EXACTEMENT un certificat par événement de certification
 * (sourceAttemptId) même en cas de requêtes concurrentes :
 *  - la transaction relit le résultat ET le garde certificate_grants/{attemptId} ;
 *  - si le garde existe → duplicata (on renvoie l'existant, rien n'est écrit) ;
 *  - sinon → écrit le certificat + le garde atomiquement (Firestore retente la
 *    transaction concurrente → une seule gagne).
 * Ne fait confiance à AUCUN champ client (studentId/academy/level/score/passed
 * dérivés du résultat serveur). Event ISSUED ajouté après la transaction
 * (best-effort). Exigences de rôle au niveau du callable appelant.
 */
async function grantCertificateForResult(uid, attemptId, performedBy) {
  const id = String(attemptId || '').slice(0, 160);
  if (!id) throw new Error('attemptId-required');

  const resultRef = db.collection('results').doc(id);
  const grantRef = db.collection('certificate_grants').doc(id);

  let outcome = null;
  await admin.firestore().runTransaction(async (tx) => {
    const rSnap = await tx.get(resultRef);
    if (!rSnap.exists) throw new Error('result-not-found');
    const r = rSnap.data() || {};
    if (String(r.studentId || '') !== String(uid)) throw new Error('not-your-result');
    if (r.source !== 'authoritative') throw new Error('legacy-untrusted');
    if (!r.finalized) throw new Error('result-not-finalized');
    if (!r.passed || (r.percentage || 0) < CERT_PASS_THRESHOLD) throw new Error('threshold-not-met');

    // Anti-doublon par sourceAttemptId (indépendant de l'ID aléatoire).
    const existing = await db.collection('ela_certificates')
      .where('sourceAttemptId', '==', id).limit(1).get();
    const existingId = existing.empty ? null : existing.docs[0].id;

    const gSnap = await tx.get(grantRef);
    const decision = selectIssuanceDecision(r, gSnap.exists, existingId);
    if (decision.action === 'duplicate') {
      outcome = { created: false, certificateId: existingId };
      return;
    }

    // PHASE 2C FIX : le studentName est dérivé du profil AVANT la construction
    // du certificat — aucun champ certifié ne peut être modifié après le hash.
    const uSnap = await db.collection('users').doc(String(uid)).get();
    const studentName = (uSnap.exists && uSnap.data().displayName)
      ? String(uSnap.data().displayName).slice(0, 160) : 'Student';

    const cert = core.buildCertificateRecord({
      academyCode: (r.academy && core.ACADEMY_KEY_TO_CODE[String(r.academy).toLowerCase()]) || 'FR',
      cecrLevel: (core.CECRL_LEVELS.indexOf(String(r.level || '').toUpperCase()) >= 0)
        ? String(r.level).toUpperCase() : 'A1',
      certificateType: 'achievement',
      studentId: String(uid),
      studentName: studentName,
      skills: {},
      score: r.percentage || 0,
      createdBy: String(performedBy || 'server'),
      sourceQuizId: r.quizId || null,
      sourceAttemptId: id,
      sourceResultId: id,
      language: r.language || r.academy || 'FR'
    });

    tx.set(db.collection('ela_certificates').doc(cert.id), cert);
    tx.set(grantRef, { attemptId: id, studentId: String(uid), certificateId: cert.id, createdAt: new Date().toISOString() });
    outcome = { created: true, certificateId: cert.id, cert: cert };
  });

  if (outcome && outcome.created && outcome.cert) {
    try {
      await db.collection('assessment_events').add({
        attemptId: attemptId, studentId: String(uid),
        type: 'ISSUED_FROM_RESULT', certificateId: outcome.certificateId,
        at: admin.firestore.FieldValue.serverTimestamp(), source: 'authoritative'
      });
    } catch (e) { /* audit best-effort */ }
  }
  return outcome;
}

/** Callable : émission d'un certificat depuis un résultat autoritatif (admin). */
exports.issueCertificateFromResult = onCall({ region: REGION }, async (request) => {
  const uid = uidOf(request);
  const callerSnap = await db.collection('users').doc(uid).get();
  const callerRole = callerSnap.exists ? (callerSnap.data().role || '') : '';
  if (callerRole !== 'admin' && callerRole !== 'system') {
    throw new HttpsError('permission-denied', 'Admin/system only.');
  }
  const uidTarget = String((request.data && request.data.studentId) || '').slice(0, 160);
  const attemptId = String((request.data && request.data.attemptId) || '').slice(0, 160);
  if (!uidTarget || !attemptId) throw new HttpsError('invalid-argument', 'studentId and attemptId required.');
  const out = await grantCertificateForResult(uidTarget, attemptId, uid);
  return { ok: true, created: out.created, certificateId: out.certificateId };
});

exports.grantCertificateForResult = grantCertificateForResult;
exports.selectIssuanceDecision = selectIssuanceDecision;
exports.evaluateEligibility = evaluateEligibility;
