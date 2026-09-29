# ELA Certificate — Design Specification

**Source of truth:** `functions/ela-pdf.js` (layout/coordinates) + `docs/certificates/ELA_CERTIFICATE_REFERENCE.png` (visual design). This document describes the authoritative master.

---

## 1. Page format

| Attribute | Value |
| --- | --- |
| Orientation | Landscape |
| Size | A4 — 841.89 × 595.28 pt |
| Margin | 0 (full-bleed) |

The static artwork is a 1448×1086 px reference raster, placed fit-to-height
with no distortion: scale `S = 595.28 / 1086 ≈ 0.5481`, rendered width
`793.6 pt`, centered horizontally at `OX = (841.89 − 793.6) / 2 ≈ 24.15 pt`,
with forest-green letterbox bars on each side.

## 2. Coordinate system

Single system derived from the reference raster:

```
rx(x) = 24.15 + x · 0.5481     (reference x → PDF x)
ry(y) = y · 0.5481             (reference y → PDF y)
rs(s) = s · 0.5481             (reference size → PDF size)
```

## 3. Palette

| Role | Hex |
| --- | --- |
| Forest green (frame) | `#043732` |
| Forest deep | `#02312B` |
| Emerald (emblem) | `#0E3D36` |
| Gold | `#D79D39` / `#C9A227` |
| Gold (student name) | `#A87B1E` |
| Gold light (programme) | `#E8D9A8` |
| Bronze | `#835712` / `#A47526` |
| Ivory (paper) | `#FBF3E0` |
| Ink / info green | `#06352F` / `#20302A` |
| Muted / hash green | `#6B746E` / `#5F7D70` |

## 4. Layers (z-order)

1. Forest-green page fill.
2. Static artwork (`ELA_CERTIFICATE_STATIC.png`) — frame, borders, ornaments,
   world map, landmarks, top emblem, heading, subtitle, "Certificate of
   Completion", separators, presentation sentence, "for successfully completing
   the", certification paragraph, signatures, lower emblem, motto, bottom
   ornaments.
3. Dynamic overlay (PDFKit) — see §7.

## 5. Static elements (in the raster, never duplicated)

- Outer green frame + gold/dark-green/bronze border system
- Corner ornaments, diagonal gold accents
- World-map graticule, Eiffel Tower + classical arch silhouettes
- ELA emblem (globe + open book + laurel + "ELA") — header and lower-center
- "E-LEARN LANGUAGE ACADEMY" + subtitle
- "CERTIFICATE OF COMPLETION" + decorative separators
- "This certificate is proudly presented to"
- "for successfully completing the"
- Certification paragraph
- Left/right signature blocks (Programme Director / ELA Certification Authority)
- "LANGUAGES • PEOPLE • OPPORTUNITIES" motto
- Bottom ornaments

## 6. Dynamic fields (rendered exactly once by PDFKit)

| Field | Token | Reference position (y/x) | Font (Playfair Display) | Colour |
| --- | --- | --- | --- | --- |
| Student name | `{{STUDENT_NAME}}` | y 305, centered | bold 27 | `#A87B1E` |
| Academy | `{{ACADEMY_NAME}}` | y 344, centered | bold 26 | `#E8D9A8` |
| Programme | `{{PROGRAMME_NAME}}` | y 363, centered | bold 26 | `#E8D9A8` |
| Level | `{{LEVEL}}` | y 373, centered | bold 17 | `#06352F` |
| Issue date label/value | `{{ISSUE_DATE}}` | y 454 / 498 | 13 / 24 | `#06352F` |
| Valid until label/value | `{{VALID_UNTIL}}` | y 454 / 498 | 13 / 24 | `#06352F` |
| Certificate no. label/value | `{{CERTIFICATE_NUMBER}}` | y 454 / 498 | 13 / 24 | `#06352F` |
| Overall result label/value | `{{RESULT}}` | y 454 / 498 | 13 / 24 | `#06352F` |
| QR | `{{QR_CODE}}` | x 1230, y 860, 150 px | — | — |
| Verification URL | `{{VERIFICATION_URL}}` | x 130, y 982 | Helvetica 7.5 | `#6B746E` |
| SHA-256 hash | `{{CERTIFICATE_HASH}}` | x 130, y 998 | Courier 6 | `#5F7D70` |

Metadata columns: 4 columns, width 150 pt-equivalent, gap 14 pt-equivalent,
centered.

## 7. Typography (dynamic)

- Embedded OFL fonts: Playfair Display (Latin/Cyrillic), Amiri (Arabic),
  Noto Serif SC (Chinese). Script auto-selected per text run.
- Footer URL/hash use base-14 Helvetica/Courier (kept machine-extractable).

## 8. QR

Exactly one QR, lower-right, encodes the verification URL
`https://elaacademy.ng/verify.html?id={certificateId}`. Does not overlap
signatures, motto, or footer.

## 9. Duplication rule

Every element appears exactly once. The static raster contains no dynamic
data; dynamic fields are overlaid once. Certificate number appears in the
metadata value AND in the verification URL query (correct, not duplication).

## 10. Master files

| File | Purpose |
| --- | --- |
| `ELA_CERTIFICATE_REFERENCE.png` | Visual design reference |
| `ELA_CERTIFICATE_STATIC.png` | Static artwork (dynamic text masked out) |
| `ELA_CERTIFICATE_MASTER.svg` | Vector master: static PNG + placeholder tokens |
| `ELA_CERTIFICATE_MASTER.html` | Browser preview of the master |
| `ELA_CERTIFICATE_MASTER_TEST.pdf` / `.png` | Test render (demo data) |
| `CERTIFICATE_MODEL.md` | Certificate data/security model |
| `ELA_CERTIFICATE_DESIGN.md` | This specification |
