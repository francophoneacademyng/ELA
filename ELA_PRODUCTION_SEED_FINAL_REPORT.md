# ELA_PRODUCTION_SEED_FINAL_REPORT

Controlled production seed of ELA (`ela-academy-7f868`), executed 2026-09-23 under the approved category rules.
Credential: local service account (`service-account.json.json`, gitignored — never committed/printed). Method: Admin SDK, allowlist, idempotent merge, **no delete**.

## 1. Pre-write checks (mandatory)

| Check | Result |
|---|---|
| Backup performed | ✅ (see §2) |
| Dry-run re-run | ✅ |
| conflicts | **0** |
| pendingMapping | **0** |
| Validation | pass, fail=0, warnings=2 (intentional C1/C2 level-only) |

## 2. Backup

- **Timestamp:** `2026-09-23T09-25-12Z`
- **Location:** `scripts/data/backup/2026-09-23T09-25-12-806Z/` (local, not committed)
- **Counts at backup:** courses 5 · lessons 104 · quizzes 32 · programmes 0 · programme_versions 0 · curriculum_nodes 0 · competencies 0 · learning_outcomes 0 · assessment_blueprints 0 · examination_blueprints 0 · rubrics 0

## 3. Collections affected

`courses`, `lessons`, `quizzes` (SOURCE_DERIVED) · `programmes` (GENERATED_DRAFT). Nothing else written. **No delete.**

## 4. Documents created / updated / skipped

| Collection | Created | Updated | Skipped |
|---|---|---|---|
| courses | 6 | 5 | 0 |
| lessons | 41 | 32 | 0 |
| quizzes | 31 | 0 | 0 |
| programmes | 36 | 0 | 0 |
| **TOTAL** | **114** | **37** | **0** |

Idempotency re-check after seed: `create=0, conflict=0` for all collections (a second run only updates).

## 5. Category counts (as approved)

| Category | Count | Status |
|---|---|---|
| SOURCE_DERIVED | **115** (11 courses + 73 lessons + 31 quizzes / 245 questions) | **SEEDED** |
| GENERATED_DRAFT | **36** (institutional programme metadata) | **SEEDED** (DRAFT) |
| DATA_REQUIRED | **4** (V7 seed live classes: placeholder instructors) | **NOT SEEDED** |
| TEST_DATA | **4** (the same live classes) | **NOT SEEDED** |
| CONFLICT | **0** | — |
| PENDING_MAPPING | **0** | — |

## 6. Conflicts / orphans / duplicates

- **Conflicts:** 0
- **Orphan records:** 0 (every lesson `courseId` exists; every quiz `courseId`/`lessonId` exists)
- **Duplicate documents (by id):** 0
- **Natural-key overlaps (informational):** 7 quiz `(academy,level)` groups — the pre-existing per-lesson quizzes coexist with the new level assessments (non-blocking; no delete performed)
- **Progress references:** all valid (`progress.completedLessons` → existing lessons; 0 broken)
- **Lessons without `academyCode`:** 0 (the seed added `academyCode` to the canonical scheme-B lessons)

## 7. Validation results

- Dataset validation: **pass, fail=0, warnings=2** (the two intentional C1/C2 level-only quizzes).
- Relations: lesson→course ✅ · quiz→course ✅ · quiz→lesson ✅ · quiz→level ✅ · lesson→level (band-aware) ✅ · academy/language ✅ · progress ✅.
- programme→level: ✅ (36 programmes, levels valid). programme→module→lesson: **not seeded** (see §10).

## 8. Security tests

```
student-security : 18/18
assessment       : 30/30
p1c              : 14/14
```
`functions/index.js` loads · **126 exports** intact · `functions/` unchanged · `firestore.rules` unchanged · no UI change.

## 9. Callable tests (production)

| Callable | Result |
|---|---|
| `getPublicQuiz` (no auth) | 401 UNAUTHENTICATED (secure) |
| `getCatalog` | 200 — **11 courses, 6 academies (French included)** |
| `getCourse('french-foundations-a1')` | 200 — title "French Foundations A1", 5 lessons |
| `getTrialLessons` | 200 — FR trials returned |
| `getQuizCatalog` | 200 — 6 French CEFR quizzes (A1–C2) |
| `getProgrammeDefinition('prog_FR_A1')` | 200 — programme returned (GENERATED_DRAFT) |
| `getProgrammeCatalog` | 200 — `[]` (programmes are `DRAFT`; the callable filters `status=='published'`) |
| `getCurriculum('prog_FR_A1')` | 200 — `modules: []` (curriculum_nodes not seeded — see §10) |
| `getTeacherStats` | 403 teacher-or-admin-only (role guard enforced) |

