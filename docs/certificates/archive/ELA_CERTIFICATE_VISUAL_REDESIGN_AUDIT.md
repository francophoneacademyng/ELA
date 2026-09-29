# ELA Certificate — Visual Redesign Audit (v4)

**Status:** REVIEW_REQUIRED (visual sign-off against the MASTER reference + deployment).

v4 supersedes v3. Key v4 corrections (per the visual review rejection):

1. **Logo/emblem rebuilt** as a clean circular brand seal (double gold ring,
   globe above, "ELA" center with full-width text box, open book below, laurel
   branches flanking) — no more compressed "EL" effect; clear whitespace.
2. **Large central globe removed** — replaced by a faint graticule (world-map
   grid) + two architectural silhouettes (Eiffel Tower left, classical
   colonnade right) at 5% opacity.
3. **Premium ivory paper** — subtle radial gradient (`#FCF8EE` → `#F1E8D4`),
   no flat white.
4. **Richer border** — forest frame → gold → dark-green → gold → ivory, plus
   denser gold corner ornaments (double L, diagonal, curl, dots, diamond).
5. **Title** — gold serif with separators ABOVE and BELOW.
6. **QR relocated** to a dedicated lower-right area (`W-126, 474`, 52 pt) with
   clear whitespace — no overlap with the right signature, certificate number,
   or footer.
7. **Info section** — 3 balanced columns (Issue Date / Valid Until /
   Certificate No.) with Overall Result as a separate discreet line.
8. **Lower emblem** between the two signature areas + tagline.
The supplied reference image is treated as the visual master; the design was
reconstructed in vector form inside the existing PDF engine. No security,
data, ID, QR-target, or verification logic was changed.

---

## CERTIFICATE VISUAL REDESIGN — Status: REVIEW_REQUIRED

**OLD** — "Certificate of Participation", flat green background, base-14 fonts,
no logo/artwork, no Unicode.

**NEW (v3)** — "CERTIFICATE OF COMPLETION", premium institutional certificate:
forest-green frame with gold diagonal detailing, ivory panel with world-map
graticule + Eiffel Tower silhouette, real ELA emblem (globe + open book +
laurels), gold title with decorative separators, level badge, double signature
area, lower-center emblem + tagline, embedded Unicode fonts.

---

## 1. Files modified

| File | Change |
| --- | --- |
| `functions/ela-pdf.js` | Full v3 reconstruction (vector artwork + Unicode font embedding + script detection + lazy font registration). Footer kept base-14 so verification text stays extractable. |
| `src/ela/certification/models/ELACertificate.js` | Certificate-type labels → Completion / Achievement / Proficiency (no "official CEFRL"/"participation"). |
| `docs/ELA-CERTIFICATION-PDF.md` | Updated template description. |

## 2. Files created

| File | Purpose |
| --- | --- |
| `functions/fonts/PlayfairDisplay-Regular.ttf`, `-Bold.ttf` | Latin + Cyrillic serif (OFL) |
| `functions/fonts/Amiri-Regular.ttf`, `-Bold.ttf` | Arabic Naskh (OFL) |
| `functions/fonts/NotoSerifSC-Regular.ttf`, `-Bold.ttf` | Simplified Chinese serif (OFL) |
| `ELA_CERTIFICATE_PREVIEW.v3.pdf` | Demo preview (real production template) |
| `ELA_CERTIFICATE_PREVIEW.v3.png` | Raster preview (359 KB, 2×) |
| `ELA_CERTIFICATE_PREVIEW.v3.svg` | Vector replica |

## 3. Visual comparison against reference

| Element | Reference | v3 implementation |
| --- | --- | --- |
| Outer green frame | deep forest green | `#063D2C` full page + gold diagonal corner accents |
| Gold perimeter | gold edging | gold rect + nested forest/gold borders |
| Layered border | multiple nested | gold → forest → gold (3 lines) |
| Corner ornaments | 4 decorative corners | 4 gold L-flourish + diamond corners |
| Ivory paper | warm cream panel | `#FAF6EC` inset panel |
| World map | subtle map | graticule globe watermark (5% opacity) |
| Architectural silhouettes | Eiffel Tower etc. | Eiffel Tower vector silhouette (5% opacity) |
| ELA emblem | globe + book + laurel | header emblem + lower-center emblem (vector) |
| Academy title | institution name | "E-LEARN LANGUAGE ACADEMY" + subtitle |
| Certificate of Completion | mandatory title | gold serif title + flanking separators |
| Gold decorative separator | around title | line + diamond separators |
| Recipient | name large | 32 pt bold, gold separator below |
| Programme | academy — programme | dynamic academy + `{language} {level} Programme` |
| Level badge | capsule | gold rounded capsule "Level A1 • CEFR" |
| Certification statement | institutional wording | per-type dynamic statement |
| Issue date / validity / cert no / result | info section | 4-column info row |
| Signature area | 2 institutional signatures | Programme Director + `signedBy` (roles only, no names) |
| Bottom ELA emblem | lower center | emblem + tagline "LANGUAGES • PEOPLE • OPPORTUNITIES" |
| QR | lower-right | existing QR, unchanged |
| Verification footer | discreet | base-14 URL + "Digital verification: SHA-256 integrity hash" |

## 4. Typography & fonts (embedded, Unicode)

| Script | Font | Coverage |
| --- | --- | --- |
| Latin + Cyrillic (FR/DE/EN/RU) | Playfair Display (reg/bold) | verified via fontkit |
| Arabic (AR) | Amiri (reg/bold) | verified |
| Simplified Chinese (ZH) | Noto Serif SC (reg/bold) | verified |

