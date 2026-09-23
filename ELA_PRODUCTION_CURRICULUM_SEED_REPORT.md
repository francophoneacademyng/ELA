# ELA_PRODUCTION_CURRICULUM_SEED_REPORT

Controlled production seed of the ELA pedagogical infrastructure (`ela-academy-7f868`), 2026-09-23.
Credential: local service account (`service-account.json.json`, gitignored — never committed/printed). Method: Admin SDK, allowlist, idempotent merge, **no delete**.

## BACKUP

| Item | Value |
|---|---|
| Timestamp | `2026-09-23T10-07-31-817Z` |
| Location | `scripts/data/backup/2026-09-23T10-07-31-817Z/` (local, not committed) |
| courses | 11 |
| lessons | 145 |
| quizzes | 63 |
| programmes | 36 |
| curriculum_nodes | 0 |
| learning_outcomes | 0 |
| competencies | 0 |
| assessment_blueprints | 0 |
| examination_blueprints | 0 |
| rubrics | 0 |

## SEED

| | Created | Updated | Skipped | Conflicts |
|---|---|---|---|---|
| curriculum_nodes | 1 715 | 0 (then 1 715 idempotent corrections) | 0 | 0 |
| learning_outcomes | 375 | 0 (then 375) | 0 | 0 |
| competencies | 10 | 0 (then 10) | 0 | 0 |
| assessment_blueprints | 36 | 0 (then 36) | 0 | 0 |
| **TOTAL** | **2 136** | idempotent re-runs | **0** | **0** |

Two controlled corrections were applied via idempotent merge (no delete): (1) module nodes `parentId=null` so `getCurriculum` builds the tree from `root`; (2) added the `id` field to node docs so children resolve. Both re-verified.

## CURRICULUM

| Collection | Count | Composition |
|---|---|---|
| `curriculum_nodes` | **1 715** | 184 modules · 486 units · 1 045 lessons |
| `learning_outcomes` | **375** | 51 source (V7) + 324 framework (ELA) |
| `competencies` | **10** | C-LIS, C-REA, C-WRI, C-SPE, C-GRA, C-VOC, C-PRO, C-INT, C-MED, C-ICU |
| `assessment_blueprints` | **36** | `AB-{AC}-{level}` |

Per academy (nodes): FR 160 · DE 311 · ZH 311 · EN 311 · AR 311 · RU 311.

## PROVENANCE

| Status | Nodes | Detail |
|---|---|---|
| **SOURCE_DERIVED** | **95** | FR A1–B2 (V7 courses/lessons + 12-week A1 plan) and the 5 academies' A1 (ELA seed) |
| **GENERATED_DRAFT** | **1 620** | FR C1/C2 + A2–C2 of the other five academies (from `curriculum-content.js`) |

Every node carries `sourceType`, `sourceAcademy`, `sourceVersion`. V7 content preserves `sourceAcademy='Francophone Academy'`, `sourceVersion='V7'`, `sourceType='SOURCE_DERIVED'`. No SOURCE_DERIVED content was replaced by GENERATED_DRAFT.

## VALIDATION

| Check | Result |
|---|---|
| Duplicates (by id) | **0** |
| Orphan records | **0** |
| Broken `programmeId` | **0** |
| Broken `parentId` | **0** |
| Broken `outcomeId` | **0** |
| Missing `type` | **0** |
| Invalid academy | **0** |
| Academy/language consistency | OK (FR/DE/ZH/EN/AR/RU) |
| `getCurriculum(prog_FR_A1)` | 200 — 12 modules, nested lessons |
| `getCurriculum(prog_DE_B1)` | 200 — 6 modules, nested units |
| `getProgrammeDefinition(prog_FR_A1)` | 200 — 45 outcomes |
| `getProgrammeCatalog` | 200 — `[]` (**expected**: programmes are DRAFT) |

## SECURITY

```
student-security : 18/18
assessment       : 30/30
p1c              : 14/14
```
`functions/index.js` unchanged · 126 exports · no Functions/Hosting/Rules/Storage deploy.

## PROGRAMME STATUS

**All 36 programmes remain `status = 'DRAFT'`** (verified: `{"DRAFT":36}`). Not published. Generated content remains `GENERATED_DRAFT` / `DRAFT`. Nothing is represented as official/certified/accredited/institutionally approved.

## NOT MODIFIED

users · students · teachers · roles · payments · subscriptions · financial records · liveClasses · real user progress. No delete/wipe/drop/bulk overwrite.

## FINAL STATUS

**READY WITH DRAFT CONTENT**

The ELA pedagogical infrastructure is populated and validated: 1 715 curriculum nodes (modules → units → lessons), 375 learning outcomes, 10 competencies and 36 assessment blueprints, with 0 duplicates/orphans/broken references. All programmes remain DRAFT pending academic review; no publish, no deployment.
