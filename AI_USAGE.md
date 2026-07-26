# AI_USAGE.md — Backend Implementation

## Purpose

This document discloses how AI was used during the **backend implementation phase** of the Trial Booking System. It covers work done in this repository (`trial-booking-system-backend`) — the runnable NestJS + Prisma application code.

The companion `AI_USAGE.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) covers the **specification phase** (product, domain, architecture, quality, deployment, design documentation). This document covers what happened once those specs were written and code started being produced.

---

## Which AI Tools I Used

- **GitHub Copilot (VS Code)** — inline code generation, auto-completion, and refactoring assistance directly in the editor. Used throughout the entire implementation: scaffolding, NestJS modules, use cases, repositories, DTOs, tests, and Docker configuration.
- **Claude Code (via VS Code Chat)** — task planning, multi-agent orchestration (Planner → Backend → Reviewer), batch refactoring (e.g., merging payment + confirm into one atomic operation), and final consistency audits against the context repo.
- **Claude Code Sub-agents** — defined in `.claude/agents/` (Planner, Backend, Tester, Reviewer, Documentation, DevOps). Agent roles guided every phase: Planner broke down the context repo into 64 ordered tasks across 12 phases; Backend implemented each phase; Reviewer cross-checked every change against specs.

No external code generation services (ChatGPT API, Copilot Workspace, etc.) were used beyond what's listed above.

---

## What I Used AI For

- **Project scaffolding** — Generating the full NestJS monorepo structure (package.json, tsconfig, nest-cli.json, ESLint, Prettier, path aliases) matching the Clean Architecture + Modular Monolith pattern defined in `PATTERNS.md`.
- **Code generation** — All 5 bounded contexts (trial-classes, bookings, payments, parents, auth) were generated layer by layer: domain entities → repository interfaces → Prisma implementations → use cases → controllers → Swagger decorators.
- **Concurrency implementation** — The `ProcessPaymentUseCase` with `SELECT ... FOR UPDATE` pessimistic locking was generated from the pattern defined in `PATTERNS.md` and verified against `architecture/concurrency-strategy.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master).
- **Test generation** — 7 integration tests, 3 unit tests, and 4 edge-case tests (EC-001 through EC-004) were generated from the acceptance test matrix and edge case verification docs.
- **Review & audit** — The Reviewer Agent performed two full cross-checks (first: 13 discrepancies found, all fixed; second: 1 remaining comparison bug in `MockPaymentService`).
- **Docker configuration** — 2-profile Docker Compose setup (local + development) generated per `deployment-strategy.md`.
- **Documentation** — This file, `README.md`, `CLAUDE.md`, `AGENTS.md`, `PATTERNS.md`, and 6 sub-agent `.md` files were co-written with AI assistance.

---

## One Place Where AI Helped Me Move Faster

**Bulk refactoring across 30+ files.** When the Reviewer Agent discovered that payment processing and booking confirmation needed to be a single atomic operation (per the updated `transaction-strategy.md`), the merge required touching enum values, schema comments, migration SQL, seed data, 2 use cases (merge + delete), 2 controllers, DTOs, modules, indexes, and 7 test files — all while keeping every status value consistent (`PendingPayment` → `PENDING_PAYMENT`). AI handled the mechanical "find every occurrence and replace" parts through a combination of `sed` batch replacements and targeted `replace_string_in_file` edits, while validating that the business logic (FOR UPDATE inside $transaction with all re-checks) was correctly preserved in the merged `ProcessPaymentUseCase`. Doing this manually across 30+ files would have been the single most error-prone and time-consuming part of the implementation within a take-home time budget.

---

## One Place Where I Disagreed With, Corrected, or Rejected AI Output

**The initial `ProcessPaymentUseCase` contained a comparison bug.** After the enum values were changed to `UPPER_SNAKE_CASE`, the `MockPaymentService` still compared `overrideStatus === 'Failed'` (old PascalCase), while the DTO was sending `'failed'` (new lowercase). This meant the `EC-003` (payment failure) test would silently pass with a `SUCCESS` result because the comparison never matched — a false positive that could have shipped to production. The Reviewer Agent caught this during the second audit pass. I rejected the AI's initial output and corrected the comparison to `overrideStatus === 'failed'`, then re-verified the edge case logic end-to-end.

