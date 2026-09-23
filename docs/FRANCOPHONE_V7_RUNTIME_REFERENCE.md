# FRANCOPHONE_V7_RUNTIME_REFERENCE

Runtime analysis of https://francophone.ng/ performed 2026-09-23 with headless Chromium (Edge), compared against the local V7 source.
Method: hash-route navigation, DOM text capture, console-exception and HTTP≥400 capture.
**Browser-verified** = observed at runtime. **Source-derived** = read from code only.

## Hosting & delivery

- Root `https://francophone.ng/` returns the SPA shell; `Loading Francophone Academy…` is the pre-JS state.
- `firebase.json`: `public: "public"`, rewrite `** → /index.html`, cache `public,max-age=3600` for `.js`/`.css`, `no-cache` for `index.html`.

## Route behaviour (browser-verified)

| Route | Result | Auth guard |
|---|---|---|
| `#/` | renders (header: Home/Courses/Quiz/Live Classes/Pricing/Community/Free Trial; "Sign In", "Get Started Free") | public |
| `#/pricing` | renders pricing | public |
| `#/courses` | renders catalogue | public |
| `#/free-trial` | renders ("10…") | public |
| `#/quiz` | renders assessments list ("As…") | public |
| `#/verify-cert` | renders ("FA…") | public |
| `#/forum` | renders ("CO…" community) | public |
| `#/live-classes` | renders ("LI…") | public |
| `#/login` | renders login | public |
| `#/register` | renders register | public |
| `#/community` | renders community | public |
| `#/dashboard` | **redirects to `#/login`** | protected ✔ |
| `#/profile` | **redirects to `#/login`** | protected ✔ |
| `#/certificates` | **redirects to `#/login`** | protected ✔ |
| `#/referrals` | **redirects to `#/login`** | protected ✔ |
| `#/classroom` | **redirects to `#/login`** | protected ✔ |
| `#/admin` | **redirects to `#/login`** | admin ✔ |
| `#/teacher-studio` | **redirects to `#/login`** | teacher ✔ |

- Console exceptions: **0** across all tested routes.
- Network responses ≥400: **0** across all tested routes.
- `document.title` is constant (`Francophone Academy — Master French. Elevate Your Future.`) for every route → per-route titles are **not** set (source-derived: `router.js` does not update title).

## Auth guard (browser-verified)

`router.js` checks `route.protected && !Auth.isAuthenticated()` → redirect to `#/login`, and `route.minRole` via `RBAC.hasAtLeast(...)` for teacher/admin routes. Confirmed at runtime for all protected routes.

## Registration / login (source-derived, not submitted at runtime)

- `pages/login.js`, `pages/register.js`, `core/auth.js` (Firebase Auth email + Google).
- `guestOnly` routes (`/login`, `/register`, `/forgot-password`) redirect authenticated users to the dashboard.

## Pricing / checkout (source-derived + browser-verified render)

- `config/pricing.js` is the single price source (General 75,000 / Premium 120,000 / Business 150,000 NGN; quarterly/biannual discounts; referral −15,000 / +10,000).
- `pages/checkout.js` + Paystack inline + `paystackWebhook`; `pages/payment-success.js`, `pages/invoice.js`.

## Course presentation & learning flow (source-derived)

- `pages/courses.js` lists published courses; `pages/course-detail.js` shows syllabus via `getCourseSyllabus`.
- `pages/classroom.js` is the lesson player; lesson content fetched via `getLessonContent` (free/staff/subscriber).
- Progress tracked in `enrollments.progress` (completedLessons, percentComplete).

## Quiz / assessment (source-derived)

- `pages/quiz.js` lists assessments; `pages/quiz-take.js` runs the timer, calls `getQuizForStudent` (no answer keys), then `submitQuizAttempt` (server scoring).
- Passing threshold 80%; certificate auto-generated on `quizAttempts` create.

## Live classes (source-derived)

- `pages/live-classes.js`, `live-class.js`, `live-join.js`; JaaS token via `getJaasToken`; presence in `liveSessions/{id}/participants`; subcollection `liveClasses/{id}/attendees`.

## Certificates (source-derived + browser-verified verify page)

- `pages/verify-cert.js` public verification; certificate PDFs generated server-side with code `FA-{level}-{5 digits}`.

## Teacher / Admin (source-derived; not authenticated at runtime)

- Teacher: `/teacher-studio`, `/teacher/videos`, `/teacher/courses`, `/teacher/students`, `/teacher/programs`, `/teacher/live/*`, AI studios.
- Admin: `/admin`, `/video-studio`.

## Comparison with the local V7 source

The runtime matches the source: same routes, same header navigation, same guards. No runtime-only routes were discovered. No browser-verified functionality contradicts the source.

## Limitations

- Authenticated areas (student/teacher/admin dashboards, classroom, checkout submission, quiz submission) were **not** exercised with a live account in this phase; they are **source-derived**.
- `document.title` per-route and SEO metadata were observed to be static.
