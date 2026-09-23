# ELA_V7_MIGRATION_DRY_RUN_FINAL

Final dry-run after resolving the five reconciliation items. Generated 2026-09-23.
**No production write.** Machine plan: `scripts/data/dry-run-plan.json`.

## 1. Reconciliation items — status

| # | Item | Resolution |
|---|---|---|
| 1 | ZH/EN course-ID | **RESOLVED** — keep existing canonical ids (`mandarin-mandarin-hsk-1-foundations`, `english-english-essential-foundations`); dataset remapped via `canonicalCourseId`. See `COURSE_ID_RECONCILIATION_REPORT.md` |
| 2 | French lessons | **RESOLVED** — canonical = scheme B (V7 rich content); existing `fr_a1_lesson_*` preserved as aliases. See `FRENCH_LESSON_RECONCILIATION.md` |
| 3 | FR C1/C2 quizzes | **RESOLVED — KEPT** — `getQuizCatalog`/`getPublicQuiz` do not require `courseId`; level-only quizzes are supported. No false course invented. |
| 4 | Lesson schema | **RESOLVED** — one canonical schema (`{courseId}-lN` + `academyCode`/`isTrial`/`order`); 23 legacy aliases, no conflict. See `ELA_LESSON_SCHEMA_NORMALIZATION.md` |
| 5 | GENERATED_DRAFT scope | **RESOLVED** — source-derived first; generate only for genuine gaps; never replace SOURCE_DERIVED |

## 2. Validation

`VALIDATE: pass=true fail=0 warnings=2`
- WARN: `french-level-c1-quiz`, `french-level-c2-quiz` have no `courseId` (kept as level assessments — supported).
- Cross-relations validated: quiz→course, quiz→lesson, quiz→level, lesson→course, lesson→level (band-aware), academy/language.

## 3. Explicit counts

### Migration buckets (vs current Firestore: 5 courses / 104 lessons / 32 quizzes)

| Collection | CREATE | UPDATE | SKIP | CONFLICT | ALIAS | existing-not-in-dataset |
|---|---|---|---|---|---|---|
| courses | 6 | 5 | 0 | **0** | 0 | 0 |
| lessons | 41 | 32 | 0 | **0** | 23 | 72 |
| quizzes | 31 | 0 | 0 | **0** | 0 | 32 |
| **TOTAL** | **78** | **37** | **0** | **0** | **23** | **104** |

### Classification buckets

| Classification | Documents | Detail |
|---|---|---|
| **SOURCE_DERIVED** | 115 | 11 courses + 73 lessons + 31 quizzes (FR from V7; 5 academies from ELA seed) |
| **GENERATED_DRAFT** | 36 (planned) | institutional programmes (6 academies × 6 levels) — not yet generated/seeded |
| **DATA_REQUIRED** | 4+ | V7 seed live classes (placeholder instructors) + real teachers + live schedules |
| **PENDING_MAPPING** | **0** | none blocking (C1/C2 quizzes kept; C1/C2 lessons are a GENERATED_DRAFT gap, not a mapping) |
| **TEST_DATA** | 4 | V7 seed live classes (excluded from seed) |

## 4. What the seed would write (on approval)

- **courses**: create 6 (French), update 5 (non-French, merge) → 11.
- **lessons**: create 41 (18 new FR A2/B1/B2 + 23 canonical with legacy alias), update 32 → 73.
- **quizzes**: create 31 (6 French CEFR quizzes / 120 questions + 25 academy quizzes) → 31.
- **programmes/curriculum** (GENERATED_DRAFT, separate step): 36.

## 5. What the seed would NOT touch

- No deletion of any document.
- Existing scheme-A lessons (72), existing scheme-B lessons beyond update (none), existing courses/quizzes, users, roles, subscriptions, payments, attempts, results, certificates, live classes.
- Critical collections (users/subscriptions/payments/attempts/results/certificates) are outside the seeder allowlist.

## 6. Provenance

Every written doc carries `sourceAcademy` / `sourceVersion` / `sourceType` / `contentState`. V7 French = `SOURCE_DERIVED`; other academies A1 = `SOURCE_DERIVED`; programmes = `GENERATED_DRAFT`; live classes = `TEST_DATA` (not seeded). No content is labelled officially certified.

## 7. Safety

- `--seed` refuses without `--confirm` + `GOOGLE_APPLICATION_CREDENTIALS`; this build is dry-run only.
- No delete path; upsert-merge by stable id.
- Pre-write backup required before any production seed (see plan in `docs/ELA_PRODUCTION_DATA_BACKUP.md`).

## 8. Verdict

**Dry-run CLEAN: 0 conflicts, 0 PENDING_MAPPING.** Ready for the next step: production backup → final validation → controlled seed. **No production write performed.**
