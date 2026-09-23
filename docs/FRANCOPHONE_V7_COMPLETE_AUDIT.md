# FRANCOPHONE_V7_COMPLETE_AUDIT

Reference project: `C:\Users\11e\Desktop\VERSION 8\Kimi_Agent_Discussions avec pièces jointes\francophone-academy-v7`
Live: https://francophone.ng/  ·  Firebase project: `francophone-academy`
Audit date: 2026-09-23. Read-only.

## 1. What it is

**Francophone Academy V7 Enterprise** — a production SaaS for learning **French** for the Nigerian market. Single-academy (French only), vanilla HTML/CSS/JS frontend (no framework, no ES modules, hash router), Firebase backend, Paystack payments, SendGrid emails. The repo also contains a full product/marketing audit (`docs/audit/FRANCOPHONE_ACADEMY_AUDIT_COMPLET.md`) that explicitly targets "FRANCOPHONE ACADEMY / ELA ACADEMY" — i.e. V7 was already treated as the ELA precursor.

## 2. Stack & structure

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS, hash router, CDN Firebase compat SDK |
| Auth | Firebase Auth (email + Google) |
| DB | Cloud Firestore (role-based rules) |
| Payments | Paystack (inline + webhook) |
| Emails | SendGrid via Cloud Functions |
| Certificates | PDFKit (server) + jsPDF (client download) |
| Live | JaaS / Jitsi (JWT tokens) |
| AI | OpenRouter + Gemini (assistant, tutor, course/video/visual generation) + a video engine |
| Hosting | Firebase Hosting (`public: "public"`) |

```
public/            frontend (hosting root)
  css/             13 stylesheets (variables, layout, components, pages, curriculum-styles, responsive, classroom)
  js/
    config/        constants.js, pricing.js (single source), firebase.js
    core/          auth.js, rbac.js, validators.js
    infrastructure/repositories/  user, course, quiz, liveClass, certificate, payment, referral, forum
    infrastructure/services/      analytics, catalog, certificate, marketing, payment, referral, subscription, tutor, videoEngine
    components/    header, footer, sidebar, avatar, modal, social
    pages/         home, courses, course-detail, classroom, dashboard, profile, pricing, checkout,
                   quiz, quiz-take, certificates, verify-cert, live-classes, live-class, live-join,
                   forum, referrals, invoice, free-trial, login, register, forgot-password,
                   payment-success, admin, teacher-studio, video-library, video-studio(-ai),
                   ai-course-generator, ai-visual-generator, course-exporter
    student/pages/ student-progress.page.js
    teacher/pages/ teacher-programs.page.js, teacher-students.page.js
    assistant.js, marketing.js, pwa-install.js, router.js, app.js
functions/         index.js + src/* (access, catalog, certificates, customInvoices, email(s), jaas,
                   liveAccess, liveClasses, liveClassSession, liveSession, liveSingleSession,
                   marketing, paystack, referrals, scheduled, tutor, whatsapp, ai*) + video-engine/
scripts/           seed-data.js, update-all-lessons.js, update-quizzes.js, upload-video.js, maintenance
firestore.rules, storage.rules, firestore.indexes.json
```

## 3. Roles

`student`, `teacher`, `admin`, `superadmin` (`config/constants.js`, `core/rbac.js`, `firestore.rules`).
RBAC helper functions: `isSignedIn`, `isOwner`, `isAdmin`, `isAdminOnly`, `isSuperAdmin`, `isTeacher`, `isClassOwner`, `isRoomParticipant`.

## 4. Routes (hash router, `public/js/router.js`)

- **Public:** `/`, `/login`, `/register`, `/forgot-password`, `/pricing`, `/courses`, `/free-trial`, `/course/:id`, `/quiz`, `/verify-cert`, `/forum`, `/community`, `/live-classes`, `/checkout`, `/payment-success`, `/invoice`
- **Protected:** `/quiz-take`, `/dashboard`, `/profile`, `/certificates`, `/referrals`, `/classroom`, `/classroom/:id`, `/live/join/:id`
- **Teacher (minRole teacher):** `/teacher-studio`, `/teacher/videos`, `/teacher/courses`, `/teacher/students`, `/teacher/programs`, `/teacher/live/:id`, `/teacher/live/new`, `/teacher/ai-studio/{course,video,visuals}`
- **Admin:** `/admin`, `/video-studio`

## 5. Cloud Functions (`functions/index.js`, ~55 exports)

