# FRANCOPHONE_V7_TO_ELA_DATA_MODEL

Data-model comparison, the canonical ELA master architecture, and the migration/generalization map.
No production data is written by this document.

## 1. Collection mapping (V7 → ELA)

| V7 collection | ELA target | Mapping / notes |
|---|---|---|
| `courses` | `courses` | add `academy` (V7 is French-only); keep `level`, `category`, `planRequired`, `learningOutcomes`, `order`, `status` |
| `lessons` | `lessons` | V7 auto-IDs → **stable IDs** `{ac}_{level}_lesson_{n}`; add `academyCode`, `level`, `order`, `isTrial`, `content`, `vocabulary`, `status` |
| `modules` | `modules` / `curriculum_nodes` | optional grouping → ELA institutional nodes |
| `enrollments` | `enrollments` (+ `progress`) | V7 `progress{completedLessons,percentComplete}` → ELA `progress/{uid}.completedLessons` (append-only) + `enrollments` for institutional |
| `quizzes` | `quizzes` + `quizzes_bank` | V7 `correctAnswer` → ELA `correctIndex` (server-only); add `academy`, `lessonId`, `courseId` |
| `quizAttempts` | `attempts` + `results` | V7 server-scored attempt → ELA attempt (seed/order) + result (finalized, idempotent) |
| `certificates` | `ela_certificates` | V7 quiz certificate → ELA certificate with integrity hash, revocation, reissue |
| `liveClasses` (+`attendees`) | `liveClasses` (+`class_sessions`, `attendance_records`) | keep scheduling; add attendance module |
| `liveSessions` (+`participants`) | `class_sessions` | runtime session/presence |
| `users` (+ embedded `subscription`, `stats`) | `users` + `subscriptions/{uid}` | **normalize**: subscription moves to its own doc (ELA model) |
| `subscriptions` | `subscriptions/{uid}` | same concept; ELA keyed by uid |
| `payments` | `transactions` | payment records |
| `customInvoices` | `invoices` | custom invoices |
| `pricing/current` | `PRICE_TABLE` (code) | **already aligned** (general 75k / premium 120k / business 150k) |
| `referrals` | referral logic in `payment.js`/`index.js` | already present |
| `forumPosts` | *(new)* `community` | optional port |
| `tutorSessions` | *(new)* `tutorSessions` | optional port |
| `notifications`, `newsletter`, `marketingEvents`, `analyticsEvents` | `marketingEvents`, `newsletterSubscribers`, `emails` | partially present |
| `accessExtensions` | `role_audit_events`/`academic_events` | audit trail |
| `versions`, `generationJobs`, `videoJobs`, `videoProjects`, `counters` | *(out of scope)* | media/AI tooling |

## 2. ID conventions (ELA canonical, to apply during migration)

```
academy:    {academyCode}                      e.g. FR, DE, ZH, EN, AR, RU
course:     {language}-{slug}                  e.g. french-foundations-a1
lesson:     {ac}_{level}_lesson_{n}            e.g. fr_a1_lesson_1
module:     {ac}-{level}-M{nn}                 e.g. FR-A1-M01
unit:       {ac}-{level}-M{nn}-U{nn}
programme:  prog_{ac}_{level}                  e.g. prog_FR_A1
quiz:       {courseId}-l{n}-quiz   (legacy)  |  quiz-{level} (CEFR bank)
attempt:    {uid}_{quizId}_{nonce}
result:     {attemptId}
certificate:ELA-{ac}-{level}-{suffix}
```

## 3. Canonical ELA master architecture (Phase G)

```
┌───────────────────────────── ELA CORE (shared, one implementation) ─────────────────────────────┐
│ auth · profiles · roles (student/teacher/admin/system/academy_admin) · subscriptions ·           │
│ entitlements · dashboard · learning (courses/lessons) · progress · quizzes/assessments ·         │
│ certificates · live classes · teacher tools · admin · notifications · analytics                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                    ▲ academy config            ▲ language content            ▲ academy rules
┌───────────────────────────┐   ┌────────────────────────────┐   ┌────────────────────────────┐
│ ACADEMY CONFIGURATION     │   │ LANGUAGE CONTENT           │   │ ACADEMY BUSINESS RULES     │
│ academyCode, language,    │   │ courses, lessons,          │   │ pricing/plan gating,       │
│ branding, levels,         │   │ quizzes_bank, programmes,  │   │ certificate rules,         │
│ planRequired mapping      │   │ curriculum_nodes           │   │ live schedule, free trial  │
└───────────────────────────┘   └────────────────────────────┘   └────────────────────────────┘
```

