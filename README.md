# OpenAP

OpenAP is a free, open-source learning platform built by students, for students.
Its mission is to make high-quality education free, accessible, and personalized
for everyone.

The repository contains a public learning experience plus an optional private
student account layer: a searchable course library, six reviewed lessons, a
40-question practice system, a verified resource library, Supabase
authentication, synchronized progress, and a data-backed student dashboard.

## Technology foundation

- Next.js App Router, React, and TypeScript
- Tailwind CSS and Lucide icons
- Supabase SSR authentication, PostgreSQL migrations, and Row Level Security
- KaTeX for formulas and Recharts for accessible learning analytics
- ESLint, TypeScript, Vitest, and Testing Library checks

## Available learning content

- **AP Calculus BC:** Limits and Continuity, Introduction to Derivatives, and
  Basic Integration, with KaTeX formulas and worked examples.
- **AP Computer Science A:** Java Variables and Data Types, Conditional
  Statements, and Loops, with syntax-highlighted Java examples.

The remaining seven catalog courses are marked **Coming Soon**. OpenAP derives
availability from real lesson records and does not publish fabricated counts.

## Local development

### Prerequisites

- Node.js 20.9 or newer
- pnpm 10 or newer

### Setup

1. Install dependencies: `pnpm install`
2. Copy `.env.example` to `.env.local`.
3. Public learning works with blank Supabase values. To enable accounts, add a
   development Supabase URL and publishable key, then apply the migration in
   `supabase/migrations`.
4. Start the app: `pnpm dev`
5. Open `http://localhost:3000`.

## Validation

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Main routes

- `/` — official homepage
- `/courses` — live search and category filtering
- `/courses/[courseSlug]` — course overview and units
- `/courses/[courseSlug]/[lessonSlug]` — responsive lesson reader
- `/practice` and `/resources` — public practice and verified learning resources
- `/login`, `/signup`, `/forgot-password` — account entry and recovery
- `/dashboard`, `/my-learning`, `/my-mistakes` — protected, stored learning data
- `/profile`, `/settings` — private profile and account preferences

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for completed work and
the remaining roadmap.

## Contributing and security

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before
opening a pull request and follow the [community code of conduct](./CODE_OF_CONDUCT.md).
Please report vulnerabilities privately as described in [SECURITY.md](./SECURITY.md),
not in a public issue.

## Configuration

OpenAP does not invent repository or contact destinations. Configure them with:

- `NEXT_PUBLIC_GITHUB_REPOSITORY_URL`
- `NEXT_PUBLIC_CONTACT_URL`

Supabase values are required only for account features:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `OPENAP_AUTH_RECOVERY_SECRET` (server-only; 32+ random characters)

No Supabase secret/service-role key is used by the web application. Authoritative
practice persistence is handled by a database function that re-grades answers
from private rules. See [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) for
Auth URLs, migrations, RLS tests, and the exact local setup.

When Supabase is not configured, all public courses, lessons, practice, and
resources continue to work with browser-local progress. Account forms show a
setup-required state instead of simulating a connection.

## Deployment

OpenAP uses standard Next.js conventions and can be imported directly from
GitHub into Vercel. The complete production checklist, environment scopes,
automatic deployment setup, Supabase Auth URLs, and post-deployment checks are
documented in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## License

The software is released under the [MIT License](./LICENSE). Contributors must
also confirm that educational material has compatible publication rights; do
not assume third-party course content is covered by the software license.
