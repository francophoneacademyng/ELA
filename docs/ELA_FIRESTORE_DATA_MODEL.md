# ELA_FIRESTORE_DATA_MODEL

Source of truth: the deployed code (`functions/**`, `src/**`, `js/**`, `firestore.rules`).
Fields marked **(sample)** were observed in production on 2026-09-23; others are derived from the code that reads/writes them.

Legend: R = required, O = optional. "Prod" = present in production today.

---

## 1. Legacy learning catalogue (populated in production)

### `courses`  (Prod: 5)
Doc ID: `{academy}-{slug}` e.g. `arabic-arabic-a1-foundations`.
| field | type | R/O | notes |
|---|---|---|---|
| `title` | string | R | (sample) |
| `academy` | string | R | `french|german|mandarin|english|arabic|russian` |
| `level` | string | R | `A1`, `A1–A2`, `HSK 1`… |
| `category` | string | O | e.g. `General Path` |
| `description` | string | O | marketing copy |
| `learningOutcomes` | array<string> | O | (sample) |
| `order` | number | O | display order |
| `status` | string | R | `approved` required by `getCatalog`/`getCourse` |
| `createdAt` | timestamp | O | |
Consumers: `core.getCatalog`, `core.getCourse`; Student Hub / Courses page.
Risk if absent: Courses page and `getCourse` empty → student cannot browse.

### `lessons`  (Prod: 104)
Doc ID: `{academyCode}_a1_lesson_{n}` e.g. `ar_a1_lesson_1`.
| field | type | R/O | notes |
|---|---|---|---|
| `id` | string | R | duplicates doc id |
| `academyCode` | string | R | `AR|FR|DE|ZH|EN|RU` |
| `academyName` | string | O | e.g. `Arabophone` |
| `level` | string | R | |
| `lessonNumber` | number | R | |
| `order` | number | O | |
| `title` | string | R | |
| `description` | string | O | |
| `content` | string (HTML) | R for published | lesson body |
| `vocabulary` | array | O | |
| `duration` | string | O | `"20 min"` |
| `isTrial` | boolean | R | trial gating |
| `trialAccess` | string | O | `instant` |
| `status` | string | R | `published` required |
| `createdAt`/`updatedAt` | timestamp | O | |
Consumers: `core.getTrialLessons`, `core.getCourse`, Student academy pages.
Risk if absent: lessons unavailable → no learning content.

### `quizzes`  (Prod: 32)
Doc ID: `{academy}-{slug}-l{n}-quiz` e.g. `arabic-arabic-a1-foundations-l1-quiz`.
| field | type | R/O | notes |
|---|---|---|---|
| `title` | string | R | |
| `academy` | string | R | |
| `level` | string | R | |
| `lessonId` | string | R | relation → `lessons` |
| `courseId` | string | R | relation → `courses` |
| `questions` | array<{text,options,correctIndex,…}> | R | **`correctIndex` server-only** |
| `isTrial` | boolean | R | |
| `status` | string | R | `approved` required by `getPublicQuiz` |
| `teacherUid` | string\|null | O | |
| `createdAt` | timestamp | O | |
Consumers: `core.getPublicQuiz`, `core.getQuizCatalog`, `assessment.startAssessmentAttempt`.
Risk if absent: quiz page/assessment empty. **Never expose `correctIndex`.**

### `academies`  (Prod: 0 — EMPTY)
Expected by `core.getAcademyTree`, `getMyAcademies` and academy pages.
Status: **MISSING_OFFICIAL_DATA / not seeded.**

---

## 2. Identity, entitlement, progress (populated)

### `users`  (Prod: 9)
Doc ID = Firebase Auth uid.
Fields (sample): `role` (R: `student|teacher|admin|system|academy_admin`), `email`, `displayName`, `academy`, `academies` (array), `interfaceLang`, `referralCode`, `referralCodeUsed`, `referralCredit`, `plan`, `durationMonths`, `firstPaymentDone`, `createdAt`.
Consumers: `authz`, `auth`, `eligibility`, `getPublicQuiz`, `getDashboardData`, all role guards.
Risk: role drives all authorization.

### `subscriptions`  (Prod: 2)
Doc ID = uid.
Fields (sample): `plan` (`general|premium|business|free`), `status` (`active|revoked|expired`), `startDate`, `endDate`, `amount`, `duration`, `reference`, `updatedAt`.
Consumer: entitlement checks (`getPublicQuiz`, `startAssessmentAttempt`, `getDashboardData`).
Rule: active requires `status==='active'` AND `endDate > now`.

### `progress`  (Prod: 1)
Doc ID = uid. Fields: `completedLessons` (array, append-only), `updatedAt`.
Consumer: `getDashboardData`, Student Hub. Rules enforce append-only + max 500.

### `transactions`  (Prod: 5)
Doc ID: `ela-{uid8}-{ts}`. Fields: `uid`, `email`, `plan`, `duration`, `amount`, `baseAmount`, `discount`, `creditUsed`, `referrerUid`, `status` (`pending|success`), `createdAt`, `paidAt`.
Consumer: `payment.js` (Paystack), Admin invoices/revenue.

### `emails`  (Prod: 3) — doc ID = email → `{uid, createdAt}`. Used for uniqueness (`checkEmailUnique`).
### `newsletterSubscribers`  (Prod: 1) — `{email, source, ts}`.
### `marketingEvents`  (Prod: 1678) — analytics events.
### `signupAttempts`  (Prod: 4) — signup rate-limiting/audit.

---

## 3. Secure assessment (created on demand; Prod: absent until first use)

