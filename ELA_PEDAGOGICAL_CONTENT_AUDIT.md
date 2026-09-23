# ELA_PEDAGOGICAL_CONTENT_AUDIT

Depth and quality audit of the ELA production curriculum. **Read-only. No production modification.** 2026-09-23.
Source of data: `scripts/data/content-audit.json` (read-only scan of production).

## 1. The central question

> "Is ELA actually ready to teach students?" — not "does ELA have database records?"

**Answer:** ELA is ready to teach **Francophone A1–B2** and the **A1 level of the other five academies** (real, teachable lesson bodies). The **generated levels** (FR C1/C2, other academies A2–C2) are **structure + language focus only** — the instructional lesson *bodies* were **not seeded**, so they are not yet teachable.

## 2. Content depth per element

| Element | FR | Other 5 | Classification |
|---|---|---|---|
| Programme | 36 DRAFT | 36 DRAFT | METADATA_ONLY |
| Level | 6 | 6 | METADATA_ONLY |
| Modules | 29 | 31 | METADATA_ONLY (title/description/outcomes) |
| Units | 36 | 90 | **REAL_CONTENT** (language-specific vocab/grammar/pronunciation/culture) |
| Lessons | 95 | 190 | **mixed** — 23 FR / 10 per academy REAL_CONTENT; remainder METADATA_ONLY |
| Objectives | generated lessons have `objective` | same | REAL_CONTENT (template) |
| Competencies | `competencyIds` on all nodes | same | REAL_CONTENT (10 domains) |
| Learning outcomes | 51 (V7) + framework | framework | REAL_CONTENT |
| Activities | generated lessons have `activities[]` | same | METADATA_ONLY (labels, no body) |
| Vocabulary | units (real) + source lessons | same | REAL_CONTENT |
| Grammar | units (real) | same | REAL_CONTENT |
| Pronunciation | units (real, language-specific) | same | REAL_CONTENT |
| Reading/Listening/Speaking/Writing | lesson-type tags only | same | METADATA_ONLY |
| Exercises | not seeded | not seeded | **MISSING** |
| Quizzes | 6 (120 q, real) | 5–13 | REAL_CONTENT |
| Assessments | level quizzes | level quizzes | REAL_CONTENT (secure) |
| Progression | `progress` (runtime) | same | REAL_CONTENT (existing) |

## 3. Content depth counts (from production)

| Academy | nodes | modules | units | lessons | source lessons w/ real body | generated (metadata-only) |
|---|---|---|---|---|---|---|
| FR | 160 | 29 | 36 | 95 | **23** | **72** |
| DE | 311 | 31 | 90 | 190 | **10** | **180** |
| ZH | 311 | 31 | 90 | 190 | **10** | **180** |
| EN | 311 | 31 | 90 | 190 | **10** | **180** |
| AR | 311 | 31 | 90 | 190 | **10** | **180** |
| RU | 311 | 31 | 90 | 190 | **10** | **180** |
| **Total** | **1 715** | 184 | 486 | 1 045 | **73** | **972** |

FR source lessons (`lessons`): 35 docs · 29 with content · 6 empty · avg content length **2 027 chars**.

> **Finding:** of 1 045 lesson nodes, **73 are backed by a real instructional body** and **972 are metadata-only** (objective + activity labels). The generated lesson bodies (explanation, examples, dialogue, guided/independent practice, mastery criteria, assessment) exist in `curriculum-content.js` but were **not included in the seeded allowlist** — a gap to fix before generated levels can be taught.

## 4. Lesson quality

| Criterion | Real lessons (73) | Generated (972) |
|---|---|---|
| Meaningful objective | ✔ | template objective only |
| Actual instructional content | ✔ (V7/seed HTML) | ✘ |
| Activity | ✔ (in body) | label only |
| Exercise | ✔ (V7 mini-exercises) | ✘ |
| Assessment | level quiz | ✘ |
| Correct module/level | ✔ (0 orphans) | ✔ (0 orphans) |
| Logical sequence | ✔ (order) | ✔ (order) |
| Duplicated | **0** | **0** |
| Placeholder only | 0 | **972** |

## 5. Quiz / assessment alignment

- French: **6 level assessments** (A1–C2, 20 questions each) — they evaluate level-appropriate grammar/vocabulary and are aligned to the level, not to individual lessons (V7 design).
- Other academies: A1 level assessments (5 × 5 q) + the pre-existing per-lesson quizzes.
- Chain `lesson → objective → competency → assessment`: level objectives map to the 10 competency domains (C-LIS…C-ICU) via `competencyIds`; level quizzes map to the level outcomes.
- **Secure assessment implementation unchanged** (server-side scoring; `correctIndex` never exposed).

## 6. Language-specific validation

Verified that generated **units** are language-specific (not translated French):

| Academy | Vocabulary | Grammar | Pronunciation | Culture |
|---|---|---|---|---|
| ZH | 你好 (nǐ hǎo) … | 了 (completed action) | **four tones + neutral tone, initials/finals** | greetings/politeness |
| AR | مرحبا (marhaban) … | verbal sentence | **emphatic consonants (ص ض ط ظ), pharyngeals (ع ح)** | hospitality |
| RU | привет (privet) … | **accusative case** | **palatalisation, akanye** | ты vs вы |
| DE | hallo … | **Perfekt** | **Umlaute, ich-Laut/ach-Laut** | Sie/du |
| EN / FR | level-appropriate | level-appropriate | level-appropriate | level-appropriate |

All 486 units carry vocabulary/grammar/pronunciation/culture (100 %). Mandarin covers characters + pinyin + tones; Arabic covers script + reading direction; Russian covers Cyrillic + cases; German covers gender/cases/word order. **No language is a mere translation of French.**

## 7. Commercial readiness

| Academy | A1 | A2–B2 | C1–C2 | Readiness |
|---|---|---|---|---|
| Francophone (FR) | REAL_CONTENT | REAL_CONTENT (A2/B1/B2) | GENERATED (structure only) | **READY_FOR_ACADEMIC_REVIEW** |
| Germanophone (DE) | REAL_CONTENT | GENERATED | GENERATED | **READY_FOR_ACADEMIC_REVIEW** (A1) / NOT_READY (A2+) |
| Sinophone (ZH) | REAL_CONTENT (HSK1) | GENERATED | GENERATED | READY_FOR_ACADEMIC_REVIEW (HSK1) / NOT_READY |
| Anglophone (EN) | REAL_CONTENT | GENERATED | GENERATED | READY_FOR_ACADEMIC_REVIEW (A1) / NOT_READY |
| Arabophone (AR) | REAL_CONTENT | GENERATED | GENERATED | READY_FOR_ACADEMIC_REVIEW (A1) / NOT_READY |
| Russophone (RU) | REAL_CONTENT | GENERATED | GENERATED | READY_FOR_ACADEMIC_REVIEW (A1) / NOT_READY |

## 8. Gaps (do not publish yet)

1. **Generated lesson bodies not seeded** (972 lessons) — the main gap.
2. **FR C1/C2** and **other academies A2–C2** have no teachable content (structure + unit focus only).
3. **Exercises** not modelled in the seeded nodes.
4. **Programmes DRAFT** (correct — not published).
5. **DATA_REQUIRED**: teachers, live-class schedules, accreditation/partners/prices.

## 9. Verdict

**READY WITH WARNINGS.** ELA can teach **French A1–B2** and the **A1 of the five other academies** from real content today. The generated levels provide a validated pedagogical *structure* (modules/units/lessons/outcomes/competencies/assessments) but their **instructional bodies must be seeded** before they are teachable. Nothing was published; no production change was made.