A second, broader example: the initial implementation split payment recording and booking confirmation into **two separate endpoints** (`POST /bookings/{id}/payments` and `POST /bookings/{id}/confirm`), which was valid at the time of initial scaffolding but became incorrect after the context repo's `transaction-strategy.md` was updated to require a single atomic operation. The Reviewer cross-check caught this architectural mismatch (Discrepancy #1 in the first review report), and the Backend Agent then merged both into the single `ProcessPaymentUseCase`. This was a matter of the AI following an earlier version of the spec rather than the latest one — I corrected it by always running Reviewer against the current context repo state before finalizing any phase.

---

## What I Would Change About My AI Workflow If I Did This Again

1. **Review after every bounded context, not at the end.** The first review pass happened after all 4 bounded contexts were fully built, which unearthed 13 discrepancies — all of which could have been caught earlier if each context was reviewed against the spec immediately after implementation. Fixing them required touching nearly every file. Next time: implement → review → fix per module, not per project.
2. **Verify spec version before generating code.** The payment/confirm split issue happened because the context repo was updated mid-implementation. Next time: explicitly diff the context repo before starting any implementation phase to catch spec changes early.
3. **Test concurrent logic independently before integration tests.** The EC-004 last-seat race test relies on real PostgreSQL locking via `Promise.allSettled`. While it works, debugging transaction deadlocks through an integration test layer adds friction. Next time: write a standalone concurrency test script first, then wrap it in the Jest + Supertest framework.

---

## How I Verified the Final Implementation

- **Reviewer Agent (2 passes)** — First pass: 13 discrepancies found between context repo specs and code (split payment/confirm, missing transactions, wrong status values, wrong response shapes). Second pass: 1 remaining bug (MockPaymentService comparison). All fixed.
- **Edge case tests** — EC-001 (duplicate booking), EC-002 (overbooking), EC-003 (payment failure), and EC-004 (last-seat race) pass with strict assertions including concurrent `Promise.allSettled` verification.
- **Integration tests** — All 7 test scenarios (TS-001 through TS-007) verified against seed data.
- **Unit tests** — Key business logic independently verified with mocked Prisma + IBookingRepository.
- **Terminology audit** — All entity names, enum values, DTO fields, and API response shapes checked against `discovery/glossary.md`.
- **Scope audit** — No out-of-scope features found (no JWT, no real payment gateway, no notifications).

---

## What AI Did Not Do

- **Write the original specs** — All business rules (BR-001 through BR-015), domain invariants (INV-001 through INV-011), API contracts, database design, and concurrency strategy were authored by the human, documented in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master), and treated as immutable during implementation.
- **Make architecture decisions** — Clean Architecture, bounded contexts, repository pattern, and pessimistic locking were pre-decided and codified in `CLAUDE.md`, `PATTERNS.md`, and the context repo's ADRs.
- **Decide what to implement** — The Planner Agent (an AI tool) broke down specs into tasks, but every task derived directly from existing context repo documents. No features were invented.
- **Bypass the review process** — Every implementation phase was followed by a Reviewer Agent pass. Discrepancies were flagged, not silently accepted.
- **Write `README.md` or `AI_USAGE.md` without human direction** — These files were generated under explicit instructions (contents specified by the human author, AI drafted based on those instructions).

---

## Disclosure Summary

- **Built by:** GitHub Copilot (VS Code) + Claude Code, under continuous human direction.
- **Directed by:** [Your Name] — made all scope, domain, and architecture decisions; AI executed implementation, testing, and review based on those decisions.
- **Architecture from:** [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master) (specs) + `CLAUDE.md` / `PATTERNS.md` (repo conventions).
- **Verification:** 2 full review passes against context repo specs; 4 edge-case integration tests passing; all business invariants enforced at application and database layers.
- **Specs vs. code gap:** Zero known discrepancies remaining after final review pass.

---

## References

- `AI_USAGE.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master) — AI usage disclosure for the specification phase
- `README.md` in context repo — Context repo overview
- `CLAUDE.md` — Operating rules for this repo
- `AGENTS.md` — Agent roles and workflow
- `.claude/agents/` — Sub-agent definitions (Planner, Backend, Tester, Reviewer, Documentation, DevOps)
- `README.md` — Submission README (this repo)
