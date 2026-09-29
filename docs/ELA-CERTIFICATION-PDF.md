# ELA — PDF officiel + QR code (template unique)

## Chaîne de production (single source of truth)

```
docs/certificates/master/            →  MASTER DESIGN (référence permanente)
        │
        ▼  (artwork nettoyé de toute donnée dynamique)
functions/ela-certificate-static.png →  STATIC ARTWORK (décor uniquement)
        │
        ▼  (fonction appelée par generateELACertificatePdf / generateCertificate)
functions/ela-pdf.js                 →  DYNAMIC PDF ENGINE (superpose les champs)
        │
        ▼
FINAL CERTIFICATE (A4 paysage, 1 page)
```

- **MASTER DESIGN** : `docs/certificates/master/` est le dossier de référence
  permanent du design. Il contient `ELA_CERTIFICATE_MASTER.svg` / `.html`
  (gabarit visuel avec tokens `{{…}}`) et `ELA_CERTIFICATE_MASTER_STATIC.png`
  (fond propre).
- **STATIC ARTWORK** : `functions/ela-certificate-static.png` — copie déployée
  du fond propre (identique, SHA256 `8AE76737…`). Il ne contient **que** le
  décor : cadre vert, bordures dorées, ornements, coins, logo ELA, texture
  parchemin, carte du monde, monuments, emblème, devise
  *LANGUAGES • PEOPLE • OPPORTUNITIES*.
- **DYNAMIC PDF ENGINE** : `functions/ela-pdf.js` ajoute **une seule fois**
  chaque champ dynamique.

## Règle d'or — séparation STATIC / DYNAMIC

Le static artwork ne doit contenir **aucun** contenu dynamique (titre, nom,
académie, programme, niveau, CEFR, dates, numéro, résultat, signatures, QR,
URL, hash). Le moteur est l'**unique** producteur de ces champs.

## Template (A4 paysage)

1. Fond statique propre (décor uniquement), posé sans distorsion (réf. 1448×1086).
2. Titre selon `certificateType` (vert institutionnel) :
   - `completion` → *CERTIFICATE OF COMPLETION*
   - `achievement` → *CERTIFICATE OF ACHIEVEMENT*
   - `certification` → *CERTIFICATE OF PROFICIENCY*
3. Nom de l'élève (or).
4. Académie + programme (`{langue} {niveau} Programme`) + `Level {niveau} • CEFR` (or).
5. Rangée d'informations : ISSUE DATE / VALID UNTIL / CERTIFICATE NO. / OVERALL RESULT.
6. Deux signatures : *Programme Director* (gauche) et *ELA Certification
   Authority* (droite), chacune avec *E-Learn Language Academy (ELA)*.
7. QR code (bas droite) → `https://elaacademy.ng/verify.html?id=ELA-XXX`.
8. Pied : `Verify this certificate at {url}` + `SHA-256 integrity hash: <hash>`
   (jamais la signature HMAC, jamais de clé).

## Stockage

- Chemin Storage : `ela-certificates/{id}.pdf` (public) — URL écrite dans
  `pdfUrl` / `pdfStoragePath`.
- URL signée temporaire (15 min) via `getELACertificatePdfUrl`.

## QR côté dashboard

Le callable `listELACertificates` renvoie aussi `qrDataUrl` (PNG base64) pour
afficher le QR sur les cartes du dashboard.

## Sécurité

Aucun secret dans le PDF : jamais `ELA_CERT_SIGNING_KEY`, jamais de HMAC. Le QR
pointe uniquement vers la `verificationUrl` publique. SHA-256, HMAC, génération
d'ID, vérification, Firestore/Storage/Auth/Paystack, historique et contrôle
d'accès restent inchangés.
