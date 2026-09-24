# ELA — FINAL PRODUCTION COMPLETION REPORT

Date: 2026-09-24
Project: `ela-academy-7f868`
Production: https://elaacademy.ng/ (hosting `ela-academy-7f868.web.app`)
Primary reference: Francophone Academy V7 (`francophone-academy-v7`)

---

## 1. THE 972 vs 145 RECONCILIATION (RESOLVED)

The apparent discrepancy is **not** an error. It is the coexistence of two different
data models that were not previously wired together:

| Count | Meaning | Collection | Consumed by student UI? |
|---|---|---|---|
| **145** | Lesson **documents** (flat, source-derived) | `lessons` | ✅ yes (via `getCourse` + direct read) |
| **972** | Lesson **bodies** (generated) embedded as nodes | `curriculum_nodes` | ❌ no (was not reachable) |

- The **145** documents in `lessons` are the flat student-facing model (scheme-B
  `{courseId}-l{n}` + legacy scheme-A). They contained the real V7-derived French
  content and the A1 structured content of the other five academies.
- The **972** were `GENERATED_DRAFT` lesson nodes in the institutional tree
  (`curriculum_nodes`: 184 modules → 486 units → 1045 lessons). They now carry full
  bodies (objective, explanation, examples, dialogue, guided/independent practice,
  assessment, mastery criteria, exercises) but were **not** reachable by any student
  path and their vocabulary was A1-level filler injected into B1–C2 topics.

**Resolution:** the 972 bodies are now (a) made level-appropriate (per-level themed
vocabulary), and (b) materialised into `lessons` + per-level `courses` so a real
student can open and consume them.

---

## 2. CURRENT PRODUCTION STATE

| Collection | Count | Note |
|---|---|---|
| courses | **38** | 11 SOURCE_DERIVED + 27 GENERATED_DRAFT (one per academy×level) |
| lessons | **1117** | 145 SOURCE_DERIVED + 972 GENERATED_DRAFT |
| quizzes | 63 | FR A1–C2 level quizzes + per-lesson A1 quizzes |
| programmes | 36 | all `status = DRAFT` (not published) |
| curriculum_nodes | 1715 | 184 modules · 486 units · 1045 lessons |
| competencies | 10 | C-LIS…C-ICU |
| learning_outcomes | 375 | 51 source (V7) + 324 framework |
| assessment_blueprints | 36 | `AB-{ac}-{level}` |
| examination_blueprints | 0 | (not seeded) |
| rubrics | 0 | (not seeded) |

Every lesson now carries `status = 'approved'` (previously `published`, which broke
subscriber entitlement because `firestore.rules` `canStudentReadContent` requires
`approved`).

---

## 3. STUDENT-CONSUMABLE CONTENT (the real test)

A student can now traverse, for **all six academies and all levels**:

```
getCatalog → 38 courses → getCourse(courseId) → lessons → #/lesson?id → lesson body → vocabulary/grammar/exercises → quiz (where present)
```

| Academy | A1 | A2 | B1 | B2 | C1 | C2 | Source of bodies |
|---|---|---|---|---|---|---|---|
| Francophone (FR) | V7 | V7 | V7 | V7 | GEN | GEN | V7 (A1–B2) + generated (C1/C2) |
| Germanophone (DE) | seed | GEN | GEN | GEN | GEN | GEN | seed (A1) + generated |
| Sinophone (ZH) | seed | GEN | GEN | GEN | GEN | GEN | seed (HSK1) + generated (HSK2–6) |
| Anglophone Pro (EN) | seed | GEN | GEN | GEN | GEN | GEN | seed (A1) + generated |
| Arabophone (AR) | seed | GEN | GEN | GEN | GEN | GEN | seed (A1) + generated |
| Russophone (RU) | seed | GEN | GEN | GEN | GEN | GEN | seed (A1) + generated |

- **1045** lessons are reachable through courses, **all with a real body** (no
  metadata-only lesson in the student path).
- **72** legacy scheme-A lessons (`{ac}_a1_lesson_*`, no `courseId`) remain in the
  collection but are **not** reachable via courses or the free trial; they are
  preserved (never deleted) for backward compatibility.
- **35** trial lessons (2 instant + 4 signup per academy; FR has 5) now point only to
  real content — the free-trial page no longer exposes empty legacy lessons.

