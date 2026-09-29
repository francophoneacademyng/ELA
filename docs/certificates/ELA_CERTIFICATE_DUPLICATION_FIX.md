# ELA Certificate — Correction de la duplication (ROOT CAUSE FIXED)

**Date :** 2026-09-29
**Statut :** ✅ **ROOT CAUSE FIXED** — duplication de texte dynamique et de QR éliminée.

## 1. Symptôme

Le certificat rendu affichait des **doublons** : texte (nom, académie,
programme, niveau, métadonnées, pied) et **deux QR** superposés.

## 2. Cause racine

Le PNG statique utilisé comme fond embarquait du contenu **dynamique cuit**
(« baked-in ») : valeur de nom, lignes de métadonnées, **un QR**, le pied de
page. Le moteur de rendu (`functions/ela-pdf.js`) superposait **par-dessus** ses
propres valeurs dynamiques et son propre QR → chaque champ et le QR apparaissaient
deux fois.

De même, les gabarits `ELA_CERTIFICATE_MASTER.svg` / `.html` embarquaient en
base64 la **référence sale** (`ELA_CERTIFICATE_REFERENCE.png`, SHA256
`30BF8A5B…`) qui contient tout ce contenu cuit, tout en déclarant en plus des
`{{PLACEHOLDERS}}` pour ces mêmes champs → double rendu à chaque remplissage.
Le jeton `{{QR_CODE}}` était en outre un simple `<text>` (QR non scannable).

## 3. Correction appliquée

### 3.1 Moteur de rendu (chaîne de production réelle)
- Le fond `functions/ela-certificate-static.png` (identique à
  `ELA_CERTIFICATE_STATIC.png` / `ELA_CERTIFICATE_STATIC_CLEAN.png`,
  SHA256 `DBFE661366F4`) est **propre** : les glyphes cuits (nom, métadonnées,
  QR, pied) y ont été retirés par masquage couleur ciblé (or/crème vs encre
  sombre) restreint aux ROIs dynamiques, **sans** endommager les ornements
  statiques (filets dorés, cadre).
- Le moteur superpose désormais l'unique copie de chaque champ + l'unique QR.

### 3.2 Gabarits SVG / HTML
- L'image base64 embarquée a été **remplacée** par un fond maître propre
  (`MASTER/ELA_CERTIFICATE_MASTER_STATIC.png`, SHA256 `52CA3DAF…`) construit
  ainsi : `fond moteur propre` + **bande de titre restaurée** depuis la
  référence (lignes 228–288) — le titre reste donc visible **une seule fois**
  (il n'y a pas de placeholder pour le titre).
- Le jeton `<text>{{QR_CODE}}</text>` a été remplacé par un **unique**
  `<image>` de QR (géométrie SVG : `x=698.30 y=471.40 w=h=82.22`, au centre
  exact de l'emplacement du QR).

## 4. Vérification (QA)

Outils : `pymupdf` (rastérisation), `opencv-python-headless` (détection QR,
profilage de pixels).

| Contrôle | Attendu | Observe |
|---|---|---|
| QR cuits dans `functions/ela-certificate-static.png` | 0 | **0** ✅ |
| QR cuits dans `MASTER/ELA_CERTIFICATE_MASTER_STATIC.png` | 0 | **0** ✅ |
| QR dans `MASTER/ELA_CERTIFICATE_MASTER_TEST_FINAL.png` | 1 | **1** ✅ |
| Nom cuit (px sombres, bande y296–345) | ~0 | static 1 / render **0** ✅ |

> Note : un comptage naïf de pixels « warm » (r>b+15) dans la bande du nom était
> non discriminant car le fond crème de la zone y satisfait déjà. Les glyphes
> cuits (encre sombre) sont le vrai signal : ils passent de 17 px (référence
> sale) à 1 px (statique nettoyé) et 0 px (rendu).

## 5. Fichiers livrés

- `functions/ela-certificate-static.png` — fond moteur propre (utilisé par `ela-pdf.js`).
- `docs/certificates/MASTER/` — actifs dé-dupliqués + rendu FINAL + `README.md`.
- Gabarits corrigés : `docs/certificates/ELA_CERTIFICATE_MASTER.svg` / `.html`.
- Scripts de build & QA : `docs/certificates/_qa/` (`build_master_image.py`,
  `patch_master.py`, `build_clean.py`, `qa_final.py`, `qa_master.py`).

## 6. Artefacts archivés (`docs/certificates/archive/`)

- `ELA_CERTIFICATE_MASTER_TEST.{pdf,png}`, `ELA_CERTIFICATE_MASTER_TEST_V2.{pdf,png}`
- `ELA_CERTIFICATE_MASTER.svg.orig`, `ELA_CERTIFICATE_MASTER.html.orig` (gabarits avant correction)

## 7. Limites connues

- `PyMuPDF` rasterise le `<image>` de QR du SVG de façon trop douce pour le
  décodeur OpenCV (le QR est **présent** — zone blanche + ~6 % de modules — et
  se décode dans un navigateur/Inkscape). La QA « 1 QR » faisant foi porte sur le
  rendu **PDF du moteur** (`MASTER_TEST_FINAL`), qui est la chaîne de production
  réelle et renvoie bien 1 QR décodable.
- Le SVG/HTML reste un **gabarit à placeholders** ; le rendu définitif validé est
  celui de `ela-pdf.js`.
