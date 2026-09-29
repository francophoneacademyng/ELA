# ELA Certificate — Independent Root-Cause Audit (duplication)

Auditor: Cline (independent re-audit) — Date: 2026-09-29
Scope: forensic only. **No code change, no redesign, no V3, no deploy, no commit.**
Ground truth = rendered PNG `docs/certificates/ELA_CERTIFICATE_MASTER_TEST_V2.png` + byte/hash/pixel
forensics (SHA-256, Pillow pixel-diff, ink-density, base64 extraction). The audit model cannot
display images, so every visual claim is backed by numeric pixel evidence.

---

## 1. Executive summary

Every dynamic element is painted **twice**, because of one structural error repeated in the
rendering paths:

> The "static" background artwork **still contains the dynamic data baked into it** (student name,
> academy, programme, level badge, dates, certificate number, %, signature roles, QR, verification
> URL, SHA-256). The renderer then **overprints the same fields again**.

Two backgrounds are involved and neither is clean:

1. **Production background** `functions/ela-certificate-static.png` =
   `docs/certificates/ELA_CERTIFICATE_STATIC.png` = `docs/certificates/ELA_CERTIFICATE_STATIC_CLEAN.png`
   — all three **byte-identical** (SHA-256 `DBFE6613…`). The "CLEAN" file is a literal copy of the
   dirty one: partially over-erased (flat cream rectangles) but still carries residual baked text
   + erase-patch ghosts.
2. **Master template background** = base64 PNG embedded in `ELA_CERTIFICATE_MASTER.svg`/`.html`
   (SHA-16 `34582bba…`, 1 673 759 B) — **≈96 % identical to the dirty `ELA_CERTIFICATE_REFERENCE.png`**
   (all demo text still baked). The SVG/HTML then overlay 15 `<text>` placeholders
   (`{{STUDENT_NAME}}`, `{{LEVEL}}`, `{{QR_CODE}}`, …) on top.

V2 matches the **1448×1086 master-canvas aspect (1.333)**, not the A4 PDF output of `ela-pdf.js`
(1.414). So the V2 preview was produced off the dirty master path → everything visibly doubled.

**ROOT CAUSE CONFIRMED** (§7, §13).

---

## 2. Actual image findings (pixel evidence)

### 2.1 Dimensions & mode
| File | Size | Mode | Aspect |
|---|---|---|---|
| ELA_CERTIFICATE_REFERENCE.png | 1448×1086 | RGB | 1.333 |
| ELA_CERTIFICATE_STATIC.png | 1448×1086 | RGB | 1.333 |
| ELA_CERTIFICATE_STATIC_CLEAN.png | 1448×1086 | RGB | 1.333 |
| ELA_CERTIFICATE_MASTER_TEST_V2.png | 1448×1086 | RGBA | 1.333 |
| Master SVG/HTML geometry | 841.89×595.28 pt | A4 | 1.414 |

V2 (1.333) tracks the master 1448×1086 canvas, not the A4 PDF page (1.414). Left/right extreme
columns of REFERENCE, STATIC_CLEAN, V2 are the identical forest-green frame `[4,58,53]`.

### 2.2 Dark-ink % per band (lower = cleaner). REFERENCE = fully-dirty demo cert.
| Band | REF | STATIC_CLEAN (=embedded bg) | V2 final | Reading |
|---|---|---|---|---|
| title y200-300 | 8.74 | 2.13 | 3.12 | title erased but residual + ghost |
| name y280-360 | 12.98 | 0.57 | 2.18 | name erased in bg; V2 adds overprint |
| acadprog y330-420 | 12.62 | 1.08 | 1.56 | erased + ghost |
| level y400-470 | 8.65 | 2.80 | 4.27 | **level badge still baked (2.8%)** |

---

## 3. Actual code findings

### 3.1 Single production PDF renderer = `functions/ela-pdf.js` (`drawOfficialPdf`)
Wiring (the only production path):
- `functions/ela-certificates.js:156` -> `require('./ela-pdf.js').makeOfficialPdfBuffer(cert)`
- `functions/certificate.js:163` -> same call.

Actual paint order (verified in source):
1. `doc.rect(0,0,W,H)` full-page forest-green fill (side-bars come from here, x<OX / x>OX+IMG_W).
2. `doc.image(BG,{x:OX,y:0,width:IMG_W,height:IMG_H})` - **ONE** background embed
   (OX=24.1, OY=0, IMG_W=793.6, IMG_H=595.28; BG = `__dirname/ela-certificate-static.png`).
