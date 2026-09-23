# FRANCOPHONE_V7_CONTENT_CATALOG

Inventory of the actual French learning content in Francophone Academy V7.
Nothing was rewritten at this stage. Provenance is recorded for each source.
Classification: `SOURCE_DERIVED` (exists in V7), `GENERATED_EXTENSION` (to be produced), `MISSING`.

## Content volumes (verified)

| Content type | Count | Source |
|---|---|---|
| Courses | 6 | `scripts/seed-data.js` |
| Lessons (rich bodies) | 23 | `scripts/update-all-lessons.js` |
| Assessments (quizzes) | 6 (A1→C2) | `scripts/update-quizzes.js` |
| MCQ questions | 120 (20 per level) | `scripts/update-quizzes.js` |
| Initial quizzes (superseded) | 2 (A1/A2, 10 q) | `scripts/seed-data.js` |
| Live classes (seed) | 4 | `scripts/seed-data.js` |
| Pricing doc | 1 (`pricing/current`) | `scripts/seed-data.js` |

## Courses (source: `scripts/seed-data.js`, enriched by `update-all-lessons.js`)

| courseId | Title | Level | Category | planRequired | Lessons |
|---|---|---|---|---|---|
| `french-foundations-a1` | French Foundations A1 | A1 | grammar | general | 5 |
| `everyday-conversations-a2` | Everyday Conversations A2 | A2 | vocabulary | general | 4 |
| `intermediate-grammar-b1` | Intermediate Grammar B1 | B1 | grammar | premium | 4 |
| `business-communication-b1` | Business Communication | B1 | business | business | 4 |
| `advanced-writing-b2` | Advanced Writing B2 | B2 | grammar | premium | 3 |
| `french-culture-history-b2` | French Culture & History | B2 | culture | general | 3 |

## Lessons (source: `scripts/update-all-lessons.js`)

23 lessons with rich HTML bodies (sections, vocabulary tables, dialogues with a Nigerian context, tips, mini-exercises). The first 3 lessons of every course are `isFree: true` (8 free lessons total by convention).

| courseId | # | Lesson titles (order) |
|---|---|---|
| french-foundations-a1 | 5 | French Sounds and the Alphabet · Greetings and Introductions · Numbers 1–100 · Articles (le/la/les, un/une) · Être & Avoir (present) |
| everyday-conversations-a2 | 4 | Talking About Your Day · At the Restaurant · Past Events (passé composé) · Making Plans |
| intermediate-grammar-b1 | 4 | Opinions and Connectors · Object Pronouns · Introduction to the Subjunctive · Hypotheses (si clauses) |
| business-communication-b1 | 4 | Professional Email Structure · Meetings: Interrupting/Agreeing · Phone Calls · Presenting a Project |
| advanced-writing-b2 | 3 | Essay Structure for DELF B2 · Formal vs Informal Register · Connectors of Argumentation |
| french-culture-history-b2 | 3 | The Francophone World Today · Social Etiquette (tu/vous) · Key Moments of French History |

## Assessments (source: `scripts/update-quizzes.js`)

| quizId | Title | Level | Questions | passingScore | timeLimit |
|---|---|---|---|---|---|
| `quiz-a1` | A1 Beginner Assessment | A1 | 20 | 80 | 15 |
| `quiz-a2` | A2 Elementary Assessment | A2 | 20 | 80 | 15 |
| `quiz-b1` | B1 Intermediate Assessment | B1 | 20 | 80 | 15 |
| `quiz-b2` | B2 Upper-Intermediate Assessment | B2 | 20 | 80 | 15 |
| `quiz-c1` | C1 Advanced Assessment | C1 | 20 | 80 | 15 |
| `quiz-c2` | C2 Mastery Assessment | C2 | 20 | 80 | 15 |

Question shape: `{ id, type:'multiple_choice', question, options[], correctAnswer(index), explanation, points:5 }`.

## Live classes (source: `scripts/seed-data.js`)

| Title | Level | Instructor (seed) | Duration | maxStudents |
|---|---|---|---|---|
| A1 Conversation Practice | A1 | Marie Dubois | 60 | 30 |
| Business French: Email Writing Workshop | B1 | Jean-Pierre Laurent | 90 | 25 |
| B2 Grammar Deep Dive | B2 | Sophie Martin | 75 | 20 |
| DELF B2 Speaking Preparation | B2 | Claire Bernard | 120 | 15 |

> Instructor names above are **seed placeholders**. They are **not verified real teachers** and must not be presented as such (`DATA_REQUIRED`).

## Per-source catalogue

| Source file | Content type | Programme | Level | Language | Status | Reusability | ELA target |
|---|---|---|---|---|---|---|---|
| `scripts/seed-data.js` | courses (6) | French | A1–B2 | fr | SOURCE_DERIVED | high | ELA `courses` (Francophone) |
| `scripts/seed-data.js` | quizzes (2, superseded) | French | A1,A2 | fr | SOURCE_DERIVED (superseded) | low | skip |
| `scripts/seed-data.js` | liveClasses (4) | French | A1–B2 | fr | SOURCE_DERIVED (placeholder instructors) | medium | ELA `liveClasses` (draft) |
| `scripts/seed-data.js` | pricing | — | — | — | SOURCE_DERIVED | high | ELA pricing (already aligned) |
| `scripts/update-all-lessons.js` | lessons (23, rich) | French | A1–B2 | fr | SOURCE_DERIVED | **high** | ELA `lessons` (Francophone) |
| `scripts/update-quizzes.js` | quizzes (6) + 120 questions | French | A1–C2 | fr | SOURCE_DERIVED | **high** | ELA `quizzes`/`quizzes_bank` (Francophone) |
| `functions/src/catalog.js` | access/scoring logic | — | — | — | SOURCE_DERIVED | high | ELA callable logic (reference) |
| `public/js/pages/classroom.js` | lesson player UX | — | — | — | SOURCE_DERIVED | medium | ELA lesson rendering (reference) |
| `public/js/pages/quiz-take.js` | assessment UX | — | — | — | SOURCE_DERIVED | medium | ELA quiz UX (reference) |

## Coverage matrix (French)

| Level | Lessons (V7) | Assessment (V7) | Gap |
|---|---|---|---|
| A1 | 5 | 20 q | — |
| A2 | 4 | 20 q | — |
| B1 | 8 (2 courses) | 20 q | — |
| B2 | 6 (2 courses) | 20 q | — |
| C1 | 0 | 20 q | **no C1 lessons** (GENERATED_EXTENSION needed) |
| C2 | 0 | 20 q | **no C2 lessons** (GENERATED_EXTENSION needed) |

## ELA mapping notes

- V7 lessons use **auto-generated Firestore IDs** (`.add()`); migration must assign **stable IDs** (e.g. `fr_a1_lesson_1`) to match ELA conventions and enable idempotent seeding.
- V7 `quiz.correctAnswer` maps to ELA `quizzes.questions[].correctIndex` (server-only).
- V7 lesson `content` HTML can be stored as-is in ELA `lessons.content`; the ELA renderer must support the V7 classes (`lc-h3`, `lc-table`, `lc-intro`).
- Provenance to attach on migrated docs: `sourceAcademy: 'Francophone Academy'`, `sourceVersion: 'V7'`, `sourceType: 'SOURCE_DERIVED'`.

## Not to be invented

- No external accreditation is claimed for any French content.
- Seed instructor names are placeholders → `DATA_REQUIRED`.
- C1/C2 lesson bodies do not exist in V7 → `GENERATED_EXTENSION` (draft), never labelled official.
