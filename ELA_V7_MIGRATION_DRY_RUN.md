# ELA_V7_MIGRATION_DRY_RUN

Francophone Academy V7 → ELA normalization / migration — **DRY RUN**.
Generated 2026-09-23. **No production write was performed.** Machine-readable plan: `scripts/data/dry-run-plan.json`.

## 1. Pipeline built

| Artifact | Role |
|---|---|
| `scripts/extract-v7.js` | Reads V7 sources (`seed-data.js`, `update-all-lessons.js`, `update-quizzes.js`) by array-literal parsing (no V7 code executed) → `scripts/data/v7-french.json` |
| `scripts/data/academies.json` | 6-academy registry + provenance + DATA_REQUIRED list |
| `scripts/build-dataset.js` | Merges V7 (FR) + `data/seed/*.json` (5 academies) → `scripts/data/ela-dataset.json` |
| `scripts/lib/normalize.js` | ID/relation normalization + provenance (`SOURCE_DERIVED`) |
| `scripts/lib/validate.js` | Schema / relations / duplicates / orphans / statuses / correctIndex |
| `scripts/lib/plan.js` | Read-only diff vs Firestore → create/update/skip/conflict/duplicate/orphan |
| `scripts/lib/firestore-rest.js` | Read-only Firestore access (CLI OAuth token) |
| `scripts/seed.js` | CLI: `--validate` / `--dry-run` / `--report` / `--seed --confirm` (guarded, refuses without a service account) |

## 2. Normalized dataset

| | Courses | Lessons | Quizzes | Questions |
|---|---|---|---|---|
| Francophone (V7, SOURCE_DERIVED) | 6 | 23 | 6 | 120 |
| 5 other academies (ELA seed, SOURCE_DERIVED) | 5 | 50 | 25 | 125 |
| **Total** | **11** | **73** | **31** | **245** |

ID conventions applied: lessons `{courseId}-l{order}`; level quizzes `{academyKey}-level-{level}-quiz`; `correctAnswer` → `correctIndex` (server-only). Provenance on every doc: `sourceAcademy='Francophone Academy'`, `sourceVersion='V7'`, `sourceType='SOURCE_DERIVED'`.

## 3. Validation result

`VALIDATE: pass=true fail=0 warnings=3`
- WARN `course.level`: `mandarin-mandarin-a1-foundations` level `A1` not in ZH levels (`HSK1..6`) — ELA seed uses `A1` internally while the ZH course uses `HSK 1`.
- WARN `quiz.course`: `french-level-c1-quiz` and `french-level-c2-quiz` have no `courseId` (V7 has C1/C2 assessments but no C1/C2 courses).

## 4. Firestore current state (read-only) — important discovery

| Collection | Count | Detail |
|---|---|---|
| `courses` | 5 | arabic, english, german, mandarin, russian — **no French course** |
| `lessons` | 104 | **two schemes**: (a) `{ac}_a1_lesson_{n}` ×12 per academy = 72 (with `academyCode`, incl. **12 French** `fr_a1_lesson_*`); (b) `{courseId}-l{n}` ×32 (with `courseId`, no `academyCode`) |
| `quizzes` | 32 | arabic 6, english 6, german 8, mandarin 6, russian 6 — **no French quiz** |

Notable: **French already has 12 lessons in production** (`fr_a1_lesson_1..12`, some empty content, e.g. `fr_a1_lesson_1` contentLen=0) but **no French course and no French quiz**. The 32 `{courseId}-l{n}` lessons have no `academyCode`.

## 5. Plan (dry-run)

| Collection | desired | CREATE | UPDATE | SKIP | CONFLICT | existing-not-in-dataset |
|---|---|---|---|---|---|---|
| courses | 11 | 8 | 3 | 0 | 0 | 2 |
| lessons | 73 | 18 | 20 | 0 | 35 | 84 |
| quizzes | 31 | 31 | 0 | 0 | 0 | 32 |

### Courses
- **CREATE (8):** 6 French courses + `mandarin-mandarin-a1-foundations` + `english-english-a1-foundations`.
- **UPDATE (3):** `german-german-a1-foundations`, `arabic-arabic-a1-foundations`, `russian-russian-a1-foundations`.
- **existing-not-in-dataset (2):** `english-english-essential-foundations`, `mandarin-mandarin-hsk-1-foundations` → the ZH/EN dataset IDs do **not** match the existing IDs → would create **duplicate courses** for ZH/EN.