### `attempts` — doc ID `{uid}_{quizId}_{nonce}`. Fields: `studentId`, `quizId`, `academy`, `level`, `status` (`active|finalized|expired`), `seed`, `questions` (server order, no answers), `createdAt`, `expiresAt`.
### `results` — doc ID = attemptId. Fields: `studentId`, `percentage`, `passed`, `finalized`, `source` (`authoritative`), `scoreGlobal`, `breakdown`, `createdAt`.
### `assessment_events` — audit (`ATTEMPT_CREATED`, `ATTEMPT_GRADED`).
### `quizzes_bank` — server-only question bank (never client-readable).
### `quizPublic` — public projection (no `correctIndex`).
### `quizScores` — legacy, client write disabled.
Consumers: `assessment.js`, `eligibility.js`, `quizbank.js`.
Security: grading uses `runTransaction`; idempotent (`duplicate:true/false`); no client score accepted.

---

## 4. Certificates (Prod: absent until issuance)

### `ela_certificates` — doc ID `ELA-{AC}-{level}-{suffix}`. Fields: `id`, `studentId`, `studentName`, `institution`, `academyCode`, `cecrLevel`, `certificateType`, `scoreGlobal`, `issueDate`, `expiryDate`, `status` (`active|revoked`), `signatureHash`, `pdfUrl`, `pdfStoragePath`.
### `ela_certificate_events` — issuance/revocation audit.
### `certificate_grants` — grant records.
Consumers: `ela-certificates.js`, `ela-certificate-core.js`, `certificate.js`; `verifyELACertificate` (public read of `publicView` only).
Security: `ela_certificates` client write=false; integrity via `signatureHash`.

---

## 5. Live classes (Prod: absent)

### `liveClasses` — fields per `live.js`: `title`, `academy`, `level`, `scheduledAt`, `status` (`scheduled|live|completed`), `meetingUrl` (server-only until authorized), `createdBy`.
### `class_sessions`, `attendance_records`, `attendance_corrections` — attendance module.
Consumer: `live.getLiveCatalog` (no meeting link), `live.getLiveMeetingLink` (auth + class id).
Rule: meeting link never exposed in the public catalogue.

---

## 6. Institutional / academic framework (Prod: absent — the core gap)

### `programmes` — doc ID `prog_{academy}_{level}` (from `curriculum-content.buildLevelContent`). Fields: `programmeId`, `academyCode`, `level`, `band`, `structure`, `modules[]`, `contentState`, `status` (`draft|published`), `currentVersion`.
### `programme_versions` — doc ID `{programmeId}_v{n}`. Versioned definition.
### `curriculum_nodes` — flattened modules/units/lessons with `parentId`, `type`, `order`, `state`.
### `competencies` — `C-LIS, C-REA, C-WRI, C-SPE, C-GRA, C-VOC, C-PRO, C-INT, C-ICU`.
### `learning_outcomes` — doc ID `{AC}-{level}-LO-0n`.
### `assessment_blueprints` (`AB-{AC}-{level}`), `examination_blueprints` (`EX-{AC}-{level}`), `rubrics`.
### `levels`, `modules`, `units` — referenced by `levels`/`modules`/`units` constants in code.
Consumers: `curriculum.js` (`getProgrammeCatalog`, `getProgrammeDefinition`, `getCurriculum`, `seedAcademicFramework`), `academic.js`.
Risk if absent: **the entire Programme/Curriculum/Institutional experience is empty** (observed: `getProgrammeCatalog` → `{programmes:[]}`).

---

## 7. Enrolment / academic records (Prod: absent)

### `enrollments` — student ↔ programme.
### `academic_records` — academic history per student.
Consumers: `academic.js`, `certification.js`.

---

## 8. Examinations (Prod: absent)

`examinations`, `examination_versions`, `exam_registrations`, `exam_attempts`, `exam_submissions`, `exam_results`, `examiner_authorizations`, `examiner_assignments`, `result_corrections`, `moderation_events`.
Consumers: `examination.js`, `certification.js`.

---

## 9. Governance (Prod: absent)

`governance_roles`, `reviewer_profiles`, `review_assignments`, `review_issues`, `academic_reviews`, `academic_decisions`, `academic_publications`, `academic_appeals`, `academic_board_members`, `academic_events`, `academic_versions`, `conflict_declarations`, `emergency_corrections`, `role_audit_events`, `governance_audit_events`.
Consumers: `governance.js`, `curriculum.js` (traceability).

---

## 10. Operational / support

`invoices`, `whatsappLogs` (`management.js`), `rate_limits` (`ratelimit.js`), `assistantUsage` (`core.learningAssistant`), `staff_applications`/`teacher_profiles` (`staff.js`), `leadMagnetLeads` (frontend), `institutions` (`institution.js`).

---

## Key relations

```
courses (1) ──< lessons (academyCode+level)
courses (1) ──< quizzes (courseId) ── lessonId ──> lessons
users (1) ──< subscriptions (docId=uid)
users (1) ──< progress   (docId=uid)
users (1) ──< attempts   ──> results (docId=attemptId) ──> certificates
programmes (1) ──< programme_versions ; programmes ──< curriculum_nodes
enrollments: users ── programmes
```

## Consumers matrix (summary)

| Collection | Student | Teacher | Admin | Functions |
|---|---|---|---|---|
| courses/lessons/quizzes | ● | ● | ● | core, assessment |
| users/subscriptions/progress | ● | ● | ● | auth, authz, core |
| programmes/curriculum_nodes/… | ● | ● | ● | curriculum, academic |
| ela_certificates | ● | | ● | ela-certificates |
| liveClasses | ● | ● | ● | live |
| transactions/invoices | | | ● | payment, management |
| governance/examinations | | ● | ● | governance, examination |
