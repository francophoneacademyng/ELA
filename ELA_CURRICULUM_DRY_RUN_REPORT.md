# ELA_CURRICULUM_DRY_RUN_REPORT

Building the actual ELA pedagogical curriculum from Francophone Academy V7. Generated 2026-09-23.
**DRY RUN ONLY — no production write.** Machine plan: `scripts/data/curriculum-dry-run.json`.

## 1. What V7 actually provides (source of truth)

| V7 source | Nature | Class |
|---|---|---|
| 6 courses (A1–B2) → 23 rich lessons | real lesson content (DB) | **SOURCE_DERIVED** (already seeded as `courses`/`lessons`) |
| 12-week A1 programme outline (`teacher-programs.page.js`) | real structure, **hardcoded** (not DB) | **SOURCE_DERIVED** (extracted) |
| 6 CEFR level quizzes (A1–C2, 120 questions) | real assessments (DB) | **SOURCE_DERIVED** (already seeded) |
| Business French | V7 course `business-communication-b1` | **SOURCE_DERIVED** |
| DELF preparation | V7 course `advanced-writing-b2` ("Essay Structure for DELF B2") + level quizzes; **no separate DELF programme** | **SOURCE_DERIVED** (as content, not a distinct programme) |
| Modules / units / competencies / outcomes | **absent** in V7 | — |

> V7 has **no** DB-backed programme/module/unit/competency/outcome model; the audit flags its "12-week paths" as hardcoded. ELA's institutional tree therefore uses the V7 course→lesson content as SOURCE_DERIVED and generates the remaining levels as GENERATED_DRAFT.

## 2. Phase 1 — V7 → ELA mapping

```
V7 course        → ELA module node (courseRef = course id)
V7 lesson        → ELA lesson node (lessonRef = lesson id)
V7 learningOutcomes[] → ELA learning_outcomes (SOURCE_DERIVED)
V7 A1 12 weeks   → ELA module nodes prog_FR_A1-M01..M12 (objectives → outcomes)
V7 level quiz    → ELA assessment (existing `quizzes`, level-only for C1/C2)
ELA competencies → C-LIS…C-ICU (10) — SOURCE_DERIVED (ELA framework)
level w/o content→ GENERATED_DRAFT tree (curriculum-content.buildLevelContent)
```
No existing ELA record is duplicated, deleted or overwritten.

## 3. Phase 2 — curriculum node counts

| Bucket | Count |
|---|---|
| SOURCE NODES (from V7/seed courses+lessons) | **95** |
| NORMALIZED NODES (total tree) | **1 715** |
| — modules | 184 |
| — units | 486 |
| — lessons | 1 045 |
| GENERATED_DRAFT nodes | **1 620** |
| DUPLICATES | **0** |
| MISSING NODES (orphan lessons/parents) | **0** |
| CONFLICTS | **0** |

> The earlier "~2160" was the full-generated figure for all 36 programmes (27 × 60). The actual requirement is **1 715**, because 9 programmes (FR A1–B2, 5 academies A1) use real source content instead of generated nodes.

## 4. Phase 3 — French first

| Programme | Level | Modules | Lessons | Nodes | Source | Quiz |
|---|---|---|---|---|---|---|
| prog_FR_A1 | A1 | 12 (V7 weeks) | 5 (V7) | 17 | **SOURCE_DERIVED** | 1 (20 q) |
| prog_FR_A2 | A2 | 1 | 4 | 5 | **SOURCE_DERIVED** | 1 (20 q) |
| prog_FR_B1 | B1 | 2 | 8 | 10 | **SOURCE_DERIVED** | 1 (20 q) |
| prog_FR_B2 | B2 | 2 | 6 | 8 | **SOURCE_DERIVED** | 1 (20 q) |
| prog_FR_C1 | C1 | 6 | 36 | 60 | GENERATED_DRAFT | 1 (20 q) |
| prog_FR_C2 | C2 | 6 | 36 | 60 | GENERATED_DRAFT | 1 (20 q) |

- **Business French** is represented as the module `business-communication-b1` under `prog_FR_B1` (real V7 course). No separate "Business French programme" was invented.
- **DELF preparation** is represented by the V7 course `advanced-writing-b2` + the CEFR quizzes; **no separate DELF programme** was created (not present in V7).

## 5. Phase 4 — other five academies (generalized template)

