# OpenAP practice system

Phase 3 keeps question content, grading, sessions, analytics, recommendations, and UI in separate modules.

## Answer-security boundary

- Private question modules contain grading rules, numerical tolerances, correct-answer displays, explanations, and per-option feedback. They import `server-only` and are never imported by a Client Component.
- Pages pass an explicit `PublicPracticeQuestion` allowlist to the browser. It contains the prompt, options, course metadata, and difficulty, but no grading or explanation fields.
- `POST /api/practice/evaluate` validates the request, finds the private question, runs the deterministic evaluator, and returns correctness plus the explanation only after an answer is submitted. Responses use `Cache-Control: no-store`.
- The endpoint remains available to guests because anonymous students need immediate feedback. It prevents passive answer leakage, not deliberate repeated querying.
- Signed-in submissions include a UUID session ID, UUID submission ID, course ID, and frozen question list. The route never accepts a user ID, correctness value, aggregate, or trusted timestamp from the browser.
- Persistence goes through `record_practice_attempt`, a database function that reads private grading rules, derives the caller from `auth.uid()`, validates session ownership and the frozen question list, re-grades the submitted answer, and updates counters atomically. Authenticated clients have read-only access to the score-bearing tables, so bypassing the Next.js route cannot forge accuracy.

## Local session data

Anonymous sessions use the versioned key `openap.practice.sessions.v1`. A session stores a cryptographically generated browser ID, a fixed ordered list of question IDs, submitted attempts, returned feedback, timestamps, filters, and an optional validated internal lesson-return path. The storage parser rejects corrupt or unknown-version data. No names, email addresses, or other personal information are stored.

Browser storage remains the guest fallback and also protects a completed answer if cloud synchronization is temporarily unavailable. Signed-in practice history is additionally stored in PostgreSQL; a synchronization failure is surfaced without discarding the local result.

## Recommendation heuristic

Recommendations are study suggestions, not validated mastery estimates. Each candidate question receives a deterministic need score:

| Signal | Weight | Meaning |
| --- | ---: | --- |
| Recent topic error rate | 55% | Prioritize topics with more recent wrong answers. |
| Limited evidence | 20% | Continue exploring topics with few attempts. |
| Previously missed question | 20% | Make useful retries more likely. |
| Question difficulty | 5% | Slightly prefer more challenging work when other signals are similar. |

Only the 40 most recent local attempts are considered. An unattempted topic starts with a neutral 50% error estimate. Scores use stable question IDs to break ties, so identical history always produces the same ordering.

## Question-bank migration shape

Every private question has stable course, unit, topic, difficulty, type, content, grading, answer-display, and explanation fields. The source-controlled question bank remains the teaching-content authority. A private database table mirrors only the grading rules required for tamper-resistant persistence; no client role can read it. Stable IDs must be preserved so historical attempts remain meaningful.
