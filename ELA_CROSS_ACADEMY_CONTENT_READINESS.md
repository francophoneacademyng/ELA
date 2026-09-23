# ELA_CROSS_ACADEMY_CONTENT_READINESS

Content-readiness matrix for the six ELA academies. **Read-only. No production modification.** 2026-09-23.

## Legend

`SOURCE_DERIVED` (real V7/ELA-seed content) · `GENERATED_DRAFT` (ELA-generated) · `REAL_CONTENT` · `METADATA_ONLY` · `MISSING` · `DATA_REQUIRED`.

## 1. Per-academy matrix

| Academy | Programmes | Levels | Modules | Units | Lessons | Objectives | Competencies | Outcomes | Activities | Quizzes | Assessments | Content status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **FR** Francophone | 6 (DRAFT) | A1–C2 | 29 | 36 | 95 | ✔ | ✔ | ✔ | METADATA_ONLY | 6 (120 q) | 6 | A1–B2 REAL_CONTENT · C1/C2 GENERATED |
| **DE** Germanophone | 6 (DRAFT) | A1–C2 | 31 | 90 | 190 | ✔ | ✔ | ✔ | METADATA_ONLY | 13 | 13 | A1 REAL_CONTENT · A2–C2 GENERATED |
| **ZH** Sinophone | 6 (DRAFT) | HSK1–6 | 31 | 90 | 190 | ✔ | ✔ | ✔ | METADATA_ONLY | 11 | 11 | HSK1 REAL_CONTENT · HSK2–6 GENERATED |
| **EN** Anglophone Pro | 6 (DRAFT) | A1–C2 | 31 | 90 | 190 | ✔ | ✔ | ✔ | METADATA_ONLY | 11 | 11 | A1 REAL_CONTENT · A2–C2 GENERATED |
| **AR** Arabophone | 6 (DRAFT) | A1–C2 | 31 | 90 | 190 | ✔ | ✔ | ✔ | METADATA_ONLY | 11 | 11 | A1 REAL_CONTENT · A2–C2 GENERATED |
| **RU** Russophone | 6 (DRAFT) | A1–C2 | 31 | 90 | 190 | ✔ | ✔ | ✔ | METADATA_ONLY | 11 | 11 | A1 REAL_CONTENT · A2–C2 GENERATED |

## 2. Per-element classification

| Element | FR | DE | ZH | EN | AR | RU |
|---|---|---|---|---|---|---|
| Programme metadata | GENERATED_DRAFT (DRAFT) | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT |
| A1 content | **SOURCE_DERIVED / REAL_CONTENT** | SOURCE_DERIVED / REAL_CONTENT | SOURCE_DERIVED / REAL_CONTENT | SOURCE_DERIVED / REAL_CONTENT | SOURCE_DERIVED / REAL_CONTENT | SOURCE_DERIVED / REAL_CONTENT |
| A2+ content | FR A2/B1/B2 **SOURCE_DERIVED**; C1/C2 GENERATED | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT |
| Modules | SOURCE_DERIVED (A1–B2) / GENERATED (C1/C2) | 1 source / 30 generated | 1 / 30 | 1 / 30 | 1 / 30 | 1 / 30 |
| Units | GENERATED_DRAFT (language-specific focus) | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT | GENERATED_DRAFT |
| Lesson bodies | 23 REAL / 72 METADATA_ONLY | 10 / 180 | 10 / 180 | 10 / 180 | 10 / 180 | 10 / 180 |
| Objectives | REAL_CONTENT | REAL_CONTENT | REAL_CONTENT | REAL_CONTENT | REAL_CONTENT | REAL_CONTENT |
| Competencies | REAL_CONTENT (10 domains) | same | same | same | same | same |
| Outcomes | SOURCE_DERIVED (51) + framework (324) | framework | framework | framework | framework | framework |
| Exercises | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| Quizzes/assessments | SOURCE_DERIVED (6 level, 120 q) | SOURCE_DERIVED (A1) + GENERATED level | SOURCE_DERIVED (HSK1) | SOURCE_DERIVED (A1) | SOURCE_DERIVED (A1) | SOURCE_DERIVED (A1) |
| Teachers / live schedules / accreditation / prices | DATA_REQUIRED | DATA_REQUIRED | DATA_REQUIRED | DATA_REQUIRED | DATA_REQUIRED | DATA_REQUIRED |

## 3. Language-specific validation (summary)

| Academy | Writing system | Pronunciation | Grammar focus | Culture |
|---|---|---|---|---|
| FR | Latin | nasal vowels, liaison, élision | level-appropriate | francophone |
| DE | Latin | Umlaute, ich/ach-Laut | gender, cases, Perfekt, word order | Sie/du |
| ZH | **characters + pinyin** | **four tones**, initials/finals, tone sandhi | aspect 了, classifiers | 春节/中秋 |
| EN | Latin | level-appropriate | tenses, conditionals | professional/IELTS |
| AR | **Arabic script (RTL)** | emphatics, pharyngeals | verbal sentence, root system | hospitality |
| RU | **Cyrillic** | palatalisation, akanye | **cases**, aspect | ты/вы |

No academy is a translation of French. Verified on the seeded unit nodes (100 % populated).

## 4. Readiness classification

| Academy | A1 | A2–B2 | C1–C2 | Overall |
|---|---|---|---|---|
| FR | READY_FOR_ACADEMIC_REVIEW | READY_FOR_ACADEMIC_REVIEW | NOT_READY | **READY_FOR_ACADEMIC_REVIEW** |
| DE | READY_FOR_ACADEMIC_REVIEW | NOT_READY | NOT_READY | CONTENT_READY (A1) |
| ZH | READY_FOR_ACADEMIC_REVIEW | NOT_READY | NOT_READY | CONTENT_READY (HSK1) |
| EN | READY_FOR_ACADEMIC_REVIEW | NOT_READY | NOT_READY | CONTENT_READY (A1) |
| AR | READY_FOR_ACADEMIC_REVIEW | NOT_READY | NOT_READY | CONTENT_READY (A1) |
| RU | READY_FOR_ACADEMIC_REVIEW | NOT_READY | NOT_READY | CONTENT_READY (A1) |

No academy is `READY_FOR_PUBLICATION` (academic review not yet performed; programmes intentionally DRAFT).

## 5. What is missing to make each academy fully teachable

1. **Seed the generated lesson bodies** (explanation, examples, dialogue, guided/independent practice, mastery criteria, assessment) — present in `curriculum-content.js`, absent from production (972 lessons).
2. **Author/obtain real content for A2–C2** of the five non-French academies and C1/C2 of French.
3. **Model exercises** in the curriculum nodes.
4. **Academic review** → then publish (separate governance step).
5. **DATA_REQUIRED**: teachers/instructors, live-class schedules, accreditation/partners, official prices beyond the project `PRICE_TABLE`.

## 6. Verdict

**READY WITH WARNINGS (READY_FOR_ACADEMIC_REVIEW for the real-content levels).**
- Teachable today from real content: **French A1, A2, B1, B2** and the **A1/HSK1** of the five other academies.
- Structure-only (not yet teachable): all generated levels.
- No programme published; no production data modified.
