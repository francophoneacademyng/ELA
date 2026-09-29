# ELA Certificate — Visual QA (v10)

**Status:** REVIEW_REQUIRED (font approximation only). Rendering architecture
audited and confirmed: a single pipeline with no legacy renderer and no
duplication.

## 1. Root cause of the reported V9 "duplication"

Programmatic audit found **no legacy renderer**. `functions/ela-pdf.js` is a
single pipeline (static master image + one dynamic overlay). The only callers
are `generateELACertificatePdf` and the `generateCertificate` trigger, both
invoking `makeOfficialPdfBuffer` once. There is no second composition layer.

The reported "duplicate" impression traces to the V9 static master retaining
small residual pixels of the original reference text (name ~114 gold px,
metadata ~68 dark px) because the earlier mask verification used a dark-only
threshold that missed light-gold glyphs. Those residuals were removed in v10.

## 2. Legacy renderer responsible

None exists. The old full-vector layouts (V4/V5) were fully replaced in
`functions/ela-pdf.js`; no parallel engine (`ela-pdf-v2`, `renderer2`, etc.)
was ever created.

## 3. Rendering pipeline now used (exactly one)

`functions/ela-pdf.js::makeOfficialPdfBuffer(cert)` →
`drawOfficialPdf(doc, cert, qrDataUrl)`:
1. green page fill;
2. embed `ela-certificate-static.png` (the reference with dynamic text masked);
3. overlay name, academy, programme, level, 4-column metadata, one QR, footer
   URL, footer hash — each exactly once.

## 4. Static / dynamic separation

- Static (raster master): frame, borders, ornaments, map, landmarks, emblem,
  heading, subtitle, "CERTIFICATE OF COMPLETION", separators, presentation
  sentence, "for successfully completing the", certification paragraph,
  signatures, lower emblem, motto.
- Dynamic (overlaid once): name, academy, programme, level, issue date, valid
  until, cert no, result, QR, URL, hash.

## 5. Automated duplication QA (extracted from the actual V10 PDF)

| Field | Count |
| --- | --- |
| DEMO STUDENT | 1 |
| Francophone Academy | 1 |
| French A1 Programme | 1 |
| Level A1 • CEFR | 1 |
| ISSUE DATE / VALID UNTIL / CERTIFICATE NO. / OVERALL RESULT | 1 each |
| 2026-01-15 / 2029-01-15 / 85% | 1 each |
| Verify this certificate at … | 1 |
| integrity hash | 1 |
| Image paints (operator list) | 2 = static master + **one** QR |
| CERTIFICATE OF COMPLETION | present in static master (pixel-identical) |

"DEMO-ELA-TEST" appears twice only because it is the certificate number AND the
`?id=` query param of the verification URL — correct, not duplication.

## 6. Files

- Created: `docs/certificates/ELA_CERTIFICATE_PREVIEW.v10.pdf` (1.69 MB),
  `docs/certificates/ELA_CERTIFICATE_PREVIEW.v10.png`, plus the static/master/QA
  files under `docs/certificates/`.
- Modified: `functions/ela-pdf.js`, `functions/ela-certificate-static.png`.
- Untouched: Firebase/Auth/Firestore/Storage/Paystack/verification/all app code.

## 7. Tests

p2c 20 · ela-certificate-hist 10 · academic 21 · curriculum 25 — pass.
pdf-qr-validation: ID/URL/hash/"integrity hash" detected, no "Digitally signed".
QR decodes to the verification URL. Unicode 6/6 scripts.

## 8. Security

Confirmed unchanged — SHA-256, HMAC, `ELA_CERT_SIGNING_KEY`, integrity-only
fallback, certificate ID, QR verification, storage, history.

## 9. Git status

```
 M docs/ELA-CERTIFICATION-PDF.md
 M functions/ela-pdf.js
 M src/ela/certification/models/ELACertificate.js
?? docs/certificates/
?? functions/ela-certificate-static.png
?? functions/fonts/
```

## 10. Deployment

NOT DEPLOYED. Not committed.

## Remaining item

Dynamic-text font (Playfair Display) vs the reference's exact font — not
determinable programmatically. Static artwork is pixel-faithful.
