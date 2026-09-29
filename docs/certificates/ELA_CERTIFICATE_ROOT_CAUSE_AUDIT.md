# ELA Certificate — Root-Cause Audit

**Scope:** root-cause only. No fix applied, no V11 generated, no commit, no
deploy. This audit is based on direct source inspection and programmatic
analysis of the actual generated V10 files.

---

## 1. Renderer inventory (actual call graph)

`makeOfficialPdfBuffer(cert)` in `functions/ela-pdf.js` is the **only** PDF
renderer. Callers (verified by search):

| Caller | Location |
| --- | --- |
| `generateELACertificatePdf` | `functions/ela-certificates.js:156` |
| `generateCertificate` (trigger) | `functions/certificate.js:163` |

No other `PDFDocument`, `pdfkit`, or `makeOfficialPdfBuffer` usage exists in the
codebase. There is **no legacy renderer** and no second engine.

## 2. Element → source → function table

| Element | Source | Function | Static/Dynamic |
| --- | --- | --- | --- |
| CERTIFICATE OF COMPLETION | `ela-certificate-static.png` (embedded image) | `doc.image(bgBuffer(), …)` | STATIC |
| E-Learn Language Academy / subtitle | static PNG | — | STATIC |
| "This certificate is proudly presented to" | static PNG | — | STATIC |
| "for successfully completing the" | static PNG | — | STATIC |
| DEMO STUDENT | PDFKit text | `drawName()` (ela-pdf.js:105) | DYNAMIC |
| Francophone Academy | PDFKit text | `drawOfficialPdf()` (line 168, `cert.academyLabel`) | DYNAMIC |
| French A1 Programme | PDFKit text | `programmeTitle()` (line 128) | DYNAMIC |
| Level A1 • CEFR | PDFKit text | `drawOfficialPdf()` (line 170) | DYNAMIC |
| Certification paragraph | static PNG | — | STATIC |
| Issue Date / Valid Until / Certificate No. / Overall Result | PDFKit text | `drawOfficialPdf()` info loop (line 172–187) | DYNAMIC |
| Left signature (Programme Director) | static PNG | — | STATIC |
| Right signature (ELA Certification Authority) | static PNG | — | STATIC |
| Lower ELA emblem | static PNG | — | STATIC |
| LANGUAGES • PEOPLE • OPPORTUNITIES | static PNG | — | STATIC |
| QR (only one) | `QRCode.toDataURL` + `doc.image` | `makeOfficialPdfBuffer()` (line 139, 192) | DYNAMIC |
| Verification URL | PDFKit text (base-14) | `drawOfficialPdf()` (line 199) | DYNAMIC |
| SHA-256 hash | PDFKit text (base-14) | `drawOfficialPdf()` (line 201) | DYNAMIC |

## 3. Critical questions — answers

1. **Does ELA_CERTIFICATE_MASTER.svg contain text?** It contains placeholder
   tokens (`{{STUDENT_NAME}}`, `{{QR_CODE}}`, …) and the embedded static PNG as
   a base64 `<image>`. It does **not** contain literal demo text.
2. **Does it contain name/academy/programme/level/metadata/QR/footer?** Only as
   placeholder tokens and one `<image>` (the static PNG). No literal values.
3. **Is ELA_CERTIFICATE_STATIC.png generated from the SVG?** No. It is generated
   by masking the dynamic text out of `ELA_CERTIFICATE_REFERENCE.png` (median
   filter for text regions + ring-sampled ivory for the QR).
4. **Is ela-pdf.js drawing a complete layout on top?** No. It draws the green
   fill + the static PNG image, then only the **dynamic** text/QR. It does not
   draw title/emblem/signatures/motto via PDFKit.
5. **Is the SVG inserted as background AND another composition drawn?** No. The
   SVG master is a separate design artifact; `ela-pdf.js` embeds the static PNG
   (not the SVG) and never draws a second full composition.

## 4. Automated duplication QA (on the actual V10 PDF + PNG)

Performed with pdf.js text extraction and operator-list inspection:

| Check | Result |
| --- | --- |
| DEMO STUDENT | 1 |
| Francophone Academy | 1 |
| French A1 Programme | 1 |
| Level A1 • CEFR | 1 |
| ISSUE DATE / VALID UNTIL / CERTIFICATE NO. / OVERALL RESULT | 1 each |
| 2026-01-15 / 2029-01-15 / 85% | 1 each |
| Verify this certificate at … / integrity hash | 1 each |
| Image paint operations | 2 = static master + **one** QR |
| QR decode (jsQR full image) | exactly **1** QR (`…?id=DEMO-ELA-TEST`) |
| CERTIFICATE OF COMPLETION | present in static PNG (title region pixel-identical to reference) |

"DEMO-ELA-TEST" appears twice only because it is the certificate number **and**
the `?id=` query parameter of the verification URL — not duplication.

## 5. Why the title is reported "not visible"

The title IS present. Measured directly: the static PNG title region is
**0.0% changed** vs the reference (pixel-identical), and the title occupies
light gold `#F6EAD1` (b≈209), which a naive `b<200` "gold" detector misses —
producing a false "0 gold px" reading. A correct detector shows the title
present. It is not covered: the name baseline (y=305) is ~50 px below the title
bottom (y=246).

## 6. Conclusion of the audit

The programmatic evidence does **not** support the report of duplication,
missing title, or two QR codes. The generated V10 PDF/PNG contain exactly one of
every dynamic field, exactly one QR, and a pixel-faithful static master
(including the title).

Most probable explanations for the visual discrepancy:
1. A **stale preview file** is being viewed (V7/V8 previews still exist at the
   repository root and in `docs/certificates/`).
2. `ELA_CERTIFICATE_MASTER.html` / `.svg` were generated by an older script with
   **stale overlay coordinates** (name y=313 @ 41px, single-line programme
   y=354) and demo data — if opened, they can look mispositioned/duplicated,
   but they are NOT part of the PDF pipeline.

## 7. Recommended minimal correction (NOT applied)

If the intent is to eliminate any residual ambiguity:
1. Regenerate `ELA_CERTIFICATE_MASTER.svg` / `.html` from the **current**
   `ela-pdf.js` coordinates (single source of truth) so the design artifacts
   cannot diverge from the PDF.
2. Delete/archive stale preview files at the repository root and older `v7/v8`
   previews to prevent anyone opening a stale render.
3. (Optional) darken the dynamic programme colour from `#E8D9A8` if it reads as
   "pale".

## 8. Files that would need modification (if correction approved)

- `docs/certificates/ELA_CERTIFICATE_MASTER.svg` (regenerate)
- `docs/certificates/ELA_CERTIFICATE_MASTER.html` (regenerate)
- Remove stale root-level `ELA_CERTIFICATE_PREVIEW.v*.pdf/png` (V7/V8)
- No change to `functions/ela-pdf.js` security/logic.

No implementation performed. Not committed. Not deployed.
