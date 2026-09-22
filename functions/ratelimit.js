/* ============================================================
   ELA — functions/ratelimit.js
   ------------------------------------------------------------
   Limiteur de débit serveur (fenêtre fixe, transactionnel) pour
   les opérations sensibles : émission/révocation/réémission de
   certificat, soumission d'examen, finalisation, progression.
   Collection serveur-only : rate_limits (jamais lisible client).
   ============================================================ */

const admin = require('firebase-admin');

let _db = null;
function getDb() {
  if (!_db) {
    if (!admin.apps.length) admin.initializeApp();
    _db = admin.firestore();
  }
  return _db;
}

const RATE_LIMITS = 'rate_limits';

/**
 * @param {string} key  identifiant logique (uid + action)
 * @param {number} limit nombre max d'opérations par fenêtre
 * @param {number} windowMs durée de la fenêtre en ms
 * @returns {Promise<{allowed:boolean, remaining:number, retryAfterMs?:number}>}
 */
async function enforceRateLimit(key, limit, windowMs) {
  const db = getDb();
  const ref = db.collection(RATE_LIMITS).doc(String(key));
  const now = Date.now();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : null;
    if (!data || now - Number(data.windowStart || 0) >= windowMs) {
      tx.set(ref, { windowStart: now, count: 1, updatedAt: new Date().toISOString() });
      return { allowed: true, remaining: limit - 1 };
    }
    const count = Number(data.count || 0);
    if (count >= limit) {
      return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - Number(data.windowStart)) };
    }
    tx.set(ref, { windowStart: data.windowStart, count: count + 1, updatedAt: new Date().toISOString() });
    return { allowed: true, remaining: limit - (count + 1) };
  });
}

/** Lève une erreur normalisée quand la limite est dépassée. */
async function requireWithinRateLimit(key, limit, windowMs) {
  const res = await enforceRateLimit(key, limit, windowMs);
  if (!res.allowed) {
    const err = new Error('rate-limit-exceeded');
    err.retryAfterMs = res.retryAfterMs;
    throw err;
  }
  return res;
}

module.exports = { enforceRateLimit, requireWithinRateLimit, RATE_LIMITS };