- **Catalog/learning:** `getCourseSyllabus`, `getLessonContent`, `getQuizForStudent`, `submitQuizAttempt`
- **Certificates:** `generateCertificate` (Firestore trigger on `quizAttempts`), `verifyCertificate`
- **Payments:** `paystackWebhook`, `verifyPaystackPayment`, `cancelSubscription`, `checkAbandonedCheckouts`, `expireCustomInvoices`, `generateInvoicePaymentLink`
- **Subscriptions:** `checkSubscriptionExpiry`, `extendStudentAccess`
- **Live:** `createLiveClass`, `startLiveClass`, `endLiveClass`, `joinLiveClass`, `leaveLiveClass`, `manageLiveClass`, `getJaasToken`, `logPresence`, `onLiveClassCreated`, `onClassGoesLive`, `sendClassReminders`
- **Emails/WhatsApp:** `sendWelcomeEmail`, `sendInvoiceEmail`, `sendCustomInvoiceEmail`, `sendClassReminders`, (whatsapp module)
- **Referrals:** `processReferral`
- **AI/Media:** `assistantChat`, `tutorResponse`, `generateCourse`, `generateVideoScript`, `generateVisual`, `generateLessonVideo`, `heygenCallback`, `checkLessonVideoStatus`, `saveLessonPrompt`
- **Video engine:** `videoEngine*` (projects/jobs/runs/providers/pipeline/worker health) — a large custom pipeline (orchestrator + providers + Colab worker)

## 6. Firestore collections (from `firestore.rules` + code)

`users`, `courses`, `modules`, `lessons`, `enrollments`, `quizzes`, `quizAttempts`, `certificates`, `subscriptions`, `payments`, `customInvoices`, `pricing`, `liveClasses` (+ subcollection `attendees`), `liveSessions` (+ `participants`), `presence`, `referrals`, `forumPosts`, `messages`, `tutorSessions`, `notifications`, `newsletter`, `marketingEvents`, `analyticsEvents`, `accessExtensions`, `whatsappLog`, `counters`, `versions`, `generationJobs`, `videoJobs`, `videoProjects`, `databases`.

## 7. Data model (verified from `scripts/seed-data.js`, repositories, functions)

- **`courses`**: `title, slug, description, level (A1–C2), category, planRequired (general|premium|business), instructorName, imageUrl, durationMinutes, lessonCount, isPublished, isFeatured, order, learningOutcomes[], createdAt, updatedAt`
- **`lessons`**: `courseId, order, title, content (HTML), videoUrl, videoDuration, videoStatus, transcript, isFree, hidden/status, createdAt`
- **`modules`**: `courseId, order, …` (course modules; listModules)
- **`enrollments`**: `userId, courseId, progress{completedLessons[], currentLessonId, percentComplete, lastAccessedAt}, status, enrolledAt, completedAt`
- **`quizzes`**: `title, level, category, timeLimit, passingScore (80), isPublished, questions[{id,type:'multiple_choice',question,options[],correctAnswer(index),explanation,points}]`
- **`quizAttempts`**: `userId, quizId, quizTitle, level, score, maxScore, percentage, passed, earnedXP, answers[], createdAt` (written **server-side only**)
- **`certificates`**: `userId, quizId, level, verificationCode ('FA-{level}-{5 digits}'), studentName, pdfUrl, createdAt`
- **`liveClasses`**: `title, instructorName, level, startAt, durationMinutes, status (upcoming|live|completed), students, maxStudents, meetingUrl, imageUrl`; subcollection `attendees/{uid}`
- **`liveSessions`**: runtime session + `participants/{uid}` presence
- **`users`**: profile + `role` + **embedded `subscription {plan,status,endDate,expiresAt,engagement,…}`** + `stats {totalQuizzesTaken, averageQuizScore, totalXP}`
- **`subscriptions`**: mirror docs (`userId, status, plan, endDate`) read by the expiry cron
- **`pricing/current`**: `currency, plans{general,premium,business:{name,monthlyPrice}}, engagementDiscounts{quarterly,biannual}, referral{refereeDiscount:15000, referrerReward:10000}`

## 8. Access & entitlement logic (`functions/src/catalog.js`)

