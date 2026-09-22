/* ============================================================
   ELA — functions/authz.js
   ------------------------------------------------------------
   Autorisation institutionnelle côté serveur. Le rôle est TOUJOURS
   lu depuis users/{uid}.role (jamais depuis le client). Toute
   modification de rôle produit un événement d'audit append-only
   dans role_audit_events.
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

const ROLE_AUDIT = 'role_audit_events';

async function getUserRole(uid) {
  if (!uid) return null;
  const snap = await getDb().collection('users').doc(String(uid)).get();
  return snap.exists ? (snap.data().role || 'student') : null;
}

/** Lève une Error `forbidden:<expected>` si le rôle courant n'est pas autorisé. */
async function requireRole(uid, allowed) {
  const role = await getUserRole(uid);
  if (!role || allowed.indexOf(role) < 0) {
    throw new Error('forbidden:' + allowed.join('|'));
  }
  return role;
}

function assertAdmin(role) {
  if (role !== 'admin' && role !== 'system') throw new Error('forbidden:admin');
}

/** Journalise un changement de rôle/statut (append-only, non bloquant). */
async function writeRoleAudit(entry) {
  try {
    await getDb().collection(ROLE_AUDIT).add({
      targetUid: String(entry.targetUid || ''),
      actorUid: String(entry.actorUid || 'system'),
      action: String(entry.action || ''),
      fromRole: entry.fromRole || null,
      toRole: entry.toRole || null,
      reason: entry.reason || null,
      metadata: entry.metadata || {},
      at: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error('[ELA-Authz] role audit write failed:', e.message);
    return false;
  }
}

module.exports = { getDb, getUserRole, requireRole, assertAdmin, writeRoleAudit, ROLE_AUDIT };
