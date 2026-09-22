# ELA_DATA_MISSION_BASELINE

Mission: ELA Production Data, Curriculum & Business Validation
Date: 2026-09-23
Scope of this document: Phase 0 baseline (read-only). No production data was modified.

## Environment

| Item | Value |
|---|---|
| Firebase project | `ela-academy-7f868` |
| Production URL | https://elaacademy.ng/ |
| Branch | `master` |
| HEAD | `eaafe553f3e191542216643637366bdaebc1b628` (`eaafe55`) |
| Firestore database | `(default)` |

## Git state (Phase 0)

Tracked, uncommitted modifications (pre-existing, NOT part of this mission, preserved):
```
 M firebase.json
 M i18n/ar.json  M i18n/de.json  M i18n/en.json  M i18n/es.json
 M i18n/fr.json  M i18n/ru.json  M i18n/zh.json
 M js/teacher/components/quiz-question-card.js
```
Untracked files: 130 (reports, tests, diagnostic artefacts) — preserved, none deleted.

No `git reset`, `git clean`, `git checkout`, `git stash` performed.

Recent commits:
```
eaafe55 Fix protected routes on hard reload: re-render route on auth state change
7b2b277 Fix student profile route: define missing esc() helper
64912cc Fix getProgrammeDefinition: validate programmeId (400 instead of 500)
b358233 Fix /verifyELACertificate routing: use redirect (Hosting cannot proxy to africa-south1)
200daaf Harden Firebase Hosting config (restrict published payload to frontend)
4d1caa1 Fix Functions discovery timeout for Firebase deploy
```

## Deployed services

| Service | State |
|---|---|
| Cloud Functions | 127 / 127 ACTIVE |
| Hosting | Deployed (158 files / 1.36 MB) |
| Firestore Rules | Deployed (production) |
| Storage | NOT deployed |

## Firestore root collections actually present in production (12)

| Collection | Count |
|---|---|
| `academies` | 0 |
| `courses` | 5 |
| `emails` | 3 |
| `lessons` | 104 |
| `marketingEvents` | 1678 |
| `newsletterSubscribers` | 1 |
| `progress` | 1 |
| `quizzes` | 32 |
| `signupAttempts` | 4 |
| `subscriptions` | 2 |
| `transactions` | 5 |
| `users` | 9 |

## Collections referenced by the application (code = source of truth)

**Student Area** (`src/ela/pages/student-hub.page.js`, `student-profile.page.js`, `js/core/auth.service.js`, `academies.config.js`, `academy-access.js`):
`users`, `progress`, `subscriptions`, `courses`, `lessons`, `quizzes` (via `getMyAcademies` / `getDashboardData` / `getCatalog` / `getCourse`).

**Teacher Area** (`js/teacher/**`, `functions/staff.js`, `teacher_profiles`, `content`):
`users` (role), `teacher_profiles`, `staff_applications`, `courses`, `lessons`, `quizzes`, `liveClasses`, `submissions` (content repository).

**Admin Area** (`js/admin/**`, `functions/admin.js`, `management.js`):
`users`, `subscriptions`, `transactions`, `invoices`, `whatsappLogs`, `quizzes`, `liveClasses`, `certificates`/`ela_certificates`, `content` review collections.

**Quiz / Assessment** (`functions/core.js`, `assessment.js`, `eligibility.js`, `quizbank.js`):
`quizzes`, `quizzes_bank`, `quizPublic`, `quizScores`, `attempts`, `results`, `assessment_events`, `subscriptions`, `users`, `progress`.

**Certificates** (`functions/ela-certificates.js`, `ela-certificate-core.js`, `certificate.js`):
`ela_certificates`, `ela_certificate_events`, `certificate_grants`, `results`, `academic_records`.

**Live Classes** (`functions/live.js`, `attendance.js`):
`liveClasses`, `class_sessions`, `attendance_records`, `attendance_corrections`.

**Institutional / Governance** (`functions/academic*.js`, `curriculum*.js`, `governance*.js`, `examination.js`, `certification.js`):
`programmes`, `programme_versions`, `curriculum_nodes`, `levels`, `modules`, `units`, `competencies`, `learning_outcomes`, `assessment_blueprints`, `examination_blueprints`, `rubrics`, `enrollments`, `academic_records`, `examinations`, `exam_registrations`, `exam_attempts`, `exam_submissions`, `exam_results`, `examiner_authorizations`, `examiner_assignments`, `governance_roles`, `reviewer_profiles`, `review_assignments`, `review_issues`, `academic_reviews`, `academic_decisions`, `academic_publications`, `academic_appeals`, `academic_board_members`, `academic_events`, `academic_versions`, `conflict_declarations`, `emergency_corrections`, `moderation_events`, `result_corrections`, `role_audit_events`, `governance_audit_events`, `rate_limits`, `assistantUsage`.

## Broken code references discovered (Phase 0)

- `functions/core.js:578` → `require('./seed-a1/' + files[code])` : **`functions/seed-a1/` does not exist** → `seedAcademyA1` will throw at runtime.
- `functions/core.js:706` → `require('./curriculum-quizzes')` : **`functions/curriculum-quizzes.js` does not exist** → `seedCurriculum` will throw at runtime.

These are pre-existing broken references; they are recorded here and are NOT modified in Phases 0–3.

## Guardrails for this mission

- No production writes in Phases 0–3.
- No deployment of Functions/Hosting/Rules/Storage.
- No user/role/payment/subscription modification.
- No invented official data (see `docs/ELA_CONTENT_SOURCE_REGISTER.md`).