- Paid content and quiz answer keys are **no longer readable directly** from Firestore; clients call callables.
- `getCourseSyllabus` → public lesson metadata (never `content`/`videoUrl`).
- `getLessonContent` → allowed if `lesson.isFree` **or** staff role **or** active paid subscription.
- `hasActiveSubscription`: `status==='active'` AND plan ∈ {general,premium,business} AND `endDate`/`expiresAt` in the future.
- `getQuizForStudent` → questions **without `correctAnswer`**.
- `submitQuizAttempt` → **server scoring**, writes `quizAttempts`, updates `users.stats`; triggers certificate at ≥80%.

## 9. Free-trial funnel (`config/constants.js`)

`guestLessons: 3` (no account), `accountLessons: 5` (free account), `freeLessonsPerCourse: 3` (fallback), `freeVideoPreviews: 1`.

## 10. Certificates

Trigger `quizAttempts/{id}` onCreate → if `passed && percentage>=80` and no existing cert for (quizId,userId) → generate PDF (PDFKit) with `verificationCode` `FA-{level}-{5 digits}`; public verification via `verifyCertificate` / `/verify-cert`.

## 11. Live classes

Scheduled `liveClasses`; runtime `liveSessions` + `participants` presence; JaaS JWT (`getJaasToken`); access control (`liveAccess.js`, `isClassOwner`, `isRoomParticipant`); reminders via `scheduled.js`; callables create/start/end/join/leave.

## 12. Payments / referrals / emails

Paystack inline + secured webhook; `payments`, `customInvoices`, `subscriptions`; referral engine (`processReferral`, `referrals`); SendGrid transactional emails; WhatsApp integration.

## 13. AI & media

Learning assistant (`assistantChat`), tutor (`tutorResponse`), AI course generator, AI video script/visual generators, HeyGen avatar video, and a **custom video engine** (orchestrator, job/project store, providers, Colab worker) — the most advanced media subsystem.

## 14. PWA & SEO

`manifest.json`, `sw.js`, icons, `robots.txt`, `sitemap.xml`, OG image. Per-route `document.title` is **not** updated (single title observed at runtime).

## 15. Strengths (what V7 does well)

1. **Server-enforced paid content + quiz keys** (callables, not direct Firestore reads).
2. **Server-side quiz scoring** and attempt records (no client score trust).
3. **Automatic certificate generation** on passing attempts, with public verification.
4. **Coherent single-course-library model** (courses → lessons → quizzes) with CEFR levels A1–C2 and plan gating.
5. **Complete commercial loop:** pricing → checkout → Paystack → subscription → entitlement → content.
6. **Live classes with real access control** and presence.
7. **Rich lesson content** (vocabulary tables, dialogues, tips, mini-exercises) with a Nigerian context.
8. **Free-trial funnel** (guest + account lessons).
9. **Extensive AI/media tooling** and a video pipeline.
10. **Roles/RBAC** including `superadmin`.

## 16. Weaknesses / observations

1. **Flat pedagogy:** `course → lesson` (+ optional `modules`); no programme/level/module/unit/competency/outcome framework.
2. **Single academy/language** (French only); no academy abstraction.
3. **Embedded subscription on `users`** plus a `subscriptions` mirror (dual source; sync complexity).
4. **Certificate model is course/quiz-scoped**, not linked to an institutional academic record.
5. **Some legacy seed courses use generic lesson titles** ("Lesson 1") in `seed-data.js` — superseded by `update-all-lessons.js`.
6. `seed-data.js` uses `.add()` (auto IDs) for lessons/liveClasses → non-deterministic IDs.
7. `document.title` not per-route.
8. Repo contains large logs, secrets file (`serviceAccountKey.json` — must never be committed/exposed).

## 17. What ELA already has that V7 lacks

- **Institutional academic framework:** `programmes`, `programme_versions`, `curriculum_nodes`, `competencies`, `learning_outcomes`, `assessment_blueprints`, `examination_blueprints`, `rubrics`, governance, examinations, academic records, attendance.
- **Six academies / six languages** abstraction (config + routes + i18n ×7).
- **Secure assessment attempt model** (`attempts` with seed + server question order, `results`, idempotence, `assessment_events`), distinct from V7's `quizAttempts`.
- **Institutional certificates** (`ela_certificates` with integrity/authenticity hashing, revocation, reissue).
- **Multilingual i18n** and public SEO pages per academy.

## 18. Conclusion

V7 is the **reference implementation of the commercial learning loop and content pipeline**; ELA is the **reference implementation of the institutional/academic framework and multi-academy abstraction**. The target is **one ELA core** (V7's proven loop + ELA's institutional model) with **academy-specific content** for the six languages.
