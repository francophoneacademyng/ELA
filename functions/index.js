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
 * JALON 1 (ce fichier) : squelette + santé du système.
 * Les fonctions métier arrivent aux jalons suivants :
 *   - Jalon 2 : paystackWebhook + verifyPaystackPayment
 *               (grille tarifaire ELA = politique officielle FA :
 *                75k / 120k / 150k + réductions 3-6 mois)
 *   - Jalon 3 : assistantChat (Learning Assistant multi-langue,
 *               clé OpenRouter côté serveur uniquement)
 *   - Jalon 4 : processReferral (filleul -15000 NGN 1er mois,
 *               parrain +10000 NGN crédit académique)
 *   - Jalon 5 : checkSubscriptionExpiry + notifications
 * ============================================================
 */

const { onRequest } = require('firebase-functions/v2/https');

/** Health check — vérifier que les fonctions répondent après déploiement */
exports.healthCheck = onRequest((req, res) => {
  res.json({
    status: 'ok',
    project: 'E-Learn Language Academy',
    milestone: 1,
    time: new Date().toISOString()
  });
});