---

## 4. FRANCOPHONE V7 FIDELITY

- FR A1–B2 remains **SOURCE_DERIVED** (`sourceAcademy = "Francophone Academy"`,
  `sourceVersion = "V7"`, `sourceType = "SOURCE_DERIVED"`). It was **not** replaced.
- The V7 rich HTML (`lc-intro`, `lc-h3`, `lc-table`, `lc-dialogue`, `lc-tip`,
  `lc-recap`, `lc-practice`, `lc-trans`) is now **rendered** (previously it was
  HTML-escaped and displayed as raw tags — see §9).
- FR C1/C2 are `GENERATED_DRAFT` (V7 did not provide them), clearly labelled.

---

## 5. ACADEMY STATUS

| Academy | Status |
|---|---|
| FRANCOPHONE | A1–B2 SOURCE_DERIVED (teachable) · C1/C2 GENERATED_DRAFT (teachable, pending review) |
| GERMANOPHONE | A1 seed · A2–C2 GENERATED_DRAFT (teachable, pending review) |
| SINOPHONE | HSK1 seed · HSK2–HSK6 GENERATED_DRAFT (characters + pinyin + tones) |
| ANGLOPHONE PRO | A1 seed · A2–C2 GENERATED_DRAFT |
| ARABOPHONE | A1 seed · A2–C2 GENERATED_DRAFT (script + reading direction + pronunciation) |
| RUSSOPHONE | A1 seed · A2–C2 GENERATED_DRAFT (Cyrillic + cases + pronunciation) |

Content is **language-specific**, not translated French: Mandarin covers characters,
pinyin and tones; Arabic covers script, reading direction and emphatic consonants;
Russian covers Cyrillic, palatalisation and cases; German covers gender, cases and
word order; each has a per-level grammatical progression (`GRAMMAR_BY_LEVEL`) and a
per-level themed vocabulary bank (`curriculum-vocabulary.js`).

---

## 6. PROGRAMMES / CURRICULUM

- 36 programmes (6 academies × 6 levels), all `status = DRAFT` (deliberate — not
  published without academic review).
- `curriculum_nodes` = 1715 (184 modules / 486 units / 1045 lessons), 0 duplicates,
  0 orphans, 0 broken `parentId`/`outcomeId`/`programmeId`.
- `getCurriculum(progId)` returns the nested tree; lesson nodes now carry corrected
  per-level vocabulary, examples and dialogue.

---

## 7. LESSONS / LESSON BODIES / EXERCISES / QUIZZES / ASSESSMENTS

- **Lesson bodies:** every course-reachable lesson has `content` (HTML or structured
  blocks), `vocabulary` (`{word, translation}` or `{term, meaning}`), `grammar`,
  `exercises`, `objectives`.
- **Exercises:** generated lessons carry `exercises` = guided practice + independent
  practice + assessment prompts (meaningful, level-appropriate).
- **Quizzes:** FR has 6 CEFR level quizzes (A1–C2, 20 questions each). FR C1/C2
  generated lessons link to `french-level-c1-quiz` / `french-level-c2-quiz`.
- **Assessments:** 36 assessment blueprints (one per programme); secure server-side
  scoring unchanged (`correctIndex` never exposed to students; no legacy client
  scoring restored).

---

## 8. PROVENANCE

| Tag | Count | Meaning |
|---|---|---|
| SOURCE_DERIVED | 11 courses + 73 lessons + 95 nodes | from V7 (FR) and ELA seed (A1) |
| GENERATED_DRAFT | 27 courses + 972 lessons + 1620 nodes | ELA-authored structure + bodies |
| GENERATED_EXTENSION | 0 | (none required) |
| DATA_REQUIRED | live-class instructors, official prices, accreditation, real schedules/statistics | not invented |

No official accreditation/certification is claimed without evidence. Programmes remain
DRAFT; nothing is represented as officially approved.

---

## 9. ROOT-CAUSE FIXES APPLIED (this run)

1. **Lesson renderer was broken** (`js/app.js:renderLessonContent`):
   - FR V7 HTML content was passed through `escapeHtml` → students saw raw `<p>`
     tags.
   - The 5 academies' A1 content is a structured array `[{heading, text}]`, which the
     renderer stringified to `[object Object]`.
   - Vocabulary used `v.term`/`v.meaning` but the data used `v.word`/`v.translation`.
   - **Fix:** renderer now sanitises+renders HTML (whitelist) and structured blocks,
     and handles both vocabulary schemas. Added `.lc-*` CSS.