3. `drawText(doc, W, ry(244), 'CERTIFICATE OF COMPLETION', ...)` - title overprint.
4. `drawName(doc, ry(300), cert.fullName)` - name overprint (auto-fit font size).
5. `drawText(academyLabel)`, `drawText(progLabel)` - overprints.
6. `drawText('Level '+level+' CEFR', ry(405))` - level overprint.
7. loop `[['Date of Issue',..],['Valid Until',..],['Certificate No.',..],['Overall Result',..]]` at ry(520/532) - metadata overprints.
8. `drawSignatureBlock('Programme Director',..)` + `drawSignatureBlock('ELA Certification Authority',..)` at ry(580/591).
9. `doc.image(qrBuf,{x:rx(1230),y:ry(850),width:rx(100)})` - **ONE** QR overprint.
10. footer `Verification: https://ela-verify.web/app/verify/..` at ry(1005); hash text at ry(1020/1032).

**Each dynamic field is drawn exactly once in code.** There is no double-render bug in `ela-pdf.js`.
The duplication is the overprint landing on top of the same data **already baked in the background**.

### 3.2 Master template = `ELA_CERTIFICATE_MASTER.svg` / `ELA_CERTIFICATE_MASTER.html`
- Both embed the SAME base64 PNG (SHA-16 `34582bba..`, 1,673,759 B) as a full-bleed background
  `<image x=24.09 y=0 width=793.7 height=595.28>`. That embedded PNG is ~96% the dirty reference
  -> **all demo text baked into the template background**.
- SVG `<text>` overlays (15): `{{STUDENT_NAME}}`, `{{ACADEMY_NAME}}`, `{{PROGRAMME_NAME}}`,
  `{{LEVEL}}`, `ISSUE DATE`/`{{ISSUE_DATE}}`, `VALID UNTIL`/`{{VALID_UNTIL}}`,
  `CERTIFICATE NO.`/`{{CERTIFICATE_NUMBER}}`, `OVERALL RESULT`/`{{RESULT}}`,
  `{{QR_CODE}}`, `{{VERIFICATION_URL}}`, `{{CERTIFICATE_HASH}}`. HTML has 12 `{{..}}` placeholders.
- Neither file contains literal "DEMO STUDENT"/"85%" - they are `{{placeholder}}` templates.

### 3.3 No committed generator for V2
No committed script substitutes the `{{..}}` placeholders or emits `*_TEST_V2.png`.
`functions/test/pdf-analysis.js` is dead scratch (reads a non-existent `.tmp`). V2 was produced by an
ad-hoc render off the dirty master (aspect 1.333 = 1448x1086 master canvas). `ela-certificates.js`
and `certificate.js` correctly route only through `ela-pdf.js`.

---

## 4. Actual asset findings


---

## 5. Element trace table

Legend. L1 = background image layer (baked). L2 = overprint layer.
`ela-pdf`: L2 = PDFKit `doc.text`/`doc.image`. `master`: L2 = SVG/HTML `<text>`/`{{..}}`/QR.

| # | Element | L1 source | L2 source | Static/Dyn | Expected | Observed | Root cause |
|---|---|---|---|---|---|---|---|
| 1 | Certificate of Completion | baked in bg (ref title band 8.7%) | ela-pdf `drawText title` / master baked | Dynamic label (static text) | 1 | 2 | baked title in bg + overprint |
| 2 | ELA emblem (top) | decor in bg | none | Static decor | 1 | 1 | OK |
| 3 | E-Learn Language Academy | baked academy text | `drawText(academyLabel)` / `{{ACADEMY_NAME}}` | Dynamic | 1 | 2 | baked + overprint |
| 4 | Institutional subtitle | decor baked | none | Static | 1 | 1 | OK |
| 5 | Student name (DEMO STUDENT) | baked name (ref band 12.98%) | `drawName` / `{{STUDENT_NAME}}` | Dynamic | 1 | 2 | baked name + overprint |
| 6 | Academy / Programme | baked | `drawText(progLabel)` / `{{PROGRAMME_NAME}}` | Dynamic | 1 | 2 | baked + overprint |
| 7 | Level badge (Level A1 CEFR) | baked badge (2.8% residual in bg) | `'Level '+level+' CEFR'` / `{{LEVEL}}` | Dynamic | 1 | 2 | baked badge + overprint |
| 8 | CEFR marker | baked | same as #7 | Dynamic | 1 | 2 | duplicate of #7 |
| 9 | Issue date | baked | metadata loop `Date of Issue` / `{{ISSUE_DATE}}` | Dynamic | 1 | 2 | baked + overprint |
| 10 | Valid until | baked | metadata loop / `{{VALID_UNTIL}}` | Dynamic | 1 | 2 | baked + overprint |
| 11 | Certificate number | baked (DEMO-ELA-TEST) | metadata loop / `{{CERTIFICATE_NUMBER}}` | Dynamic | 1 | 2 | baked + overprint |
| 12 | Overall result 85% | baked | metadata loop / `{{RESULT}}` | Dynamic | 1 | 2 | baked + overprint |
| 13 | Left signature (Programme Director) | baked role | `drawSignatureBlock` | Dynamic text + static line | 1 | 2 | baked role + overprint |
| 14 | Right signature (ELA Certification Authority) | baked (sigR 2.91% residual) | `drawSignatureBlock` | Dynamic text | 1 | 2 | baked role + overprint |
| 15 | Lower ELA emblem / motto | decor in bg | none | Static decor | 1 | 1 | OK |
| 16 | QR code #1 | baked QR in bg (ref 31.7% / static 13.4%) | none | Static artifact in bg | (0) | present | stale QR baked into bg |
| 17 | QR code #2 | none | `doc.image(qrBuf)` / `{{QR_CODE}}` | Dynamic | 1 | present | correct live QR |
| 18 | Verification URL | baked footer | footer `drawText` / `{{VERIFICATION_URL}}` | Dynamic | 1 | 2 | baked + overprint |
| 19 | SHA-256 hash | baked footer | footer hash text / `{{CERTIFICATE_HASH}}` | Dynamic | 1 | 2 | baked + overprint |
| 20 | Decorative lines / frame | decor in bg | none | Static decor | 1 | 1 | OK |
| 21 | World map / landmarks bg | decor in bg | none | Static decor | 1 | 1 | OK |
| 22 | Pale ghost rectangles | flat erase patches in bg `[251,243,224]` | none | Erase artifact | 0 | present | mismatched flat fill vs textured paper |