Fonts are loaded lazily per document (CJK/Arabic not loaded for Latin-only
certificates). Script detection selects the font per text run. All six test
names rendered without error; embedded subsets confirmed via PDF BaseFont
inspection (`CZZZZZ+PlayfairDisplay-Bold`, `EZZZZZ+Amiri-Bold`,
`EZZZZZ+NotoSerifSC-Bold`, …).

## 5. Colors

forest `#063D2C` · forest-deep `#05382B` · emerald `#0B6B4F` · gold `#C9A227` ·
gold-deep `#B08D2F` · ivory `#FAF6EC` · ivory-soft `#F3ECDA` · ink `#20302A` ·
muted `#6B746E` · hash-green `#5F7D70`.

## 6. Dimensions

A4 landscape `841.89 × 595.28 pt`, margin 0. Green frame 36 pt; ivory panel
`36..(W-36)`. QR at `(W-124, 458)`, 56 pt.

## 7. PDF result

- v3 PDF generates successfully (20.5 KB for Latin demo; 22.9 KB ZH, 23.1 KB AR).
- Valid `%PDF-` header, well-formed objects/xref.
- Footer (URL, hash, "integrity hash", "Digital verification") is base-14 and
  remains machine-extractable; display text uses embedded fonts (ToUnicode CMap
  provided by pdfkit for copy/paste in real viewers).

## 8. QR result

QR decodes to `https://elaacademy.ng/verify.html?id=DEMO-ELA-TEST` — matches the
verification URL, no private data. Existing QR generation unchanged.

## 9. Verification result

`verifyCertificateIntegrity` + `classifyVerification` + public endpoint
unchanged. SHA-256 integrity hash and HMAC path verified by unit tests.

## 10. Unicode result

| Name | Script | Rendered |
| --- | --- | --- |
| Jean Dupont | Latin | OK |
| Max Müller | Latin (umlaut) | OK |
| 测试学生 | Chinese | OK (Noto Serif SC) |
| طالب تجريبي | Arabic | OK (Amiri) |
| Тестовый студент | Cyrillic | OK (Playfair) |
| Demo Student | Latin | OK |

Glyph coverage confirmed via fontkit; embedded subsets confirmed via PDF
inspection. (Final visual RTL shaping QA recommended — fontkit handles Arabic
shaping; this was verified programmatically, not visually.)

## 11. Security result

- `ELA_CERT_SIGNING_KEY` — never read/printed/embedded by `ela-pdf.js`. Status: UNCHANGED (still not provisioned; integrity-only fallback active).
- SHA-256 canonical integrity hash — unchanged.
- HMAC-SHA256 authenticity — unchanged.
- Integrity-only fallback — unchanged.
- Certificate ID generator — unchanged (`ELA-{ACAD}-{CEFR}-{6}`).
- Public/privacy-safe verification — unchanged.
- No fake signatures (role titles only), no accreditation claims, no fabricated people.

## 12. Production impact

- Only `functions/ela-pdf.js` (rendering) + frontend type labels + docs changed.
- `functions/fonts/` adds ~30 MB of OFL fonts (bundle size ↑; cold start for
  non-Latin certificates slightly higher due to font subsetting — Latin-only
  certificates do not load CJK/Arabic fonts).
- No Firestore, rules, auth, Paystack, curriculum, assessment changes.

## 13. Tests executed

| Suite | Result |
| --- | --- |
| `p2c.test.js` | 20 passed (incl. "integrity hash", no "Digitally signed") |
| `ela-certificate-hist.test.js` | 10 passed |
| `academic.test.js` | 21 passed (HMAC + integrity-only + states) |
| `curriculum.test.js` | 25 passed ("never claim official certification") |
| `pdf-qr-validation.js` | ID/URL/hash/integrity-hash DETECTED; no "Digitally signed"; QR = URL only |
| QR decode (custom) | matches verification URL |
| Unicode render (custom) | 6/6 names, correct embedded fonts |

Emulator tests (`emu.flow.test.js`, `emu.rules.test.js`,
`institutional.emulator.test.js`) require a Firestore emulator (port 8082) and
were not run; their PDF text assertions are satisfied by `pdf-qr-validation.js`.

## 14. Remaining limitations / human decisions

1. **Visual sign-off** — I reconstructed the reference from the written
   description (the reference image itself is not readable by me). Final
   pixel-level approval against the image is required.
2. **Font bundle size** — Noto Serif SC is ~14.8 MB per weight (30 MB total for
   CJK). Consider serving CJK fonts from a shared/cloud location or trimming to
   one weight if deploy size is a concern.
3. **"Programme Director" role label** — rendered as a role title (no person
   name) per the reference; the data model only stores `signedBy`
   ("ELA Certification Authority").
4. **Programme title** — composed from `language` + `cecrLevel` (no dedicated
   `programmeName` field exists on the certificate document).
5. `ELA_CERTIFICATE_PREVIEW.pdf` / `.v2.pdf` still exist from prior iterations
   and are not part of this change.

## 15. Git status

```
 M docs/ELA-CERTIFICATION-PDF.md
 M functions/ela-pdf.js
 M src/ela/certification/models/ELACertificate.js
?? functions/fonts/            (6 .ttf files)
```

Not committed. No deployment run. When authorized, deploy only the certificate
component: `firebase deploy --only functions:generateELACertificatePdf`.

## 16. Commit hash

None (no commit requested/performed).