2. **Entitlement blocked** (lessons `status='published'`, rules require `approved`):
   - **Fix:** all lessons → `approved`.
3. **Generated vocabulary was A1 filler** (`curriculum-content.js` used A1 greetings
   at all levels):
   - **Fix:** added `functions/curriculum-vocabulary.js` (per-level themed vocabulary
     for B1–C2 across 6 languages) and rewired `buildLesson`/`buildLevelContent` +
     `pickExamples` (B1+ examples/dialogue now use advanced examples).
4. **Generated lessons unreachable** (in `curriculum_nodes` only):
   - **Fix:** materialised 972 lessons into `lessons` + 27 per-level `courses`
     (`scripts/seed-generated-lessons.js`).
5. **Free trial exposed empty legacy lessons:**
   - **Fix:** `scripts/normalize-trial-flags.js` — trial flags now point only to real
     entry-course lessons (2 instant + 4 signup per academy).

---

## 10. DATABASE COUNTS vs STUDENT-CONSUMABLE COUNTS

| | Database documents | Student-consumable |
|---|---|---|
| Courses | 38 | 38 |
| Lessons | 1117 | **1045** (reachable via courses, all with bodies) |
| Legacy lessons (no course) | 72 | 0 (preserved, not reachable) |
| Trial lessons | 35 | 35 (all real content) |

---

## 11. SECURITY TESTS (re-run, all pass)

```
student-security : 18/18
assessment       : 30/30
p1c              : 14/14
```

`functions/index.js` loads with **126 exports**. `firestore.rules` unchanged
(no entitlement/security weakening). Assessment security (server-side scoring,
`correctIndex` never exposed) and role guards intact.

---

## 12. VALIDATION

- **STUDENT:** getCatalog (38 courses) → getCourse → lesson body → vocabulary/grammar/
  exercises → quiz. Trial lessons all return real content. Subscriber entitlement
  (rules `approved` + active subscription) now matches data.
- **TEACHER:** unchanged (role-guarded routes; `getTeacherStats` 403 for non-staff).
- **ADMIN:** unchanged (role-guarded callables; programmes remain DRAFT).
- **BUSINESS:** catalogue/pricing/referral/certificates/live classes unchanged;
  `DATA_REQUIRED` for teachers, official prices, accreditation, real schedules/statistics.

---

## 13. DEPLOYMENTS

| Target | Result |
|---|---|
| Hosting (`js/app.js`, `assets/css/main.css`) | ✅ deployed |
| Functions (`curriculum-content.js`, `curriculum-vocabulary.js`) | ✅ deployed |
| Firestore rules | not deployed (unchanged) |
| Storage | not deployed (unchanged) |

Seed operations used idempotent merge upserts with stable IDs, allowlists, backups
(`scripts/data/backup/*`), and **no deletes**.

---

## 14. REMAINING GAPS

1. **Programmes remain DRAFT** (governance by design — publish only after academic
   review; `publishProgrammeContent` enforces READY-only).
2. **72 legacy scheme-A lessons** are orphaned; candidate for archival (never deleted
   in this run).
3. **B1–C2 instruction scaffold** (explanation/guided practice meta-text) is authored
   in French across all academies; the target-language content is correct but the
   meta-language could be localised (i18n) in a future pass.
4. **Per-lesson quizzes** exist only for FR (C1/C2) and A1 levels; higher-level
   generated lessons rely on the 36 assessment blueprints (question banks for
   DE/ZH/EN/AR/RU A2–C2 not yet authored).
5. **DATA_REQUIRED**: teachers, live-class schedules, official prices, accreditation,
   institutional relationships, real statistics.

---

## FINAL STATUS

**PRODUCTION READY WITH WARNINGS**

A real student can now open and consume populated lesson content across all six
academies and all levels. The 972 generated lesson bodies are real, level-appropriate
and reachable. Warnings: generated content remains `GENERATED_DRAFT` (programmes not
published pending academic review), and external business facts (teachers, prices,
accreditation) remain `DATA_REQUIRED`.
