# OpenAP implementation plan

The project is intentionally divided into testable phases. A phase is complete
only when its acceptance checks pass; future capabilities are not represented as
working before implementation.

## Phase 1 — Project setup (complete)

### Scope

- Initialize a Next.js App Router application with strict TypeScript.
- Configure Tailwind CSS, ESLint, type checking, Vitest, and a production build.
- Install the libraries selected for authentication, content, formulas, charts,
  icons, and validation.
- Add environment placeholders without fabricated URLs or secrets.
- Provide a small, branded setup screen so the root route is recognizable and
  can be verified before homepage work begins.

### Acceptance checks

- Dependencies install with a reproducible lockfile.
- Linting, type checking, automated tests, and the production build pass.
- The root route renders without external credentials.

## Phase 2 — Real public learning website (complete)

- Define light and dark design tokens, typography, spacing, focus states, and
  responsive breakpoints.
- Build reusable buttons, cards, badges, forms, navigation, mobile navigation,
  loading states, empty states, and error states.
- Add the shared application shell and system-aware light/dark themes.
- Verify keyboard navigation, contrast, reduced motion, and responsive behavior.
- Replace the setup screen with the complete homepage.
- Build `/courses` with the nine requested AP subjects, search, subject filters,
  availability states, and honest lesson availability.
- Keep GitHub and contact links disabled or hidden until configured.
- Add tested course catalog queries backed initially by versioned content data.
- Add typed course, unit, and lesson content models.
- Build course overview and three-column lesson routes with accessible mobile
  navigation.
- Add KaTeX formulas, objectives, worked examples, Java code highlighting,
  related lessons, and table-of-contents navigation.
- Publish six original introductory lessons across AP Calculus BC and AP
  Computer Science A.
- Derive every availability label and lesson count from the central catalog.

## Phase 3 — Practice system (complete)

- Add course/topic selection, multiple-choice questions, numerical questions,
  configurable tolerance, immediate post-submission feedback, explanations, and
  a results review.
- Evaluate answers through shared, server-authoritative business logic.
- Seed a small reviewed set of original questions and test edge cases.

## Phase 3.5 — Learning resources (complete)

- Publish a verified, searchable resource catalog with explicit attribution.
- Embed only verified YouTube videos and keep playback opt-in.
- Support browser-local bookmarks and lesson-specific recommendations.

## Phase 4 — Database, authentication, and dashboard (implemented; external setup pending)

- Create Supabase browser/server clients and email sign-up, sign-in, sign-out,
  reset-password, callback, and protected-route flows.
- Add versioned PostgreSQL migrations for profiles, enrollments, lesson
  progress, sessions, attempts, bookmarks, preferences, and deletion requests.
- Enable Row Level Security, ownership policies, constraints, indexes, timestamps,
  server-side input validation, a private grading boundary, and idempotent
  practice submissions.
- Add enrollment, lesson completion, resume learning, persistent practice
  history, mistake review, resource synchronization, profile, and settings.
- Add a real-data dashboard with Recharts, explicit empty states, observed
  accuracy, and clearly labeled mastery estimates.
- Keep public learning available without an account and require confirmation
  before importing validated browser progress.

The local application checks pass without credentials. Auth email delivery,
migration execution, and cross-user RLS tests remain pending until a Supabase
development project is connected; the product reports that setup state
honestly.

## Phase 5 — Documentation, testing, and deployment

- Add integration coverage for answer evaluation, tolerance, progress,
  protected routes, and authorization.
- Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, the MIT software
  `LICENSE`, and a separate educational-content licensing policy.
- Document lesson/question authoring, database setup, local development,
  Supabase configuration, Vercel deployment, and maintenance workflows.
- Complete final accessibility, responsive, error-state, and production checks.

## Deferred by design

- AI tutoring is outside the MVP.
- Official repository and contact URLs remain unset until supplied.
- No course counts, completion percentages, questions, or lessons are fabricated.
- Production deployment is not claimed until Supabase Auth URLs, SMTP, the
  migration, database tests, legal policies, and the hosting environment are
  configured and verified.
