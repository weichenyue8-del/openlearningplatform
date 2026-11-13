# Contributing to OpenAP

Thank you for helping make high-quality learning materials more accessible.
OpenAP welcomes focused bug fixes, accessibility improvements, documentation,
tests, and carefully reviewed educational content.

## Before you start

- Search existing issues and pull requests to avoid duplicate work.
- Open an issue before a large feature, database change, or new course so the
  approach and review requirements can be agreed first.
- Never include student data, passwords, API secrets, private environment
  files, answer keys in client code, or Supabase service-role credentials.
- Only contribute material you have the right to license and publish. Cite
  sources for factual claims and do not copy copyrighted course material.

## Local setup

1. Install Node.js 20.9 or newer and enable Corepack.
2. Install dependencies with `pnpm install --frozen-lockfile`.
3. Copy `.env.example` to `.env.local`. Public learning pages work with blank
   Supabase values; follow `docs/SUPABASE_SETUP.md` to test account features.
4. Start the app with `pnpm dev` and open `http://localhost:3000`.

## Quality checks

Run the complete local check before opening a pull request:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Changes to database authorization should also pass the pgTAP suite described
in `docs/SUPABASE_SETUP.md`. Changes to public routes should include focused
regression tests and a manual check at mobile and desktop sizes.

## Pull requests

- Keep each pull request limited to one coherent change.
- Explain the user-facing result, testing performed, and any deployment or
  migration steps.
- Update documentation and `.env.example` when configuration changes.
- Preserve accessible labels, keyboard behavior, and honest content states.
- Expect review before merge. A passing automated check is required but does
  not replace educational, accessibility, or security review.

By submitting a contribution, you agree that your software contribution may
be distributed under the repository's MIT License. Educational content must
also have clearly documented provenance and compatible publication rights.
