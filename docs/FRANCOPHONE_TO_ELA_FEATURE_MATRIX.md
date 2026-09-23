# FRANCOPHONE_TO_ELA_FEATURE_MATRIX

Comparison of Francophone Academy V7 (reference) against ELA current (production).
Actions: KEEP (ELA keeps its own) · PORT (bring V7 capability into ELA) · ADAPT (reimplement in ELA's model) · GENERALIZE (make multi-academy) · REPLACE (supersede) · NOT APPLICABLE.

| Feature | Francophone V7 | ELA current | Action |
|---|---|---|---|
| Authentication | Firebase Auth (email + Google) | Firebase Auth (email), `ensureProfile`, `createAccount` | KEEP |
| Roles / RBAC | student, teacher, admin, superadmin (`rbac.js` + rules) | student, teacher, admin, system, academy_admin (`authz.js` + rules) | KEEP (ELA roles richer) |
| Student dashboard | `dashboard.js` (XP, quizzes, courses) | `student-hub.page.js` (`getDashboardData`, `getMyAcademies`) | KEEP |
| Student profile | `profile.js` | `student-profile.page.js` | KEEP |
| Course system | `courses` (level, category, planRequired) | `courses` + institutional `programmes` | GENERALIZE |
| Lesson system | `lessons` (HTML content, video, isFree) | `lessons` (content, vocabulary, isTrial) | PORT rich lesson bodies |
| Module grouping | `modules` (optional) | `modules`/`units`/`curriculum_nodes` (institutional) | KEEP (ELA) + map |
| Curriculum framework | none (flat) | `programmes`/`competencies`/`learning_outcomes`/blueprints | KEEP (ELA) |
| Quiz / assessment | `quizzes` (20 MCQ/level) + `submitQuizAttempt` server scoring | secure `attempts`/`results` + `getPublicQuiz`/`startAssessmentAttempt`/`submitAssessmentAttempt` | KEEP (ELA) + PORT question banks |
| Quiz question bank | inline in `quizzes` | `quizzes_bank` + `quizPublic` + `quizzes` | ADAPT V7 questions into ELA schema |
| Progress | `enrollments.progress` | `progress/{uid}` (append-only) + `enrollments` (institutional) | GENERALIZE |
| Certificates | `certificates` (quiz-based, `FA-` code) | `ela_certificates` (integrity hash, revocation, reissue) + `verifyELACertificate` | KEEP (ELA) |
| Live classes | `liveClasses` + `liveSessions` + JaaS/Jitsi + presence | `liveClasses` + `class_sessions` + attendance; `getLiveCatalog`/`getLiveMeetingLink` | ADAPT (port JaaS/presence) |
| Subscriptions | embedded on `users.subscription` + `subscriptions` mirror | `subscriptions/{uid}` doc + `users.plan` | KEEP (ELA) — normalize |
| Entitlements | `hasActiveSubscription` (catalog.js) | per-callable checks (`getPublicQuiz`, `startAssessmentAttempt`, `getDashboardData`) | KEEP + PORT `getLessonContent` gate |
| Paid-content protection | callables (`getCourseSyllabus`/`getLessonContent`) | partial (lessons readable) | **PORT** (protect lesson content) |
| Free trial | guest 3 + account 5 + free/course 3 | `isTrial` lessons + `getTrialLessons` | ADAPT (align constants) |
| Payments | Paystack + webhook | Paystack + webhook | KEEP |
| Referrals | `processReferral`, `referrals` | referral in `index.js`/`payment.js`, `referralCredit` | KEEP |
| Invoices | `customInvoices`, `invoice.js`, email | `createCustomInvoice`/`getInvoiceList` (management.js) | KEEP |
| Notifications / emails | SendGrid (`emails.js`), `notifications` | `nurture.js` (SendGrid), `sendEmail` in core | KEEP |
| WhatsApp | `whatsapp.js`, `whatsappLog` | `getWhatsAppLogs` (management) | KEEP |
| Community / forum | `forum.js`, `forumPosts` | not present | PORT (optional) |
| Learning assistant | `assistantChat` (OpenRouter/Gemini) | `learningAssistant` (OpenRouter) | KEEP |
| AI tutor | `tutorResponse` | not present | PORT (optional) |
| AI course/video/visual generators | present (`aiCourseGenerator`, `aiVideoScript`, `aiVisual`, HeyGen) | not present | PORT (optional, teacher tooling) |
| Video engine | custom orchestrator + worker | `video_pipeline/` (local scripts) | NOT APPLICABLE (local tooling) |
| PWA | manifest + sw + install prompt | manifest + sw + install banner | KEEP |
| SEO | robots, sitemap, OG; static title | robots, sitemap, OG, hreflang, JSON-LD, static pages | KEEP (ELA stronger) |
| i18n | EN UI (FR target) | 7 UI languages + ES | KEEP (ELA stronger) |
| Admin panel | `admin.js` (single page) | `js/admin/**` modular pages | KEEP (ELA stronger) |
| Teacher tools | `teacher-studio`, `teacher-programs`, `teacher-students`, video studio | `js/teacher/**`, `staff.js` | KEEP + PORT programme tooling |
| Academic records / exams / governance | not present | present (`academic`, `examination`, `governance`) | KEEP (ELA) |
| Attendance | presence in live sessions | `attendance.js` (full) | KEEP (ELA) |

## Priority ports (ELA gaps vs V7)

1. **Rich French lesson bodies** (23) + **6 CEFR quizzes / 120 questions** → into ELA content model. (High)
2. **Paid-lesson protection callable** (`getLessonContent` pattern) if ELA exposes lesson bodies. (High)
3. **JaaS/Jitsi live-class token + presence** for real live classes. (Medium)
4. **Community/forum** and **AI tutor/teacher generators**. (Low/optional)
5. **Free-trial funnel constants** alignment (guest/account). (Medium)

## What ELA should NOT import from V7

- The flat `course → lesson` model as the *primary* pedagogy (ELA's institutional model is richer).
- The embedded `users.subscription` (ELA keeps a separate `subscriptions` doc).
- Seed placeholder instructors as if real.
- The single-academy assumption.