| Academy | A1 | A2–C2 |
|---|---|---|
| DE / EN / AR / RU | 1 module + 10 lessons (**SOURCE_DERIVED**, ELA seed) + 5 quizzes | 5 programmes × (6 modules + 18 units + 36 lessons) **GENERATED_DRAFT** |
| ZH | HSK1: 1 module + 10 lessons (**SOURCE_DERIVED**) | HSK2–HSK6 generated |

Structure inherited from the French/V7 template; content is language-specific (each academy's own vocabulary/grammar/pronunciation from `curriculum-content.js`). **Not** a translation of French lessons.

## 6. Per-programme summary (all 36)

| Academy | Levels | SOURCE_DERIVED programmes | GENERATED_DRAFT programmes | Nodes/academy |
|---|---|---|---|---|
| FR | A1,A2,B1,B2,C1,C2 | 4 | 2 | 160 (40 src / 120 gen) |
| DE | A1–C2 | 1 | 5 | 311 (11 / 300) |
| ZH | HSK1–6 | 1 | 5 | 311 (11 / 300) |
| EN | A1–C2 | 1 | 5 | 311 (11 / 300) |
| AR | A1–C2 | 1 | 5 | 311 (11 / 300) |
| RU | A1–C2 | 1 | 5 | 311 (11 / 300) |
| **Total** | | **9** | **27** | **1 715** |

## 7. Competencies / outcomes / assessments

| Element | Count | Source |
|---|---|---|
| Competencies | 10 (C-LIS, C-REA, C-WRI, C-SPE, C-GRA, C-VOC, C-PRO, C-INT, C-MED, C-ICU) | SOURCE_DERIVED (ELA framework) |
| Learning outcomes (source) | 51 (V7 course outcomes + A1 weekly objectives) | SOURCE_DERIVED |
| Learning outcomes (framework) | 324 (`{AC}-{level}-LO-0n`) | SOURCE_DERIVED (ELA) |
| Learning outcomes (total) | **375** | |
| Assessment blueprints | 36 (`AB-{AC}-{level}`) | SOURCE_DERIVED (ELA) |
| Level quizzes (existing) | 6 French CEFR + 25 academy A1 | SOURCE_DERIVED |

## 8. Source status

| Status | Count |
|---|---|
| **SOURCE_DERIVED** (V7 + ELA project) | 95 nodes · 51 outcomes · 10 competencies · 36 blueprints |
| **GENERATED_DRAFT** | 1 620 nodes |
| **DATA_REQUIRED** | real teachers/instructors · live-class schedules · accreditation/partners/prices (unchanged) |
| DUPLICATES | 0 |
| CONFLICTS | 0 |
| ORPHANS | 0 |

## 9. Dry-run plan (vs current Firestore — all target collections empty)

| Collection | CREATE | UPDATE | SKIP | CONFLICT | orphan-existing |
|---|---|---|---|---|---|
| `curriculum_nodes` | 1 715 | 0 | 0 | 0 | 0 |
| `learning_outcomes` | 375 | 0 | 0 | 0 | 0 |
| `competencies` | 10 | 0 | 0 | 0 | 0 |
| `assessment_blueprints` | 36 | 0 | 0 | 0 | 0 |

Relation validation: **0 FAIL, 0 WARN** (every node's `programmeId` exists; every lesson `parentId` resolves; every `outcomeId` resolves).

## 10. Programme status

All 36 programmes remain **`status='DRAFT'`** (not published) and all generated nodes/outcomes are `GENERATED_DRAFT` / `DRAFT`. They are **ready for academic review**; publishing remains a separate governance step.

## 11. Not included / not invented

- No C1/C2 French **lesson content** beyond generated drafts (V7 has none).
- No A2+ **source** content for the other five academies (generated drafts only).
- No teachers, partners, accreditations, official prices, statistics.
- No separate DELF/Business "programme" invented.

## FINAL STATUS

**READY WITH WARNINGS** — the full curriculum tree (1 715 nodes) + outcomes/competencies/blueprints is built and the dry-run is **clean (0 conflicts, 0 orphans, 0 validation failures)**. All generated items are clearly `GENERATED_DRAFT`; programmes stay `DRAFT` pending academic review.

**STOPPING before the production curriculum write**, as instructed. Next step (on your authorization): backup → controlled seed of `curriculum_nodes`/`learning_outcomes`/`competencies`/`assessment_blueprints` via the existing idempotent mechanism.
