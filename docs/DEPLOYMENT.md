# Production deployment

OpenAP follows the standard Next.js deployment path on Vercel. No custom
`vercel.json` is required. These steps publish the public learning experience;
Supabase must be configured separately before account features can work.

## 1. Verify the source

From a clean checkout, use the pinned package manager and run every check:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Review the files about to be committed. Do not commit `.env.local`, `.vercel`,
build output, logs, database exports, student data, or credentials. If a secret
has ever entered Git history, remove it from history and rotate it at the
provider before publishing; deleting the current file is not enough.

## 2. Publish to GitHub

1. Create a public GitHub repository without generated starter files.
2. Add it as the local repository's `origin` remote.
3. Push the verified `main` branch.
4. In the repository settings, enable private vulnerability reporting and add
   branch protection that requires the **OpenAP checks** workflow.

Do not place production environment values in GitHub source, workflow files, or
issues. Vercel stores runtime values separately.

## 3. Create the Vercel project

1. In Vercel, choose **Add New → Project** and import the GitHub repository.
2. Keep the detected **Next.js** framework preset and default build settings.
3. Keep the project root at the repository root.
4. Add the environment values below before the first production deployment.
5. Deploy the `main` branch to Production.

Importing through the Git integration enables a Production deployment for each
future push to the configured production branch and Preview deployments for
other branches and pull requests. Confirm in **Project Settings → Git** that
`main` is the production branch. Public releases should not have Vercel
Deployment Protection enabled for the Production environment.

## 4. Environment values

Set these in **Project Settings → Environment Variables**. Values used by the
browser are intentionally public; never put a database password, Supabase
secret/service-role key, or private API token in a `NEXT_PUBLIC_` variable.

| Name | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production and Preview | For accounts | Supabase project origin |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production and Preview | For accounts | Browser-safe publishable key |
| `NEXT_PUBLIC_SITE_URL` | Production | Yes | Stable public HTTPS origin, with no path |
| `OPENAP_AUTH_RECOVERY_SECRET` | Production and Preview | For accounts | Server-only random value of at least 32 characters |
| `NEXT_PUBLIC_GITHUB_REPOSITORY_URL` | Production and Preview | Optional | Public source repository link |
| `NEXT_PUBLIC_CONTACT_URL` | Production and Preview | Optional | Public support or community link |

Generate the recovery secret locally with a cryptographically secure tool, for
example `openssl rand -hex 32`, and paste it directly into Vercel. Keep it out
of shell history, screenshots, logs, and source control. Use a separate value
for unrelated environments.

After the first deployment establishes the final `.vercel.app` hostname, set
`NEXT_PUBLIC_SITE_URL` to that exact `https://` origin and redeploy Production.

## 5. Configure Supabase production

1. Create or select the production Supabase project.
2. Apply the source-controlled migration in `supabase/migrations`.
3. Run `supabase/tests/phase4_rls.sql` against a disposable or local database as
   described in `SUPABASE_SETUP.md`.
4. In **Authentication → URL Configuration**, set the Site URL to the exact
   `NEXT_PUBLIC_SITE_URL` origin.
5. Add the production `/auth/callback` URL to the redirect allow list. Add only
   preview URLs that are intentionally used for authentication.
6. Configure a production SMTP provider and review confirmation and recovery
   email templates.
7. Confirm Row Level Security remains enabled on every user-owned table. Never
   expose a service-role key to this application.

Changing an environment value does not alter an existing deployment. Trigger a
new Production deployment after any environment update.

## 6. Production verification

Verify the deployed HTTPS URL in a signed-out browser and check at least:

- `/`, `/courses`, one available course, and one lesson;
- `/practice`, `/resources`, and the legal pages;
- an unknown course returns the not-found page;
- no route requires Vercel login or leaks a stack trace;
- security headers are present and the browser console is clean; and
- signup, email confirmation, login, password recovery, stored progress, and
  sign-out work once Supabase and SMTP are configured.

Keep the previous production deployment available for rollback until this smoke
test is complete.