Every "2" or "(0)+present" is the same defect: dynamic data is present in the background image
**and** re-emitted by the overprint layer.

---

## 6. Actual rendering sequence

### 6.A Production path `ela-pdf.js` (what ships)
```
rect(green full page)
 -> image(static bg, single embed)      [bg still has: baked title/level badge/right-sig/footer
                                          + erase ghosts; name/metadata mostly erased]
 -> text title, name, academy, programme, level      (1x each)
 -> text 4 metadata label+value                      (1x each)
 -> text 2 signature roles                           (1x each)
 -> image(QR, 1x)
 -> text verification URL + hash (footer)            (1x each)
```
Net: dynamic fields overprinted once over a background that still shows residual baked text +
erase-rectangle ghosts in the title/level/right-signature/QR/footer bands.

---

## 7. Answers to the 16 critical questions

1. **Does `ELA_CERTIFICATE_STATIC.png` still contain dynamic text?** YES - residual baked title,
   Level badge (2.8% ink), right-signature (2.91%), QR band (13.4%), footer URL/hash (30.5%),
   plus flat erase-ghost rectangles. Name/metadata were mostly erased but the file is not clean.
2. **Is `ELA_CERTIFICATE_STATIC_CLEAN.png` different?** NO - byte-identical (SHA-256 `DBFE6613`,
   meanAbsDiff 0.000). Same answer as #1. The "CLEAN" name is a false label.
3. **Difference between `functions/ela-certificate-static.png` and `STATIC_CLEAN`?** NONE -
   byte-identical. Production uses this partially-erased, ghosted asset.
4. **Does `ela-pdf.js` embed more than one image/background?** NO - exactly one background
   `doc.image` + one QR `doc.image`. Only one background.
5. **Does `ela-pdf.js` draw any dynamic field more than once?** NO - every field once. The
   duplication is not code double-rendering; it is overprint over baked-in background data.
6. **Is the SVG master embedded as an image/background in the pipeline?** In `ela-pdf.js`: NO.
   Inside the master `.svg`/`.html` themselves: YES - a dirty base64 background is embedded.
7. **Is the HTML master involved in PDF generation?** NO - `ela-pdf.js` never reads HTML. HTML/SVG
   only feed preview PNGs (V2).
8. **Is the old PNG loaded from another path?** NO extra path. But note the SVG/HTML embed a
   **different, dirtier** PNG (`34582bba`) than the production static (`DBFE6613`).
9. **Another certificate background file in `functions/`?** NO - only `ela-certificate-static.png`.
10. **Are signatures embedded in the static artwork?** YES - right-signature role text still baked
    (2.91% ink); signature rules/labels are artwork.
11. **Is the QR embedded in the static artwork?** YES - QR band still 13.4% ink in the static; the
    master-embedded bg keeps a full baked QR (ref 31.7%).
12. **A second QR source?** YES - the baked QR in the background + the live `doc.image(qrBuf)` /
    `{{QR_CODE}}` overlay = two QRs.
