/* ============================================================
   ELA — functions/callable.js
   ------------------------------------------------------------
   Petit adaptateur : enveloppe onCall (v2) tout en exposant le
   handler brut sous `__handler`, afin que les tests d'intégration
   locaux puissent invoquer la logique métier directement sans
   requête HTTP. En production, la fonction reste un callable normal.
   ============================================================ */
const { onCall } = require('firebase-functions/v2/https');

function callable(opts, handler) {
  const fn = onCall(opts, handler);
  fn.__handler = handler;
  return fn;
}

module.exports = { callable };
