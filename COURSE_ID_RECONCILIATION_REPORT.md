# COURSE_ID_RECONCILIATION_REPORT

Reconciliation of existing ELA course IDs vs source-derived course IDs (dry-run, read-only).
Goal: prevent duplicate courses. **No course deleted. No production write.**

## Existing ELA course IDs (Firestore, read-only)

| Existing ID | Title | Level | Academy |
|---|---|---|---|
| `arabic-arabic-a1-foundations` | Arabic A1 — Foundations | A1 | arabic |
| `english-english-essential-foundations` | English — Essential Foundations | A1–A2 | english |
| `german-german-a1-foundations` | German A1 — Foundations | A1 | german |
| `mandarin-mandarin-hsk-1-foundations` | Mandarin HSK 1 — Foundations | HSK 1 | mandarin |
| `russian-russian-a1-foundations` | Russian A1 — Foundations | A1 | russian |

No French course exists.

## References inspected

| Reference | Where | Example |
|---|---|---|
| `quizzes.courseId` | Firestore `quizzes` | `arabic-arabic-a1-foundations` |
| `lessons.courseId` | Firestore `lessons` | `arabic-arabic-a1-foundations` |
| `progress.completedLessons[]` | Firestore `progress` | `german-german-a1-foundations-l1` |
| `getCourse(courseId)` | `functions/core.js:1067,1077` | `courses/{id}` + `lessons where courseId` |
| `getCatalog` | `functions/core.js:986` | `courses where status=='approved'` |

## Decision table

| Existing ID | Source ID (dataset) | Decision | Reason | References affected |
|---|---|---|---|---|
| `arabic-arabic-a1-foundations` | `arabic-arabic-a1-foundations` | **KEEP (same ID)** → UPDATE | identical id | none |
| `german-german-a1-foundations` | `german-german-a1-foundations` | **KEEP (same ID)** → UPDATE | identical id | none |
| `russian-russian-a1-foundations` | `russian-russian-a1-foundations` | **KEEP (same ID)** → UPDATE | identical id | none |
| `mandarin-mandarin-hsk-1-foundations` | `mandarin-mandarin-a1-foundations` | **KEEP existing canonical** | same logical course (Mandarin HSK 1 Foundations; same academy+level band); existing id is referenced by quizzes/lessons | dataset lessons/quizzes `courseId` remapped to canonical |
| `english-english-essential-foundations` | `english-english-a1-foundations` | **KEEP existing canonical** | same logical course (English A1 Foundations; same academy+level band); existing id is referenced | dataset lessons/quizzes `courseId` remapped to canonical |

## Why ZH/EN were different

The ELA seed normalizer generated a generic id `{key}-{key}-a1-foundations`, whereas the existing ELA courses use domain-specific ids (`mandarin-mandarin-hsk-1-foundations`, `english-english-essential-foundations`). They represent the **same (academy, level)** course, so the existing canonical id is preserved and the dataset is remapped (`canonicalCourseId` in `scripts/data/academies.json`).

## Result

- Courses: **CREATE 6 (French) · UPDATE 5 · CONFLICT 0 · duplicate-courses 0 · orphan-existing 0**.
- No duplicate course is created; no existing course is modified destructively (upsert-merge only).
- `progress` and `quiz.lessonId` references remain valid (they use the canonical `{courseId}-lN` scheme).

## Genuinely different courses kept separate

None at course level. Within French, two courses legitimately share the B1 band (`intermediate-grammar-b1`, `business-communication-b1`) and two share B2 (`advanced-writing-b2`, `french-culture-history-b2`); they are kept separate (distinct ids, distinct content) — documented in `FRENCH_LESSON_RECONCILIATION.md`.
