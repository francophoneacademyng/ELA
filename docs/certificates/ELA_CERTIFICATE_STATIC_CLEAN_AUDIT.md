# ELA Certificate — Static Clean Audit

**Objective:** remove all dynamic certificate data from the static artwork so
the PDF engine can render each dynamic field exactly once, with zero duplicates.

---

## 1. What was baked into the old static PNG

The previous `ELA_CERTIFICATE_STATIC.png` still contained, as part of the
raster (masked-out regions were the only dynamic text removed in V9/V10):

- The certificate title "CERTIFICATE OF COMPLETION" (light gold, y 216–246)
- The signature blocks — left "Programme Director", right "ELA Certification
  Authority", their gold lines and role text (y 520–604)

In addition, the older static master still carried (from the reference):
name, academy, programme, level, metadata (dates/cert no/result), QR, footer
URL/hash — these had been masked in the last iteration but the masking was not
the definitive fix for the title and signatures.

## 2. What was removed (now masked out of the static raster)

| Element | Removed? |
| --- | --- |
| CERTIFICATE OF COMPLETION (title) | ✅ (rendered dynamically now) |
| DEMO STUDENT (name) | ✅ |
| Francophone Academy / French A1 Programme | ✅ |
| Level A1 • CEFR | ✅ |
| Issue Date / Valid Until / Certificate No. / Overall Result | ✅ |
| DEMO-ELA-TEST / 85% / dates | ✅ |
| QR code | ✅ |
| Verification URL / SHA-256 hash | ✅ |
| Signature blocks (left + right) | ✅ (rendered dynamically now) |

## 3. How the clean static background was produced

`ELA_CERTIFICATE_STATIC_CLEAN.png` (1448×1086) is generated from
`ELA_CERTIFICATE_REFERENCE.png` by reconstructing the background under each
dynamic region:

- **Text regions** (title, name, programme, level, info, signatures, footer):
  per-region **median filter** (kernel sized to the text) applied to a padded
  crop, pasted back — removes the text while preserving the ivory gradient and
  the faint world map.
- **QR region**: ring-sampled ivory (median of light pixels around the QR) to
  fully remove the QR modules.

## 4. Confirmation that no dynamic data remains

Verified programmatically (residual non-background pixels in each removed
region):

| Region | Residual |
| --- | --- |
| Title | 0 |
| Name | 139 (edge AA) |
| Programme | 0 |
| Info | 44 (edge AA) |
| Signatures | 0 |
| QR | 0 |
| Footer text | 13 |

Kept intact: frame, gold borders, corner ornaments, world map, landmarks, top
and lower ELA emblems, "E-Learn Language Academy" heading, subtitle, "This
certificate is proudly presented to", "for successfully completing the",
certification paragraph, motto, bottom ornaments.

## 5. Files modified

- `docs/certificates/ELA_CERTIFICATE_STATIC_CLEAN.png` (new clean static)
- `docs/certificates/ELA_CERTIFICATE_STATIC.png` (replaced with the clean version)
- `functions/ela-certificate-static.png` (bundled clean static for the engine)
- `functions/ela-pdf.js` — now renders the **title** and **signatures**
  dynamically (in addition to name, programme, level, metadata, QR, URL, hash).
  Security logic unchanged.

## 6. Test results

p2c 20 · ela-certificate-hist 10 · academic 21 · curriculum 25 — pass.
pdf-qr-validation: ID/URL/hash/"integrity hash" detected, no "Digitally signed".
QR decodes to the verification URL. Unicode 6/6 scripts.

Automated duplication QA on the final test PDF
(`ELA_CERTIFICATE_MASTER_TEST_V2.pdf`):

| Field | Count |
| --- | --- |
| CERTIFICATE OF COMPLETION | 1 (letter-spaced) |
| DEMO STUDENT / Francophone Academy / French A1 Programme / Level A1 | 1 each |
| ISSUE DATE / VALID UNTIL / CERTIFICATE NO. / OVERALL RESULT | 1 each |
| 2026-01-15 / 2029-01-15 / 85% | 1 each |
| Programme Director / ELA Certification Authority | 1 each |
| Verify this certificate at … / integrity hash | 1 each |
| Image paints | 2 = static + one QR |

No duplication.

## 7. Final test PNG

`docs/certificates/ELA_CERTIFICATE_MASTER_TEST_V2.png`

## 8. Security / deployment

Security unchanged (SHA-256, HMAC, `ELA_CERT_SIGNING_KEY`, integrity-only
fallback, certificate ID, QR verification, storage, history). No Firestore/
Auth/Storage/Paystack changes. Not committed, not deployed.
