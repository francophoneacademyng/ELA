# ELA_CROSS_ACADEMY_DATA_READINESS_FINAL

Cross-academy readiness after the V7 reconciliation dry-run. Generated 2026-09-23. **No production write.**

## 1. One core · six academies · six languages

The generalized schema is proven across all six academies: every course/lesson/quiz carries `academy` + `academyCode`; levels map CEFR ↔ HSK via a band function (`A1↔HSK1 … C2↔HSK6`); one engine serves all six.

## 2. Per-academy readiness

| Academy | Code | Levels | Courses | Lessons | Quizzes | Source | Readiness |
|---|---|---|---|---|---|---|---|
| Francophone Academy | FR | A1–C2 | 6 | 23 | 6 (120 q) | **V7 SOURCE_DERIVED** | **READY** (C1/C2 lessons = GENERATED_DRAFT gap) |
| Germanophone Academy | DE | A1–C2 | 1 | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (A1) |
| Sinophone Academy | ZH | HSK1–6 | 1 | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (HSK1) |
| Anglophone Pro Academy | EN | A1–C2 | 1 | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (A1) |
| Arabophone Academy | AR | A1–C2 | 1 | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (A1) |
| Russophone Academy | RU | A1–C2 | 1 | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (A1) |

## 3. Level coverage (lessons)

| Academy | A1/HSK1 | A2/HSK2 | B1/HSK3 | B2/HSK4 | C1/HSK5 | C2/HSK6 |
|---|---|---|---|---|---|---|
| FR | 5 | 4 | 8 | 6 | 0 | 0 |
| DE/ZH/EN/AR/RU | 10 each | 0 | 0 | 0 | 0 | 0 |

## 4. Classification (SOURCE_DERIVED first, then gaps)

| Classification | Content | Count |
|---|---|---|
| **SOURCE_DERIVED** | FR courses/lessons/quizzes (V7); 5 academies A1 courses/lessons/quizzes (ELA seed) | 11 courses · 73 lessons · 31 quizzes · 245 questions |
| **GENERATED_DRAFT** (gaps only) | institutional programmes/curriculum (6×6); FR C1/C2 lessons; A2+ extensions for the other five | 36 programmes + extensions (not yet generated) |
| **DATA_REQUIRED** | real teachers/instructors; live-class schedules | — |
| **MISSING_OFFICIAL_DATA** | accreditation, registration, partners, official prices beyond `PRICE_TABLE`, statistics | — |
| **TEST_DATA** | V7 seed live classes (placeholder instructors) — excluded from seed | 4 |

No SOURCE_DERIVED content is replaced by GENERATED_DRAFT. No fake teachers/partners/accreditations/prices/statistics are produced.

## 5. Institutional framework

`functions/curriculum-content.js` + `academic-framework.js` generate **36 programmes** (6 academies × 6 levels) with modules/units/lessons and `contentState = DRAFT`. Source type **GENERATED_DRAFT**. Not yet seeded.

## 6. Final dry-run buckets (all six academies)

| Bucket | Count |
|---|---|
| CREATE | 78 (6 courses + 41 lessons + 31 quizzes) |
| UPDATE | 37 (5 courses + 32 lessons) |
| SKIP | 0 |
| CONFLICT | 0 |
| ALIAS (legacy scheme-A) | 23 |
| existing-not-in-dataset (preserved) | 104 |
| PENDING_MAPPING | 0 |

## 7. Blocking items

**None.** The five reconciliation items are resolved. Remaining items are non-blocking content gaps (C1/C2 and A2+ lessons) to be generated as GENERATED_DRAFT, and business data (DATA_REQUIRED / MISSING_OFFICIAL_DATA).

## 8. Verdict

| Dimension | Status |
|---|---|
| Normalization/mapping layer | READY |
| Idempotent seed system | READY (dry-run; `--seed` guarded) |
| French content (V7) | READY |
| Other five academies | PARTIAL (A1 seed; extend as GENERATED_DRAFT) |
| Institutional framework | GENERATED_DRAFT ready to generate |
| Cross-academy generalization | PROVEN (one core, six academies) |
| **Overall** | **READY WITH WARNINGS — dry-run clean; awaiting approval for backup → controlled production seed** |

**No production write performed.**
