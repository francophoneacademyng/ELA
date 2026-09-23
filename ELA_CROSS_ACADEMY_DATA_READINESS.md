# ELA_CROSS_ACADEMY_DATA_READINESS

Readiness of the six ELA academies after the V7 normalization/migration dry-run.
Generated 2026-09-23. **No production data modified.**

## 1. Per-academy status

| Academy | Code | Levels | Courses (dataset) | Lessons (dataset) | Quizzes (dataset) | Content source | Readiness |
|---|---|---|---|---|---|---|---|
| Francophone Academy | FR | A1–C2 | 6 | 23 | 6 (120 q) | **V7 SOURCE_DERIVED** | **READY (content)** |
| Germanophone Academy | DE | A1–C2 | 1 (A1) | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (A1 only) |
| Sinophone Academy | ZH | HSK1–6 | 1 (A1/HSK1) | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (HSK1 only) |
| Anglophone Pro Academy | EN | A1–C2 | 1 (A1) | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (A1 only) |
| Arabophone Academy | AR | A1–C2 | 1 (A1) | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (A1 only) |
| Russophone Academy | RU | A1–C2 | 1 (A1) | 10 | 5 | ELA seed SOURCE_DERIVED | PARTIAL (A1 only) |

## 2. Level coverage (lessons per academy/level)

| Academy | A1/HSK1 | A2/HSK2 | B1/HSK3 | B2/HSK4 | C1/HSK5 | C2/HSK6 |
|---|---|---|---|---|---|---|
| FR | 5 | 4 | 8 (2 courses) | 6 (2 courses) | 0 | 0 |
| DE | 10 | 0 | 0 | 0 | 0 | 0 |
| ZH | 10 | 0 | 0 | 0 | 0 | 0 |
| EN | 10 | 0 | 0 | 0 | 0 | 0 |
| AR | 10 | 0 | 0 | 0 | 0 | 0 |
| RU | 10 | 0 | 0 | 0 | 0 | 0 |

## 3. Institutional framework (programmes / curriculum)

`functions/curriculum-content.js` + `academic-framework.js` can generate **36 programmes** (6 academies × 6 levels) with modules/units/lessons, `contentState = DRAFT` (A1/A2 have real language-specific vocabulary/examples/dialogue; advanced levels are thematic placeholders). Source type: **GENERATED_DRAFT**. **Not yet seeded** (dry-run only).

## 4. Per-academy gaps

| Academy | Missing content | Missing institutional | Missing business (DATA_REQUIRED) |
|---|---|---|---|
| FR | C1/C2 lessons | programmes/curriculum (generate DRAFT) | teachers, live schedule, accreditation |
| DE | A2–C2 lessons | programmes/curriculum | teachers, live schedule, accreditation |
| ZH | HSK2–6 lessons; level normalisation (A1 vs HSK1) | programmes/curriculum | teachers, live schedule, accreditation |
| EN | A2–C2 lessons | programmes/curriculum | teachers, live schedule, accreditation |
| AR | A2–C2 lessons | programmes/curriculum | teachers, live schedule, accreditation |
| RU | A2–C2 lessons | programmes/curriculum | teachers, live schedule, accreditation |

## 5. Data classification

- **SOURCE_DERIVED** — FR: V7 (6 courses / 23 lessons / 6 quizzes / 120 q). Other 5: ELA `data/seed/*-a1.json`.
- **GENERATED_DRAFT** — 36 programmes/curriculum (from `curriculum-content.js`); C1/C2 French extensions; A2+ extensions for the other five.
- **TEST_DATA** — V7 seed live classes (placeholder instructors).
- **DATA_REQUIRED** — real teachers/instructors; live-class schedules.
- **MISSING_OFFICIAL_DATA** — accreditation, registration, partners, official prices beyond the project `PRICE_TABLE`, statistics.

## 6. Provenance rules applied

| Content | sourceAcademy | sourceVersion | sourceType | contentState |
|---|---|---|---|---|
| French courses/lessons/quizzes | Francophone Academy | V7 | SOURCE_DERIVED | SOURCE_DERIVED |
| Other academies A1 | ELA | ELA-seed | SOURCE_DERIVED | SOURCE_DERIVED |
| Programmes/curriculum | ELA | ELA-generated | GENERATED_DRAFT | DRAFT |
| Live classes (seed) | Francophone Academy | V7 | TEST_DATA | TEST_DATA (not seeded) |

No migrated/generated content is labelled officially certified or institutionally approved.

## 7. Cross-academy generalization outcome

The dry-run confirms the target architecture works for **ONE CORE + SIX ACADEMIES + SIX LANGUAGES**:
- Every course/lesson/quiz carries `academy` + `academyCode`; one schema serves all six.
- Levels map CEFR ↔ HSK via a band function (`A1↔HSK1 … C2↔HSK6`).
- French is the pedagogical template (course → module → lesson → assessment); the other five inherit the structure with language-specific content.
- Existing production content (courses, 104 lessons, 32 quizzes) is preserved; no deletion.

## 8. Blocking items before a production seed

1. Resolve **ZH/EN course-ID mismatch** (avoid duplicate courses).
2. Resolve **French lesson reconciliation** (existing `fr_a1_lesson_*` vs V7 lessons).
3. Decide **level-only quizzes** (FR C1/C2 without a course).
4. Decide **lesson-scheme normalization** (72 `{ac}_a1_lesson_*` + 32 `{courseId}-l*`).
5. Confirm scope of **GENERATED_DRAFT** programmes/curriculum.

## 9. Verdict

| Dimension | Status |
|---|---|
| Normalization/mapping layer | READY |
| Idempotent seed system | READY (dry-run; `--seed` guarded) |
| French content (V7) | READY (with conflicts to resolve) |
| Other five academies | PARTIAL (A1 seed only) |
| Institutional framework | GENERATED_DRAFT ready to seed |
| Cross-academy generalization | PROVEN (one core, six academies) |
| **Overall** | **READY WITH WARNINGS — dry-run complete, awaiting review before production seed** |

**No production write was performed.**
