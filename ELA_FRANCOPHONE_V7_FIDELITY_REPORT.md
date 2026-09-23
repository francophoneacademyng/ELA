# ELA_FRANCOPHONE_V7_FIDELITY_REPORT

Fidelity audit of the ELA French curriculum against Francophone Academy V7 (`francophone-academy-v7`).
**Read-only. No production modification.** Date 2026-09-23.

## 1. Method

Compared the V7 source (courses, lessons, 12-week A1 plan, quizzes) against the ELA production data (`courses`, `lessons`, `quizzes`, `curriculum_nodes` for FR). Classified each element.

## 2. V7 content counts vs ELA

| V7 source element | V7 count | ELA production | Match status |
|---|---|---|---|
| Courses (A1–B2) | 6 | 6 FR courses (same ids) | **EXACT_MATCH** |
| Lessons (rich bodies) | 23 | 23 (via `lessons`, `lessonRef`) | **MATCH_WITH_NORMALIZATION** (id scheme `{courseId}-lN`) |
| A1 12-week programme outline | 12 weeks | 12 module nodes `prog_FR_A1-M01..M12` | **MATCH_WITH_NORMALIZATION** |
| CEFR quizzes (A1–C2) | 6 (120 q) | 6 (`french-level-{level}-quiz`, 120 q) | **MATCH_WITH_NORMALIZATION** (id renamed) |
| Learning outcomes (course) | ~28 | 28 outcome nodes (SOURCE_DERIVED) | **MATCH_WITH_NORMALIZATION** |
| Business French | course `business-communication-b1` | module under `prog_FR_B1` | **MATCH_WITH_NORMALIZATION** |
| DELF preparation | course `advanced-writing-b2` + quizzes (no separate programme) | module + level quizzes (no separate programme) | **MATCH_WITH_NORMALIZATION** |
| Live classes (seed) | 4 | **not seeded** | **NOT_APPLICABLE** (placeholder instructors → DATA_REQUIRED) |
| Modules / units / competencies / outcomes (structured) | **absent in V7** | generated (ELA) | **GENERATED_EXTENSION** |

## 3. ELA French production counts

| Element | Count |
|---|---|
| FR courses | 6 |
| FR lessons (`lessons` collection) | 35 (23 V7 + 12 legacy scheme-A) |
| FR curriculum_nodes | 160 (40 SOURCE_DERIVED + 120 GENERATED_DRAFT) |
| — modules | 29 (12 A1 weekly + 1 A2 + 2 B1 + 2 B2 + 12 generated C1/C2) |
| — units | 36 (generated C1/C2 only) |
| — lessons | 95 (23 source + 72 generated) |
| FR quizzes | 6 (120 questions) |
| FR learning outcomes | 51 (V7-derived) + framework |

## 4. Per-level fidelity

| Level | V7 source | ELA production | Match status |
|---|---|---|---|
| A1 | 12-week plan + 5-lesson course + quiz | 12 modules (SOURCE_DERIVED) + 5 lessons (real body) + quiz | **MATCH_WITH_NORMALIZATION** |
| A2 | 1 course (4 lessons) + quiz | 1 module + 4 lessons (real body) + quiz | **MATCH_WITH_NORMALIZATION** |
| B1 | 2 courses (8 lessons) + quiz | 2 modules + 8 lessons (real body) + quiz | **MATCH_WITH_NORMALIZATION** |
| B2 | 2 courses (6 lessons) + quiz | 2 modules + 6 lessons (real body) + quiz | **MATCH_WITH_NORMALIZATION** |
| C1 | quiz only | 6 modules + 36 **generated** lessons + quiz | **GENERATED_EXTENSION** (V7 has no C1 lessons) |
| C2 | quiz only | 6 modules + 36 **generated** lessons + quiz | **GENERATED_EXTENSION** (V7 has no C2 lessons) |

## 5. Missing V7 content

| Item | Status |
|---|---|
| C1/C2 lesson bodies | **MISSING** in V7 (quizzes only) → generated extension |
| V7 structured modules/units/competencies | **MISSING** in V7 (not DB-backed) |
| Legacy French scheme-A lessons `fr_a1_lesson_1..12` | 6 have **empty content**; superseded by V7 lessons (kept, not deleted) |

## 6. Generated extensions

- FR C1 + C2: 120 generated nodes (12 modules + 36 units + 72 lessons), `GENERATED_DRAFT`.
- No V7 content was replaced by generated content. All 23 V7 lessons and 6 V7 quizzes remain SOURCE_DERIVED.

## 7. Duplicates / conflicts

- **Duplicates (by id): 0.**
- Legacy French scheme-A lessons (12) coexist with the canonical scheme-B lessons — documented aliases, not duplicates.
- **No V7 content was silently corrected or overwritten.**

## 8. Verdict

**V7 fidelity: HIGH.** 100 % of V7's real French content (6 courses, 23 lessons, 12-week A1 plan, 6 quizzes) is represented as SOURCE_DERIVED in ELA. The only non-V7 French content is the C1/C2 extension, clearly marked `GENERATED_DRAFT`.
