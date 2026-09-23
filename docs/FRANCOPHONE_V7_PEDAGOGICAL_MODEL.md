# FRANCOPHONE_V7_PEDAGOGICAL_MODEL

The ACTUAL model used by Francophone Academy V7 (terminology from the code), not an invented one.

## Hierarchy (as implemented)

```
Academy (implicit — single: "Francophone Academy", French)
  └── Course            (level A1–C2, category, planRequired, learningOutcomes)
        └── Module      (optional grouping; collection `modules`, courseId + order)
        └── Lesson      (courseId, order, title, content, video, isFree, transcript)
  └── Quiz              (per CEFR level; 20 MCQ; passingScore 80)
        └── Question    (id, type, question, options[], correctAnswer, explanation, points)
        └── Attempt     (`quizAttempts`, server-scored)
              └── Certificate (`certificates`, auto at ≥80%)
  └── LiveClass         (level, instructor, startAt, maxStudents)
        └── Session     (`liveSessions` + `participants`/`attendees`)
  └── Enrollment        (userId ↔ courseId, progress)
```

## Terminology actually found

| Concept | V7 name / field | Notes |
|---|---|---|
| Academy | `APP_NAME = 'Francophone Academy'` | single, not a collection |
| Level | `level` ∈ `CEFR_LEVELS = [A1,A2,B1,B2,C1,C2]` | CEFR labels A1 Beginner … C2 Mastery |
| Course | `courses` | has `category`, `planRequired`, `learningOutcomes`, `lessonCount` |
| Category | `COURSE_CATEGORIES` = grammar, vocabulary, pronunciation, culture, business | |
| Module | `modules` (optional) | `courseId`, `order` |
| Lesson | `lessons` | `content` HTML, `videoUrl`, `videoDuration`, `isFree`, `transcript`, `hidden` |
| Quiz / Assessment | `quizzes` (per level) | `timeLimit`, `passingScore=80`, `questions[]` |
| Question | MCQ object | `correctAnswer` (index), `explanation`, `points` |
| Attempt | `quizAttempts` | server-written; `score, percentage, passed, earnedXP, answers[]` |
| Progress | `enrollments.progress` | `completedLessons[]`, `percentComplete`, `lastAccessedAt` |
| Certificate | `certificates` | `verificationCode FA-{level}-{5}`, PDF |
| Live class | `liveClasses` / `liveSessions` | `level`, `startAt`, `status`, `maxStudents` |
| Competency / Outcome | **not a first-class model** | only `learningOutcomes[]` text on courses |
| Programme / Unit | **not present** | (ELA has these) |

## CEFR alignment

Levels A1–C2 are used as course and quiz labels. The platform's own copy references "CEFR framework" and "DELF B2" as *targets*. V7 does **not** claim external accreditation; any "certification" is an internal Francophone Academy certificate.

## Access / gating model

- Course-level gate: `planRequired` ∈ {general, premium, business}.
- Lesson-level gate: `isFree` (3 free lessons per course by convention; `FREE_TRIAL.freeLessonsPerCourse = 3`).
- Free-trial funnel: `guestLessons=3` (no account), `accountLessons=5` (free account), `freeVideoPreviews=1`.
- Entitlement: active paid subscription (`hasActiveSubscription`) or staff role.

## Assessment model

- One assessment per CEFR level (`quiz-a1` … `quiz-c2`); 20 MCQ each; 15-minute limit; pass ≥ 80%.
- Scoring is **server-side** (`submitQuizAttempt`); the client receives questions **without** `correctAnswer`.
- A passing attempt auto-generates a certificate (idempotent per quizId+userId).

## Progression model

- Per-course `enrollments` with `completedLessons[]` and `percentComplete`; `status: active → completed`.
- Cross-course gamification on `users.stats`: `totalQuizzesTaken`, `averageQuizScore`, `totalXP` (XP = 10×correct + 50 if passed).

## Content model

- Lesson bodies are rich HTML: sections, vocabulary tables, dialogues (Nigerian context), pronunciation tips, mini-exercises (`update-all-lessons.js`).
- Media: optional lesson `videoUrl` + `transcript`; a video engine can generate lesson videos.
- Language: English UI, French target language.

## What is NOT in the V7 pedagogical model

- No programme / level / module / unit / competency / learning-outcome graph.
- No examination/governance/academic-record layer.
- No multi-academy abstraction.

## Reusable pedagogical structures (for ELA)

1. `courses → modules → lessons` with `order`, `isFree`, `content`, `video` — a proven, simple content spine.
2. Per-level MCQ assessment with server scoring + 80% pass + certificate trigger.
3. `enrollments.progress` per-course progression.
4. Free-trial funnel constants.
5. Rich lesson HTML conventions (`lc-h3`, `lc-table`, `lc-intro`) for consistent rendering.
