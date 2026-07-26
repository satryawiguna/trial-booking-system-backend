# AGENTS.md — Agent Coordination for Backend Work

This file coordinates which AI agent roles are responsible for which parts of the Trial Booking System backend.

**Read this first:** `AGENTS.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — The master agent catalog. Access via MCP GitHub server (`github_repo` / `github_text_search` with repo `satryawiguna/trial-booking-system-context`).

---

## Your Role

You are the **Backend Agent** in the larger project. Your responsibility:

- **Read:** All specs in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — `architecture/`, `domain/`, `quality/`
- **Produce:** NestJS implementation using Prisma + PostgreSQL
- **Coordinate with:** Frontend Agent (via shared API contracts in `architecture/api-design.md`)
- **Verify against:** Quality Agent (edge case tests in `quality/edge-case-verification.md`)
- **Report to:** Reviewer Agent (final consistency check)

---

## What Backend Owns

| Responsibility | Owns                         | Reads                                  |
| -------------- | ---------------------------- | -------------------------------------- |
| API endpoints  | `src/modules/*/controllers/` | `architecture/api-design.md`           |
| Business logic | `src/modules/*/services/`    | `domain/business-rule.md`              |
| Data model     | `prisma/schema.prisma`       | `architecture/database-design.md`      |
| Concurrency    | Transaction + locking        | `architecture/concurrency-strategy.md` |
| Tests          | Unit + integration tests     | `quality/acceptance-test-matrix.md`    |

---

## What Backend Does NOT Own

- **Frontend/UI** — Frontend Agent's responsibility
- **Specs/Product Decisions** — Context Repo (Product/Domain Agents)
- **Test Scenarios** — Quality Agent writes specs; Backend implements them
- **Deployment/Infrastructure** — DevOps Agent's responsibility

---

## Typical Workflow for a New Backend Feature

```
1. Product Agent → Updates `product/` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master)
2. Domain Agent → Updates `domain/` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master)
3. Architect → Updates `architecture/` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master)
4. Backend Agent (you) → Implements in this repo
   - Create Prisma schema changes
   - Write controllers, services, DTOs
   - Write tests per quality spec
5. Frontend Agent → Consumes your API
6. Quality Agent → Verifies edge cases
7. Reviewer Agent → Final consistency check
```

---

## Before You Start Any Feature

**Always check:**

1. ✅ **Is it in scope?** — Check `discovery/project-scope.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master)
2. ✅ **Is the spec complete?** — Check the relevant context repo document (e.g., `architecture/api-design.md`)
3. ✅ **Do you have the ID?** — e.g., `BR-005` (duplicate booking check), `US-001` (parent books trial)
4. ✅ **Are you implementing or inventing?** — If it's not in the spec, ask before building it
5. ✅ **Database schema ready?** — Check `architecture/database-design.md` for expected schema

---

## Communication with Other Agents

### With Frontend Agent

- **API Contract:** Both read `architecture/api-design.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master) and keep it as source of truth
- **If you change an endpoint:** Update the spec, then notify Frontend Agent
- **If Frontend needs a different endpoint:** Discuss with Architect first, then both implement

### With Quality Agent

- **Test Scenarios:** Quality writes `quality/edge-case-verification.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master); you implement tests to match
- **Edge Cases:** If you discover an edge case not in the spec, flag it to Quality Agent

### With Reviewer Agent

- **Final Check:** Before marking feature complete, Reviewer checks:
  - All IDs are traced end-to-end
  - No scope creep
  - Terminology is consistent (see `glossary.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) master)
  - Database/API specs match implementation

---

## What Backend Repo Owns — All Technical Roles

| Agent             | Responsibility                                             | File                              |
| ----------------- | ---------------------------------------------------------- | --------------------------------- |
| **Planner**       | Baca specs → breakdown task implementasi                   | `.claude/agents/planner.md`       |
| **Backend**       | Implementasi NestJS code (controllers, services, Prisma)   | `.claude/agents/backend.md`       |
| **Tester**        | Unit, integration, edge-case (EC-001 s/d EC-004) tests     | `.claude/agents/tester.md`        |
| **Reviewer**      | Final consistency check — traceability, terminology, scope | `.claude/agents/reviewer.md`      |
| **Documentation** | Swagger/OpenAPI docs sinkron dengan kode                   | `.claude/agents/documentation.md` |
| **DevOps**        | Docker, deployment, environment, seed data                 | `.claude/agents/devops.md`        |

## Typical Workflow

```
Prompt Masuk
    ↓
1. Planner → Baca context repo + PATTERNS.md → Task list
    ↓
2. Backend → Implementasi kode per task
    ↓
3. Tester → Tulis & jalankan tests (unit, integration, edge case)
    ↓
4. Documentation → Verifikasi & update Swagger docs
    ↓
5. Reviewer → Final consistency check
```

---

## Reference

- [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — Master catalog & all specs. Access via MCP GitHub server tools (`github_repo` / `github_text_search`).
- `.claude/agents/backend.md` — Detailed backend agent role (responsibilities, never do, handoff)
- `CLAUDE.md` — This repo's operating rules
- `PATTERNS.md` — Coding standards & patterns