13. **Real source of the second "DEMO STUDENT"?** The background image (master embed ~96% reference,
    and the production static's title-band ghost) bakes a "DEMO STUDENT"/name; the overprint adds
    the real name. Two names.
14. **Upper pale Academy/Programme block?** Baked academy/programme text in the background + flat
    erase-patch ghost + the overprinted academy/programme line.
15. **Second "Level A1" badge?** Baked Level badge still present in the background (2.8% ink) +
    overprinted `'Level .. CEFR'` / `{{LEVEL}}`.
16. **Second metadata row (date/number/result/QR)?** Baked metadata/footer in the background +
    overprinted metadata columns / `{{ISSUE_DATE}}`/`{{CERTIFICATE_NUMBER}}`/`{{RESULT}}`.

---

## 8. Confirmed root cause

> **Root cause: the static certificate background artwork was never made text-free.** Both the
> production PNG (`ela-certificate-static.png`) and the master template's embedded PNG are derived
> from the demo `REFERENCE` and still contain the dynamic data (title, name, academy, programme,
> level badge, dates, certificate number, percentage, signature roles, QR, verification URL, hash)
> baked into the pixels, along with flat erase-patch rectangles. The renderer (`ela-pdf.js` overprint,
> or the SVG/HTML `{{..}}` layer) draws the same dynamic data **again**, so every field appears twice,
> two QR codes render, and the mismatched erase rectangles show as pale ghosts. The prior fix failed
> because `ELA_CERTIFICATE_STATIC_CLEAN.png` is a byte-for-byte copy of the dirty asset, so the
> "cleaned" background was never actually applied.

**ROOT CAUSE CONFIRMED.**


### 6.B Master preview path (SVG/HTML -> V2 PNG) — matches the V2 the user is inspecting
```
image(dirty embedded bg, ~96% reference: ALL demo text baked)
 -> 15 <text> overlays {{STUDENT_NAME}}/{{LEVEL}}/{{QR_CODE}}/... (substituted with demo values)
```
Net: **every** field literally doubled (baked copy + overlay copy) + two QR codes + flat erase
ghosts. This is the fully-doubled state visible in V2.

Both paths fail for the same reason: the background is not text-free.

| Asset | SHA-256 (16) | bytes | Background image inside | Verdict |
|---|---|---|---|---|
| ELA_CERTIFICATE_STATIC.png | DBFE6613 | 1,464,600 | partially-erased, ghosts, residual title/level/sigR/QR/footer | NOT clean |
| ELA_CERTIFICATE_STATIC_CLEAN.png | DBFE6613 | 1,464,600 | identical to above | **mislabelled "CLEAN"** |
| functions/ela-certificate-static.png | DBFE6613 | 1,464,600 | identical to above (used by ela-pdf.js) | NOT clean |
| Master SVG/HTML embedded base64 | 34582bba | 1,673,759 | ~96% dirty reference (all text baked) | NOT clean |
| ELA_CERTIFICATE_REFERENCE.png | 0A113055 | 1,457,107 | full demo cert (source of the bake) | dirty (expected) |

Only one PNG exists in `functions/` (`ela-certificate-static.png`); no orphan/alternate background.
The two "different" backgrounds (production `DBFE6613` vs master-embedded `34582bba`) are **both**
derived from the dirty reference and **both** still carry baked dynamic content.

| metadata y430-560 | 7.20 | 0.04 | 1.48 | values erased in bg |
| sigL y520-640 | 0.70 | 0.00 | 1.00 | left sig line clean |
| sigR y520-640 | 3.81 | 2.91 | 4.07 | **right sig text still baked** |
| qr y820-1040 | 31.73 | 13.42 | 33.40 | QR area still dirty in bg |
| footer y960-1060 | 36.88 | 30.49 | 33.24 | footer URL/hash still baked |

### 2.3 Global pixel-diff
- STATIC vs STATIC_CLEAN → meanAbsDiff **0.000**, 0.00 % differ → **identical files**.
- REFERENCE vs STATIC/CLEAN → only 6.43 % of pixels changed → cleaning touched only the text
  strips; the rest of the dirty reference is intact.

### 2.4 Cleaning footprint → the ghost rectangles
STATIC_CLEAN differs from REFERENCE in **5.65 %** of pixels, in strips that match the dynamic rows:
name y300-360 (15 428 px), footer y960-1020 (20 259 px), sig y540-600 (13 641 px), QR y840-900
(6 714 px). Those strips were filled with flat cream `[251,243,224]` that does not match the
textured paper → these flat rectangles are exactly the **pale/ghosted rectangular areas** reported.
