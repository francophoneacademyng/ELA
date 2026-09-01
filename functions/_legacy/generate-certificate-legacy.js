/* ============================================================
   ELA — functions/_legacy/generate-certificate-legacy.js
   ------------------------------------------------------------
   ANCIEN flux de certificats (pré-centralisation ELA). Conserve
   pour traçabilité — n'est PLUS requis nulle part. L'émission
   est désormais déléguée à ela-certificate-core (ela_certificates),
   le PDF est le template officiel unique (ela-pdf.js).
   Ne jamais réactiver sans accord : ELA est la seule institution
   certifiante.
   ============================================================
   Historique : trigger onDocumentWritten('quizScores/{docId}'),
   PDF pdfkit inline, upload Storage 'certificates/{uid}/{code}.pdf',
   écriture dans la collection 'certificates' (verificationCode ELA-XXXX-NNNNN).
   ============================================================ */
module.exports = null;