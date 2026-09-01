/* ============================================================
   ELA — admin/models/referral-stats.model.js
   Domain model « statistiques de parrainage » (agrégat calculé
   à partir de la collection users — parrainage : filleul -15000
   NGN au 1er paiement, parrain +10000 NGN de crédit).
   ============================================================ */

export function ReferralStats(codesUsed, creditsTotal) {
  this.codesUsed = codesUsed || 0;
  this.creditsTotal = creditsTotal || 0;   // NGN
}

/** Agrège les stats à partir d'une liste d'AdminUser. */
ReferralStats.fromUsers = function (users) {
  let codesUsed = 0;
  let credits = 0;
  (users || []).forEach(function (u) {
    if (u.referralCodeUsed) codesUsed++;
    credits += u.referralCredit || 0;
  });
  return new ReferralStats(codesUsed, credits);
};

ReferralStats.prototype.hasData = function () {
  return this.codesUsed > 0 || this.creditsTotal > 0;
};
