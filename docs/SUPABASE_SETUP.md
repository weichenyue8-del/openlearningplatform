# Supabase setup for OpenAP

OpenAP keeps every public course, lesson, resource, and guest practice flow usable without Supabase. Accounts and cross-device progress become available only after a real Supabase project is configured.

## 1. Create local environment values

Copy `.env.example` to `.env.local` and fill in values from the Supabase project **Connect** dialog:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAP_AUTH_RECOVERY_SECRET=AT_LEAST_32_RANDOM_CHARACTERS
```

Only the URL and publishable key belong in browser-visible settings. `OPENAP_AUTH_RECOVERY_SECRET` is a separate server-only value used to sign a 15-minute, HttpOnly password-recovery marker. Generate a strong random value, keep it stable across app instances, and never prefix it with `NEXT_PUBLIC_`. OpenAP does not require or document a Supabase secret/service-role key.

## 2. Apply the database migration

With the Supabase CLI linked to a disposable development project:

```sh
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migration creates private profiles, enrollments, lesson progress, practice history, bookmarks, preferences, and deletion requests. It also:

- enables Row Level Security on every user-owned table;
- revokes anonymous table access;
- limits signed-in users to their own rows;
- makes practice score tables read-only to clients;
- grades persisted practice attempts inside a security-definer function using private answer rules;
- creates profiles and preferences after a new Auth user is created.

The source-controlled catalog IDs are stored as validated text on purpose. They are not foreign keys to duplicate catalog tables.

## 3. Configure Auth URLs and email

In **Authentication → URL Configuration**:

- set the Site URL to the deployed `NEXT_PUBLIC_SITE_URL`;
- add `http://localhost:3000/auth/callback` for local development;
- add the production `/auth/callback` URL before deployment.

Email/password sign-up uses PKCE. Password recovery returns through `/auth/callback`, establishes a short-lived recovery-only marker, and then opens `/update-password`. An ordinary signed-in session cannot use that recovery action. For production, configure a real SMTP provider; Supabase's trial sender is rate limited.

If custom email templates use token hashes, point them to:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

Use the corresponding `recovery`, `email_change`, or `invite` type for those templates. OpenAP allowlists supported OTP types and never logs tokens or callback codes.

## 4. Run security tests

Start local Supabase, reset the database, then run its database test suite:

```sh
supabase start
supabase db reset
supabase test db
```

`supabase/tests/phase4_rls.sql` creates two disposable users inside a rolled-back transaction and verifies cross-user isolation, direct practice-write denial, authoritative grading, and idempotency.

Application checks:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Without a configured Supabase project, external Auth, migration, SMTP, and RLS execution remain unverified. The UI reports this as setup required rather than simulating a connected account.

## Security notes

- Proxy refreshes cookie sessions and performs an early page redirect, but every protected page, action, API route, and data query verifies the user again.
- Server authorization uses verified claims, never an unvalidated cookie session.
- Redirect targets accept only safe same-origin paths.
- Password changes from Settings require the current password. Email-link recovery additionally requires a short-lived, user-bound marker signed with `OPENAP_AUTH_RECOVERY_SECRET`.
- Account deletion creates a pending request. It does **not** claim the Auth user has been deleted; an authorized operational process must complete that request.
- Guest import is explicit. The server validates catalog IDs, bounds payload size, re-grades answers, deduplicates submissions, and does not trust locally stored correctness.
