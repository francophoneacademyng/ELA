# ELA — PDF officiel + QR code (template unique)

## Option technique retenue

**Cloud Function + pdfkit + qrcode** (Puppeteer jugé trop lourd pour le
déploiement actuel). Un seul template, partagé par le callable
`generateELACertificatePdf` et le trigger `generateCertificate`
→ `functions/ela-pdf.js`.

## Template (description textuelle, A4 paysage)

1. Fond `#063D2C` (forest), double liseré doré `#C9A227`
2. En-tête : **E-LEARN LANGUAGE ACADEMY** (or) + sous-titre
   *"E-Learn Language Academy — sole issuing institution of ELA certificates"*
3. Titre selon `certificateType` :
   - `completion` → *Certificate of Participation — ELA*
   - `achievement` → *Certificate of Achievement — ELA*
   - `certification` → *ELA Certificate — CEFR Level (Official)*
4. "This certifies that" + **nom de l'élève** (grand, crème)
5. Académie déléguante + niveau CECRL (ex : *Francophone Academy · Level B1*)
6. Score global, dates (délivré / valide jusqu'à)
7. **Numéro unique** : `Certificate No. ELA-FR-B1-8X92KD`
8. *"Digitally signed by ELA Certification Authority"*
9. Pied, petits caractères Courier :
   `signatureAlgorithm: SHA-256  signatureHash: <hash>`
10. URL de vérification publique + **QR code** (à droite, pointe vers
    `https://elaacademy.ng/verify.html?id=ELA-XXX`)

## Stockage

- Chemin Storage : `ela-certificates/{id}.pdf` (public) — l'URL est écrite
  dans `pdfUrl` / `pdfStoragePath`.
- URL signée temporaire (15 min) disponible via `getELACertificatePdfUrl`.
- Exemple d'URL générée :
  `https://storage.googleapis.com/ela-academy-7f868.appspot.com/ela-certificates/ELA-FR-B1-8X92KD.pdf`

## QR côté dashboard

Le callable `listELACertificates` (scope élève) renvoie aussi `qrDataUrl`
(PNG base64) pour afficher le QR directement sur les cartes du dashboard.
