# ELA_CONTENT_SOURCE_REGISTER

Purpose: classify every content/data source found in the repository so that nothing is presented as "official" without a verifiable project source.
Rule: if an official datum is absent, it is marked `MISSING_OFFICIAL_DATA` — never invented.

## A. OFFICIAL SOURCE DATA

**None found in the repository.**

No external-authority document (government registration, accreditation certificate, awarding-body agreement, official price list, signed partner agreement, official address/contact record) exists in the repo. Anything of that nature must be treated as `MISSING_OFFICIAL_DATA`.

`MISSING_OFFICIAL_DATA` (do not invent):
- Legal entity registration / incorporation number
- Accreditation / regulatory approval
- Official institutional address, phone, registered contacts
- Named teachers / academic board members
- Signed institutional partners
- Certification awarding-body affiliation (DELF, Goethe, HSK, IELTS, TORFL…) — only "CEFR-aligned / HSK-aligned" wording is justified
- Official prices (only the project's own `PRICE_TABLE` exists — see B)

## B. EXISTING PROJECT DATA (authored inside the repo; project's own source)

| Source | Path | Nature |
|---|---|---|
| Curriculum content (6 languages, modules/vocab/examples/dialogue) | `functions/curriculum-content.js` | ELA-authored; `contentState` = `DRAFT`/`MISSING` |
| Academic framework (competencies, outcomes, blueprints, programme definitions) | `functions/academic-framework.js` | ELA-authored definitions |
| A1 lesson + quiz seed (5 languages) | `data/seed/{anglophone,arabophone,germanophone,russophone,sinophone}-a1.json` | ELA-authored A1 content |
| Legacy catalogue seed logic | `functions/core.js` (`seedAcademyA1`, `seedCurriculum`) | seed functions |
| Academy display config | `src/shared/config/academies.config.js` | 6 academies metadata |
| Pricing table (server) | `functions/index.js` `PRICE_TABLE` (`general/premium/business`) | project-defined prices |
| Pricing page | `pricing.html`, `js/app.js` | project marketing copy |
| i18n | `i18n/{en,fr,ar,de,ru,zh,es}.json` | project translations |
| Lead-magnet content | `src/ela/data/lead-magnets.data.js`, `lead-magnets/*.html` | project marketing |
| Institutional policy documents | `docs/academic/**`, `docs/fme/**` | ELA internal policy drafts |
| FME / institutional dossiers | `ELA_FME_*.md` (repo root) | ELA internal drafts |
| Certification specs | `docs/certificates/**`, `functions/ela-certificate-core.js` | project spec |
| Marketing claims | `index.html`, `js/marketing.js` | project copy (claims must not exceed evidence) |

## C. GENERATED PEDAGOGICAL CONTENT

Content produced deterministically by the project code at seed time (not hand-written, not externally validated):
- `functions/curriculum-content.js` → `buildLevelContent(academy, level)` : 6 modules × 3 units × 2 lessons = **36 lessons per level**, 6 levels → 36 programmes.
- Status flags emitted by the code: `DRAFT` (A1/A2 with real language-specific content) and `MISSING`/placeholder for advanced levels.
- **Not** human-reviewed. Must be stored with `contentState`/`status` reflecting draft, e.g. `pending_review` / `DRAFT` — never `published`/`approved` without academic review.

## D. GENERATED DEMO / TEST DATA

| Source | Path | Nature |
|---|---|---|
| Test fixtures | `functions/test/*.js`, `*.fixture.js` | emulator/local only |
| Diagnostic artefacts | `.tmp-*.js`, `_*`, `emu*`, `pdfdiag*` | local diagnostics (not production) |
| Temporary seed/check scripts | `scripts/*.js` | dev tooling |

No demo/test data was found in production Firestore.

## E. DATA REQUIRING HUMAN APPROVAL

Before any item in this class is marked `published`/`approved` or shown as institutional fact:
- All curriculum/lesson/quiz content (academic review) — see `docs/academic/ELA_ACADEMIC_REVIEW_POLICY.md`
- Programme/curriculum versions (governance approval)
- Certificate issuance rules and certificate templates
- Any institutional, regulatory or accreditation statement
- Pricing/promotional claims
- Teacher/instructor identities

## Status vocabulary used in this mission

- `SOURCE_VERIFIED` — backed by an existing project source (class B).
- `GENERATED_DRAFT` — produced by project code, not human-reviewed (class C).
- `TEST_DATA` — test/demo only (class D).
- `MISSING_OFFICIAL_DATA` — required but absent; must not be invented (class A).

## Practical consequence

The platform can be seeded today with **SOURCE_VERIFIED project data** (B) and **GENERATED_DRAFT pedagogical content** (C), clearly flagged as draft. It **cannot** be presented as officially accredited, and no institutional/regulatory/pricing fact may be invented. Items in class A remain `MISSING_OFFICIAL_DATA`.