## 10. GENERATED_DRAFT items that entered production (exact list — 36)

All are programme **metadata** documents, `status='DRAFT'`, `sourceType='GENERATED_DRAFT'`, `contentState='DRAFT'`, `sourceAcademy='ELA'`, `sourceVersion='ELA-generated'`. **Not** represented as official/certified/accredited/institutionally approved.

| Academy | Programme | Level | Document ID |
|---|---|---|---|
| FR | French A1 Programme | A1 | `prog_FR_A1` |
| FR | French A2 Programme | A2 | `prog_FR_A2` |
| FR | French B1 Programme | B1 | `prog_FR_B1` |
| FR | French B2 Programme | B2 | `prog_FR_B2` |
| FR | French C1 Programme | C1 | `prog_FR_C1` |
| FR | French C2 Programme | C2 | `prog_FR_C2` |
| DE | German A1–C2 Programmes | A1,A2,B1,B2,C1,C2 | `prog_DE_A1` … `prog_DE_C2` |
| ZH | Mandarin Chinese HSK1–HSK6 Programmes | HSK1…HSK6 | `prog_ZH_HSK1` … `prog_ZH_HSK6` |
| EN | English A1–C2 Programmes | A1…C2 | `prog_EN_A1` … `prog_EN_C2` |
| AR | Arabic A1–C2 Programmes | A1…C2 | `prog_AR_A1` … `prog_AR_C2` |
| RU | Russian A1–C2 Programmes | A1…C2 | `prog_RU_A1` … `prog_RU_C2` |

**Purpose:** supply the institutional programme catalogue that production lacked. **Generation reason:** `functions/academic-framework.js` (`buildProgrammeDefinition`) — ELA-owned structure, no external/regulatory claim.

## 11. Student / Teacher / Admin validation

- **Student:** `getCatalog` (11 courses), `getCourse` (French lessons), `getTrialLessons`, `getQuizCatalog` all serve the newly seeded content; protected pages unchanged; auth guards intact.
- **Teacher:** `getTeacherStats` → 403 for non-staff (role guard enforced); teacher routes/modules unchanged.
- **Admin:** admin callables remain role-guarded; no admin data modified.

## 12. Explicitly NOT seeded (per authorization)

- **DATA_REQUIRED (4):** V7 seed live classes with placeholder instructors (A1 Conversation Practice, Business French Email Writing Workshop, B2 Grammar Deep Dive, DELF B2 Speaking Preparation).
- **TEST_DATA (4):** the same live classes.
- **Real users / teachers / roles / payments / subscriptions / financial records / partners / accreditations / statistics:** untouched.
- **C1/C2 quizzes:** kept exactly as validated (level-only, `courseId=null`) — no course invented, not deleted.

## 13. Known limitations (beyond the authorized 36 items — require separate authorization)

1. **`curriculum_nodes` not seeded** (≈2160 generated module/unit/lesson nodes) → `getCurriculum` returns empty. Seeding them exceeds the "ONLY the 36 items" rule.
2. **`programme_versions` / `competencies` / `learning_outcomes` / blueprints not seeded** (reference collections) → `getProgrammeDefinition` returns programme metadata with empty outcomes/blueprints.
3. **Programmes are `DRAFT`** (not published) → `getProgrammeCatalog` returns `[]` until an academic review publishes them (governance by design; not a defect).

## FINAL STATUS

**READY WITH WARNINGS**

The authorized SOURCE_DERIVED content (115 docs) and the 36 authorized GENERATED_DRAFT programmes are live in production, with 0 conflicts, 0 orphans, 0 duplicate documents, all security tests passing, and no destructive operation. The warnings are: (a) the 2 intentional level-only C1/C2 quizzes; (b) the institutional curriculum content (`curriculum_nodes`) and programme publishing remain pending a separate authorization.
