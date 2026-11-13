# Security policy

OpenAP handles account and learning-progress data. Please report suspected
vulnerabilities privately and avoid accessing, changing, or retaining anyone
else's data while investigating.

## Reporting a vulnerability

Use the repository's **Security** tab to submit a private vulnerability report
through GitHub Security Advisories. Include:

- the affected route, component, or commit;
- the impact and conditions required to reproduce it;
- minimal reproduction steps or a proof of concept; and
- any suggested mitigation, if known.

Do not open a public issue for an unpatched vulnerability. If private reporting
is not enabled, ask the maintainers for a private reporting channel without
including exploit details in the public request.

Maintainers should acknowledge a complete report as soon as practical, keep the
reporter informed during triage, and coordinate disclosure after a fix is
available. Timelines depend on severity and the availability of maintainers.

## Supported version

Security fixes target the current production branch. Older forks and
deployments are not maintained by this repository.

## Scope and safeguards

- Never send passwords, session cookies, database dumps, private keys, or live
  student data in a report.
- Use test accounts and the smallest non-destructive proof needed.
- Supabase service-role keys are not used by the web application and must never
  be added to client-visible environment variables.
- A report made in good faith should prioritize user safety and give
  maintainers reasonable time to fix the issue before disclosure.
