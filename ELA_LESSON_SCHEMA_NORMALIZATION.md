# ELA_LESSON_SCHEMA_NORMALIZATION

Normalization of the two existing ELA lesson schemes into one canonical schema.
**No deletion. No production write.**

## 1. The two existing schemes (Firestore, read-only)

| Scheme | Pattern | Count | Fields | Referenced by |
|---|---|---|---|---|
| **A** | `{ac}_{level}_lesson_{n}` e.g. `fr_a1_lesson_1` | **72** (12 × 6 academies) | `academyCode`, `academyName`, `level`, `order`, `lessonNumber`, `isTrial`, `trialAccess`, `status`, `title`, `content`, `vocabulary`, `duration` — **no `courseId`** | `getTrialLessons` (`academyCode` + `isTrial`) |
| **B** | `{courseId}-l{n}` e.g. `arabic-arabic-a1-foundations-l1` | **32** (5 courses) | `courseId`, `level`, `order`, `title`, `content`, `status` — **no `academyCode`** | `getCourse` (`where courseId`), `quizzes.lessonId`, `progress.completedLessons` |

Total existing lessons = 104 (72 + 32).

## 2. Which records are what

| Question | Answer |
|---|---|
| Duplicates? | The two schemes overlap by **natural key** (academy+level+order): 23 pairs. Not ID duplicates. |
| Source-derived? | Both are ELA seed-derived (`SOURCE_DERIVED`); V7 supplies richer French content. |
| Existing ELA records? | Both schemes are existing production records. |
| Referenced by progress? | **Scheme B** (`german-german-a1-foundations-l1`). |
| Referenced by quizzes? | **Scheme B** (`arabic-arabic-a1-foundations-l1` …). |
| Referenced by courses/modules/programmes? | **Scheme B** (`courseId`); scheme A is referenced by no course. |

## 3. Canonical schema (decision)

**Canonical lesson ID = scheme B (`{courseId}-l{order}`)** — because it is the scheme referenced by `progress`, `quizzes`, and `getCourse`. To also satisfy `getTrialLessons`, the canonical doc must carry the scheme-A attributes:

```
{
  id: '{courseId}-l{order}',        // canonical
  courseId,                          // relation -> courses
  academyCode, academyName, academy, // for getTrialLessons + academy scoping
  level, order, lessonNumber,
  title, description, content, vocabulary, objectives, quizId,
  duration, videoUrl, videoDuration,
  isTrial, trialAccess,              // for getTrialLessons
  status, contentState, sourceType, sourceAcademy, sourceVersion
}
```

## 4. Mapping table

| Existing scheme A | Canonical scheme B | Relation | Action |
|---|---|---|---|
| `fr_a1_lesson_1..5` | `french-foundations-a1-l1..5` | alias (FR\|A1\|1..5) | create canonical (V7 content); keep legacy as alias |
| `de_a1_lesson_9,10` | `german-german-a1-foundations-l9,10` | alias | create canonical; keep legacy |
| `ar_a1_lesson_7..10` | `arabic-arabic-a1-foundations-l7..10` | alias | create canonical; keep legacy |
| `ru_a1_lesson_*` (analogous) | `russian-russian-a1-foundations-l*` | alias | create canonical; keep legacy |
| `zh_a1_lesson_7..10` | `mandarin-mandarin-hsk-1-foundations-l7..10` | alias | create canonical; keep legacy |
| `en_a1_lesson_7..10` | `english-english-essential-foundations-l7..10` | alias | create canonical; keep legacy |
| scheme A lessons with no scheme-B counterpart (49) | — | legacy | preserved, not referenced, candidate for later archival |
| scheme B (`{courseId}-l1..N`) | same id | canonical | **update** (add `academyCode`/`isTrial`/`order`, provenance) |

## 5. Result (dry-run)

| Bucket | Lessons | Meaning |
|---|---|---|
| CREATE | **41** | 18 new French A2/B1/B2 + 23 canonical lessons that also have a legacy scheme-A alias |
| UPDATE | **32** | existing scheme-B lessons enriched (academyCode/isTrial/provenance) |
| SKIP | 0 | — |
| CONFLICT | **0** | none (scheme-A overlaps resolved as aliases, not duplicates) |
| ALIAS (informational) | **23** | legacy scheme-A ids mapped to canonical ids |
| existing-not-in-dataset | **72** | scheme-A lessons preserved (23 aliased + 49 extra) — never deleted |

## 6. Guarantees

- No legacy document deleted or modified destructively; the seeder has **no delete path**.
- All existing references remain valid: `progress.completedLessons` (scheme B), `quizzes.lessonId` (scheme B), `getCourse` (courseId).
- Aliases are recorded so the legacy scheme-A ids can be resolved to canonical ids by any consumer.
- Only after all references are validated may obsolete duplicates be **considered** for archival (future mission, not now).