**Principle:** ONE core + academy configuration + language content + academy-specific business rules — **not** six independent apps. Every core document carries `academy`/`academyCode` so a single engine serves all six languages.

## 4. Migration / generalization map (Phase H)

| Academy | Content source | Source type | Current ELA state | Action |
|---|---|---|---|---|
| **Francophone (FR)** | V7 `courses` (6), `lessons` (23 rich), `quizzes` (6 / 120 q) | **SOURCE_DERIVED** | no FR courses/lessons in prod | **MIGRATE** → normalize into ELA `courses`/`lessons`/`quizzes_bank` with stable IDs + provenance |
| Francophone (FR) C1/C2 lessons | not in V7 | **GENERATED_EXTENSION** | absent | generate drafts (pending review) |
| Germanophone (DE) | ELA `data/seed/germanophone-a1.json` (10 lessons + 5 quizzes) | SOURCE_DERIVED (project) | 1 course, ~21 lessons | KEEP + extend (A2+) as GENERATED_DRAFT |
| Sinophone (ZH) | ELA `data/seed/sinophone-a1.json` | SOURCE_DERIVED (project) | 1 course (HSK 1) | KEEP + extend |
| Anglophone (EN) | ELA `data/seed/anglophone-a1.json` | SOURCE_DERIVED (project) | 1 course (A1–A2) | KEEP + extend |
| Arabophone (AR) | ELA `data/seed/arabophone-a1.json` | SOURCE_DERIVED (project) | 1 course | KEEP + extend |
| Russophone (RU) | ELA `data/seed/russophone-a1.json` | SOURCE_DERIVED (project) | 1 course | KEEP + extend |
| All six — institutional framework | `functions/curriculum-content.js` + `academic-framework.js` | **GENERATED_DRAFT** | absent | GENERATE programmes/curriculum_nodes (dry-run first) |
| All six — live classes | none | — | absent | `DATA_REQUIRED` (scheduling is a human action) |
| All six — teachers/instructors | V7 seed names are placeholders | — | absent | `DATA_REQUIRED` (do not invent) |
| All six — accreditation/partners/prices | — | — | — | `MISSING_OFFICIAL_DATA` (do not invent) |

## 5. Provenance fields to attach on migrated/generated docs

```
sourceAcademy: 'Francophone Academy' | 'ELA'
sourceVersion: 'V7' | 'ELA-seed'
sourceType:    'SOURCE_DERIVED' | 'GENERATED_DRAFT' | 'SOURCE_VERIFIED' | 'TEST_DATA'
contentState:  'DRAFT' | 'APPROVED' | 'PUBLISHED'
```
Migrated V7 content is `SOURCE_DERIVED` and must **not** be labelled officially certified.

## 6. Normalization rules (for the future seeder — not executed here)

1. Deterministic, stable IDs (no auto-IDs).
2. Idempotent upsert (`merge`), never delete.
3. Allowlist of collections and fields; type/relation/status validation.
4. Relationship validation: `lesson.courseId` exists; `quiz.lessonId`/`courseId` exist; no orphan quiz/lesson.
5. `correctAnswer`/`correctIndex` never written to any client-readable projection.
6. Dry-run with a full report (create/update/skip/conflict) before any write.
7. Backup of target collections before writing.

## 7. Key decisions (for validation)

- **French**: treat V7 as `SOURCE_DERIVED` (not "missing"). Migrate courses/lessons/quizzes into ELA's schema.
- **Other five**: keep ELA seed as base; generalize the structure from the V7-proven `course → module → lesson → assessment` spine; extend as `GENERATED_DRAFT`.
- **Institutional layer**: generate from `curriculum-content.js` as `GENERATED_DRAFT`, pending academic review (never "official").
- **No invention**: teachers, accreditation, partners, prices, statistics remain `DATA_REQUIRED`/`MISSING_OFFICIAL_DATA`.
