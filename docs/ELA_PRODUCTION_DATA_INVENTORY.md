# ELA_PRODUCTION_DATA_INVENTORY

Read-only inventory of Firestore production `ela-academy-7f868`, database `(default)`, 2026-09-23.
No data was modified. Counts obtained via the Firestore REST API (aggregation count).

## Summary

- Root collections present: **12**
- Collections expected by the application but **absent**: **~55**
- Overall data completeness for a commercial/academic platform: **LOW**

## Actual counts vs expectation

| Collection | COUNT | EMPTY | Expected by app | Actual state | Missing / quality issue |
|---|---|---|---|---|---|
| `academies` | 0 | YES | YES (`getAcademyTree`, `getMyAcademies`) | EMPTY | Academy tree not seeded |
| `courses` | 5 | no | YES | 5 legacy courses (AR, EN, DE, ZH, RU) A1/HSK1 | No French course; only one level each |
| `lessons` | 104 | no | YES | AR/DE/ZH/EN/RU A1 lessons | No French lessons |
| `quizzes` | 32 | no | YES | 5 questions each, `approved` | Tied to legacy course/lesson ids |
| `users` | 9 | no | YES | real accounts | roles: mostly `student`, some admin/system |
| `subscriptions` | 2 | no | YES | 1 active (`general`), 1 revoked (`free`) | — |
| `progress` | 1 | no | YES | 1 doc, `completedLessons[1]` | — |
| `transactions` | 5 | no | YES | Paystack records | — |
| `emails` | 3 | no | YES | email→uid | — |
| `newsletterSubscribers` | 1 | no | YES | — | — |
| `marketingEvents` | 1678 | no | YES | analytics | — |
| `signupAttempts` | 4 | no | YES | rate-limit audit | — |
| `programmes` | — | ABSENT | YES (core) | MISSING | **Programme catalogue empty** (`getProgrammeCatalog` → `[]`) |
| `programme_versions` | — | ABSENT | YES | MISSING | — |
| `curriculum_nodes` | — | ABSENT | YES | MISSING | `getCurriculum` returns empty |
| `competencies` | — | ABSENT | YES | MISSING | — |
| `learning_outcomes` | — | ABSENT | YES | MISSING | — |
| `assessment_blueprints` | — | ABSENT | YES | MISSING | — |
| `examination_blueprints` | — | ABSENT | YES | MISSING | — |
| `rubrics` | — | ABSENT | YES | MISSING | — |
| `levels`/`modules`/`units` | — | ABSENT | YES | MISSING | — |
| `ela_certificates` | — | ABSENT | YES | MISSING | No certificate issued yet |
| `ela_certificate_events` | — | ABSENT | YES | MISSING | — |
| `certificate_grants` | — | ABSENT | YES | MISSING | — |
| `liveClasses` | — | ABSENT | YES | MISSING | Live page shows "no classes scheduled" |
| `class_sessions`/`attendance_records`/`attendance_corrections` | — | ABSENT | YES | MISSING | — |
| `enrollments` | — | ABSENT | YES | MISSING | — |
| `academic_records` | — | ABSENT | YES | MISSING | — |
| `examinations`/`exam_*`/`examiner_*` | — | ABSENT | YES | MISSING | — |
| `governance_*`/`review_*`/`academic_*` | — | ABSENT | YES | MISSING | — |
| `reviewer_profiles`/`staff_applications`/`teacher_profiles` | — | ABSENT | YES | MISSING | — |
| `attempts`/`results`/`assessment_events` | — | ABSENT | YES | created on demand | Normal until first assessment |
| `quizzes_bank`/`quizPublic`/`quizScores` | — | ABSENT | YES | created on demand | — |
| `invoices`/`whatsappLogs` | — | ABSENT | YES | created on demand | — |
| `rate_limits`/`assistantUsage` | — | ABSENT | YES | created on demand | — |

## Data quality observations

1. **Legacy vs institutional split.** The platform has a working *legacy catalogue* (`courses`/`lessons`/`quizzes`) but the *institutional framework* (`programmes`/`curriculum_nodes`/`competencies`/…) is entirely absent. The Student "Programme/Curriculum" experience is therefore empty.
2. **Language coverage gap.** `courses`/`lessons` cover 5 languages; **French (Francophone Academy) has no course/lesson documents**, although `data/seed` also lacks a French file. `index.html` markets 6 academies.
3. **Level coverage gap.** Only A1 (and HSK 1) exist; A2/B1/B2/C1/C2 are absent.
4. **Quizzes tied to legacy ids.** `quizzes.courseId`/`lessonId` reference the legacy `courses`/`lessons` scheme, not the institutional `programme_versions`/`curriculum_nodes`.
5. **`academies` empty** while the UI lists six academies — the tree is served from static config (`academies.config.js`) rather than Firestore, so no runtime error, but no Firestore-backed academy metadata.
6. **`progress`** exists for one user only (no broad usage yet).
7. **No test data markers** found in production (good): no documents tagged `environment: test`.

## Broken code references (blocking some seed functions)

| Reference | Status | Impact |
|---|---|---|
| `functions/core.js:578` `require('./seed-a1/…')` | directory absent | `seedAcademyA1` throws |
| `functions/core.js:706` `require('./curriculum-quizzes')` | file absent | `seedCurriculum` throws |

## Verdict

The platform is **technically operational** but **data-incomplete**: a visitor can browse 5 legacy A1 courses and quizzes, but cannot experience the institutional programme/curriculum, French, higher levels, live classes, or certificates because the corresponding data does not exist.
