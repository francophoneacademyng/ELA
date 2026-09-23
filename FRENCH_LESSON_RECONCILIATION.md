# FRENCH_LESSON_RECONCILIATION

Reconciliation of existing ELA French A1 lessons vs Francophone Academy V7 lessons.
Francophone Academy V7 is the **primary reference** for the French learning system. **No deletion. No production write.**

## Existing ELA French lessons (Firestore, read-only)

12 lessons, scheme A (`{ac}_{level}_lesson_{n}`), with `academyCode='FR'`, `status='published'`, **no `courseId`**:
`fr_a1_lesson_1 … fr_a1_lesson_12`.
Content quality is uneven: e.g. `fr_a1_lesson_1` has **empty content**; `fr_a1_lesson_10` has ~459 chars. They are **not referenced** by `progress.completedLessons` nor by `quizzes.lessonId` (which use the `{courseId}-lN` scheme).

## V7 French lessons (source-derived)

23 rich lessons (scheme B `{courseId}-l{order}`), across 6 courses:

| courseId | Level | Lessons (order → title) |
|---|---|---|
| french-foundations-a1 | A1 | 1 French Sounds and the Alphabet · 2 Greetings and Introductions · 3 Numbers 1–100 · 4 Articles · 5 Être & Avoir |
| everyday-conversations-a2 | A2 | 1 Talking About Your Day · 2 At the Restaurant · 3 Past Events (passé composé) · 4 Making Plans |
| intermediate-grammar-b1 | B1 | 1 Opinions and Connectors · 2 Object Pronouns · 3 Subjunctive · 4 Hypotheses |
| business-communication-b1 | B1 | 1 Professional Email Structure · 2 Meetings · 3 Phone Calls · 4 Presenting a Project |
| advanced-writing-b2 | B2 | 1 Essay Structure for DELF B2 · 2 Formal vs Informal Register · 3 Connectors of Argumentation |
| french-culture-history-b2 | B2 | 1 The Francophone World Today · 2 Social Etiquette (tu/vous) · 3 Key Moments of French History |

## Per-lesson classification

| V7 lesson (canonical) | Existing ELA lesson | Class | Decision |
|---|---|---|---|
| `french-foundations-a1-l1` | `fr_a1_lesson_1` | **MATCH** (FR\|A1\|1) | canonical = V7 (scheme B); existing = legacy alias; content: prefer V7 (richer) |
| `french-foundations-a1-l2` | `fr_a1_lesson_2` | **MATCH** | alias |
| `french-foundations-a1-l3` | `fr_a1_lesson_3` | **MATCH** | alias |
| `french-foundations-a1-l4` | `fr_a1_lesson_4` | **MATCH** | alias |
| `french-foundations-a1-l5` | `fr_a1_lesson_5` | **MATCH** | alias |
| `everyday-conversations-a2-l1..4` | — | **NEW** | create |
| `intermediate-grammar-b1-l1..4` | — | **NEW** | create |
| `business-communication-b1-l1..4` | — | **NEW** | create |
| `advanced-writing-b2-l1..3` | — | **NEW** | create |
| `french-culture-history-b2-l1..3` | — | **NEW** | create |
| — | `fr_a1_lesson_6..12` | **LEGACY** | no V7 counterpart → preserved (not deleted); candidate for archival later |
| (C1/C2) | — | **MISSING_MAPPING** | V7 has C1/C2 quizzes but no C1/C2 lessons → GENERATED_DRAFT later |

**Totals:** MATCH 5 · NEW 18 · LEGACY 7 · DUPLICATE 0 · CONFLICT 0 · MISSING_MAPPING (C1/C2 lessons).

## Rules applied

1. **Canonical ID** = the scheme-B id (`{courseId}-l{order}`), because it is the scheme referenced by `progress` and `quizzes` and used by `getCourse`.
2. Existing scheme-A lessons are **aliases** (`alias` bucket in the dry-run) — preserved, never deleted, mapped by natural key (academy+level+order).
3. Where V7 is richer (all 5 A1 matches), **V7 content is preferred** for the canonical doc; the existing doc is not destroyed before validation (no delete path exists).
4. Two B1 courses / two B2 courses are genuinely different and kept separate.

## Result

- French lessons: **CREATE 18 · MATCH/alias 5 · LEGACY preserved 7 · CONFLICT 0**.
- No French lesson is lost; provenance `sourceAcademy='Francophone Academy'`, `sourceVersion='V7'`, `sourceType='SOURCE_DERIVED'`.