### Lessons
- **CREATE (18)** / **UPDATE (20)** / **CONFLICT (35)**.
- **Conflicts = natural-key duplicates** (same `academy|level|order`, different id):
  - FR `french-foundations-a1-l1..5` ↔ existing `fr_a1_lesson_1..5`.
  - DE `…-l9,l10` ↔ `de_a1_lesson_9,10`; AR `…-l7..10` ↔ `ar_a1_lesson_7..10`; RU similar.
  - ZH/EN all `…-l1..10` ↔ `zh_a1_lesson_*` / `en_a1_lesson_*` (course id mismatch).
- **existing-not-in-dataset (84):** the 72 `{ac}_a1_lesson_*` plus 12 more → **never deleted** (informational).

### Quizzes
- **CREATE (31)** — 6 French level quizzes (120 q) + 25 academy quizzes. **existing-not-in-dataset (32)** → never deleted.

## 6. Duplicates detected

- **Natural-key duplicate courses:** none inside the dataset, but **ZH/EN id mismatch** vs existing (see §5).
- **Natural-key duplicate lessons (dataset):** FR B1 ×2 (`intermediate-grammar-b1`, `business-communication-b1`) and FR B2 ×2 (`advanced-writing-b2`, `french-culture-history-b2`) share `(FR, B1/B2, order)` — expected because two courses share a level; resolved by course-scoped IDs.
- **Natural-key duplicate quizzes (dataset):** 5 per non-FR academy share `(AC, A1)` (e.g. `DE-A1-Q01..Q05`) — level assessments vs lesson quizzes; needs a decision.
- **Orphan existing records (never modified):** 2 courses, 84 lessons, 32 quizzes not present in the dataset.

## 7. Manual review required

1. `french-level-c1-quiz`, `french-level-c2-quiz` — no course (V7 has no C1/C2 courses). Create C1/C2 courses, or keep level-only.
2. V7 live classes (4) — placeholder instructors (`Marie Dubois`, `Jean-Pierre Laurent`, …) → `DATA_REQUIRED`, **not seeded**.
3. **ZH/EN course-ID reconciliation** — align dataset IDs to `mandarin-mandarin-hsk-1-foundations` / `english-english-essential-foundations` (avoid duplicates).
4. **French lessons reconciliation** — decide whether V7 A1 lessons replace or coexist with existing `fr_a1_lesson_*`.
5. **Two-scheme lesson cleanup** — `{ac}_a1_lesson_*` vs `{courseId}-l{n}` (32 lessons have no `academyCode`).

## 8. Provenance preserved

Every migrated doc carries `sourceAcademy`, `sourceVersion: 'V7'`, `sourceType: 'SOURCE_DERIVED'`, `contentState: 'SOURCE_DERIVED'`. Migrated V7 content is **not** labelled officially certified. Generated content will be `GENERATED_DRAFT`. Missing official data is `DATA_REQUIRED` / `MISSING_OFFICIAL_DATA`.

## 9. What will / will NOT be written (when approved)

**Will write (on approval, via Admin SDK, idempotent merge):** French courses (6), French lessons (new IDs), French quizzes (6 / 120 q), institutional programmes/curriculum (GENERATED_DRAFT), academy config docs.

**Will NOT write:** any deletion; the existing 72 `{ac}_a1_lesson_*`; the 32 `{courseId}-l` lessons; existing courses/quizzes; users/roles/subscriptions/payments; live classes (DATA_REQUIRED).

## 10. Safety

- `--seed` refuses without `--confirm` **and** `GOOGLE_APPLICATION_CREDENTIALS`; this build performs **dry-run only**.
- No delete path exists in the seeder; upsert-by-stable-id with `merge`.
- Allowlist of collections (courses, lessons, quizzes, programmes, curriculum_nodes, competencies, learning_outcomes, …); critical collections (users, subscriptions, payments, attempts, results, certificates) are **out of scope**.
- Pre-write backup required (see `docs/ELA_PRODUCTION_DATA_BACKUP.md` plan).

## 11. Verdict

The migration layer, dataset, validators and planner are built and the dry-run is complete. **No production write.** Conflicts (ZH/EN course IDs, French lesson reconciliation, level-only quizzes) must be resolved before an approved seed.
