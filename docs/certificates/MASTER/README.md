# ELA Certificate — MASTER assets (référence permanente du design)

> **FREEZE** — Ce design est le **MASTER officiel** et définitif du système de
> certificats ELA. Ne plus modifier : coordonnées, couleurs, typographie,
> ornements, logo, cadre, carte, monuments, signatures, QR.

Ce dossier est la **source documentaire permanente** du design des certificats
E-Learn Language Academy. Il décrit la séparation stricte entre le **static
artwork** (décor uniquement) et le **dynamic PDF engine** (`functions/ela-pdf.js`).

## Chaîne de production

```
MASTER DESIGN (ce dossier)
   →  STATIC ARTWORK  functions/ela-certificate-static.png  (décor seul)
   →  DYNAMIC FIELDS  functions/ela-pdf.js                  (superposés)
   →  FINAL CERTIFICATE
```

## Contenu

| Fichier | Rôle |
|---|---|
| `ELA_CERTIFICATE_MASTER_STATIC.png` | Fond statique **propre** (1448×1086) : ornements, cadres, carte, monuments, emblème, devise — **sans aucun** contenu dynamique. SHA256 `8AE76737…`. Identique à `functions/ela-certificate-static.png`. |
| `ELA_CERTIFICATE_MASTER.svg` / `.html` | Gabarits visuels : fond propre + tokens `{{…}}` pour **tous** les champs dynamiques (dont `{{TITLE}}` et les deux signatures) + un unique QR. |
| `ELA_CERTIFICATE_MASTER_TEST_FINAL.pdf` / `.png` | Rendu **de référence** produit par `functions/ela-pdf.js`. Fait foi pour la QA. |

## Static artwork (zéro dynamique)

Le fond ne contient **aucun** titre, nom, académie, programme, niveau,
métadonnée, signature, QR, URL ni hash. Vérifié programmatiquement (0 pixel
d'encre résiduel dans les régions titre/nom/métadonnées/signatures/QR).

## Rendu final (une seule occurrence par champ)

- TITLE = 1 · STUDENT NAME = 1 · ACADEMY = 1 · PROGRAMME = 1 · LEVEL = 1
- METADATA = 1 jeu cohérent · SIGNATURES = 2 · QR = 1 · URL = 1 · HASH = 1

## Génération

```bash
node functions/ela-pdf.js            # ou le callable generateELACertificatePdf
python docs/certificates/_qa/qa_visual_duplication.py   # test OCR/duplication (attendu : ALL PASS)
```

## Historique / archives

Les artefacts de test précédents sont conservés dans `docs/certificates/archive/`.
