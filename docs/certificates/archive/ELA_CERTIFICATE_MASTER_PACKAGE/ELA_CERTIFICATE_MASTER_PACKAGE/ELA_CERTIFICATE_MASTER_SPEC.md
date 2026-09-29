# ELA Certificate Master Package

## Purpose

This package is the handoff package for reconstructing and maintaining the E-Learn Language Academy certificate design.

**Important:** `ELA_CERTIFICATE_REFERENCE.png` is the visual reference only. It MUST NOT be used as the production static artwork because it contains demo/dynamic content.

## Source image

- Width: 1448px
- Height: 1024px
- Aspect ratio: 1.414062
- Orientation: landscape
- Reference PNG: `ELA_CERTIFICATE_REFERENCE.png`
- Reference PDF: `ELA_CERTIFICATE_REFERENCE.pdf` (if present)

## Architecture

REFERENCE IMAGE
    ↓
CLEAN STATIC ARTWORK
    ↓
ELA PDF RENDERER (`functions/ela-pdf.js`)
    ↓
FINAL CERTIFICATE

### Static layer may contain

- dark green outer background/frame
- gold border system
- ornamental corner flourishes
- top ELA emblem
- parchment/ivory background
- world map
- architectural landmarks
- decorative rules and separators
- lower ELA emblem
- static motto: LANGUAGES • PEOPLE • OPPORTUNITIES
- texture

### Static layer MUST NOT contain

- Certificate of Completion
- institution subtitle
- student name
- academy
- programme
- level
- CEFR
- issue date
- valid until
- certificate number
- overall result
- signatures
- QR code
- verification URL
- SHA-256/hash

## Dynamic regions

Coordinates below are approximate visual ROIs in the supplied reference and must be verified against the actual source image before implementation.

| ROI | Approximate region | Required dynamic content |
|---|---|---|
| title | x=360..1090, y=225..310 | Certificate title |
| recipient | x=450..1000, y=280..355 | Student name |
| academy/programme | x=400..1050, y=315..390 | Academy/programme |
| level | x=560..900, y=345..410 | Level / CEFR |
| upper metadata | x=400..1050, y=410..510 | Date / validity / cert no. / result |
| completion statement | x=300..1150, y=500..670 | Completion statement + programme |
| lower metadata | x=220..1130, y=690..790 | Date / validity / cert no. / result |
| signatures | x=130..1160, y=775..910 | Two signatures and labels |
| QR | x=1180..1410, y=760..990 | Exactly ONE QR |
| verification footer | x=90..1150, y=900..1000 | Verification URL + integrity hash |

These are **starting coordinates**, not permission to blindly copy the existing contaminated composition. The reference image must be inspected and the final coordinate system should be defined in the PDF renderer.

## Mandatory forensic QA

Cline must verify both pixels and PDF content.

### Static artwork

Dynamic content count MUST be zero:
- title = 0
- student = 0
- academy/programme = 0
- level/CEFR = 0
- metadata = 0
- signatures = 0
- QR = 0
- verification URL = 0
- hash = 0

### Final certificate

- title = 1
- student = 1
- academy = 1
- programme = 1
- level = 1
- metadata = one coherent set
- Programme Director signature = 1
- ELA Certification Authority signature = 1
- QR = exactly 1
- verification URL = 1
- integrity hash = 1

PDF text extraction alone is insufficient because text can be rasterized into a PNG background. Pixel-level inspection is mandatory.

## Security boundary

Do not modify certificate security/business logic merely to solve visual issues:

- SHA-256
- HMAC
- ELA_CERT_SIGNING_KEY
- certificate ID generation
- QR verification
- Firestore
- Storage
- Auth
- Paystack
- certificate history
- verification endpoint

## File placement recommendation

Place this package under:

`docs/certificates/master/`

Recommended project structure:

```text
docs/
└── certificates/
    └── master/
        ├── ELA_CERTIFICATE_REFERENCE.png
        ├── ELA_CERTIFICATE_REFERENCE.pdf
        ├── ELA_CERTIFICATE_MASTER_SPEC.md
        ├── ELA_CERTIFICATE_MASTER.svg
        ├── ELA_CERTIFICATE_MASTER.html
        ├── ELA_CERTIFICATE_STATIC_CLEAN.png
        └── ELA_CERTIFICATE_FINAL_QA.md
```

The clean SVG/HTML/static PNG should only be created after forensic separation. Do not fabricate a 'clean' asset by simply covering text with opaque rectangles.

## Final acceptance condition

The rendered certificate must visually match the reference composition while containing each dynamic element exactly once.

Do not commit or deploy until visual QA passes.
