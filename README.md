# Trial Booking System — Backend

REST API for booking trial science/math classes at Ottodot, built for the Senior Full-Stack Engineer take-home assignment. This repository contains the **NestJS backend implementation** — the runnable application code.

> **Specifications & design decisions** live in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — the single source of truth for product, domain, architecture, and quality documentation. Accessible via MCP GitHub server.

---

## Overview

Ottodot runs live online science and math classes for kids. Parents can book a **trial class** for their child before enrolling, with each class capped at **4 students**. This backend guarantees booking consistency under normal and concurrent user activity, explicitly handling four critical edge cases:

| Edge Case | Scenario                    | Verified By                                                      |
| --------- | --------------------------- | ---------------------------------------------------------------- |
| EC-001    | Duplicate confirmed booking | `test/integration/bookings/ec-001-duplicate-booking.e2e.spec.ts` |
| EC-002    | Overbooking beyond capacity | `test/integration/bookings/ec-002-overbooking.e2e.spec.ts`       |
| EC-003    | Payment failure isolation   | `test/integration/bookings/ec-003-payment-failure.e2e.spec.ts`   |
| EC-004    | Last-seat race condition    | `test/integration/bookings/ec-004-last-seat-race.e2e.spec.ts`    |

---

## Tech Stack

| Layer     | Technology                            |
| --------- | ------------------------------------- |
| Runtime   | Node.js 18+                           |
| Framework | NestJS 10                             |
| Language  | TypeScript 5                          |
| Database  | PostgreSQL 14+                        |
| ORM       | Prisma 5                              |
| API Docs  | Swagger / OpenAPI (`@nestjs/swagger`) |
| Testing   | Jest + Supertest                      |
| Container | Docker + Docker Compose               |

---

## Architecture

### Clean Architecture + Modular Monolith

```
apps/api/          # NestJS entry point
libs/              # Bounded contexts (domain/application/infrastructure/presentation)
  trial-classes/   # Trial class management + roster
  bookings/        # Booking lifecycle
  payments/        # Payment processing (mock)
  parents/         # Parent & student data
  auth/            # Dummy role guard (Parent / Admin)
  database/        # Prisma schema, migrations, seed
  logger/          # Request logging interceptor
  shared/          # Cross-cutting: exceptions, filters, guards
```

**Dependency direction:** `presentation → application → domain ← infrastructure`

See `CLAUDE.md` for the full project structure and `PATTERNS.md` for coding standards.

---

## How to Run

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm

### Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string if not using defaults

# 3. Set up database (migrate + seed)
npm run db:setup

# 4. Start development server
npm run start:dev

# 5. Open Swagger UI
open http://localhost:3000/api/docs
```

### Docker (Local Profile)

```bash
docker compose -f docker/docker-compose.local.yml up -d
# Auto-migrates + seeds on startup
```

### Docker (Development Profile)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/trial_booking \
  docker compose -f docker/docker-compose.dev.yml up -d
# Run seed manually: docker exec trial-booking-api-dev npm run db:seed
```

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api/docs
```

### Endpoints

| Method | Endpoint                            | Description                              |
| ------ | ----------------------------------- | ---------------------------------------- |
| `GET`  | `/api/v1/trial-classes`             | List all trial classes with availability |
| `GET`  | `/api/v1/trial-classes/{id}`        | Trial class detail                       |
| `GET`  | `/api/v1/trial-classes/{id}/roster` | Confirmed participant roster             |
| `POST` | `/api/v1/bookings`                  | Create booking (PENDING_PAYMENT)         |
| `GET`  | `/api/v1/bookings/{id}`             | Booking details                          |
| `POST` | `/api/v1/bookings/{id}/payments`    | Process payment + atomic confirm         |
| `POST` | `/api/v1/bookings/{id}/cancel`      | Cancel booking                           |

See `architecture/api-design.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master) for full API contracts.

---

## Backend Design Highlights

### Domain-Driven Design (DDD Lite)

Each bounded context follows Clean Architecture layers:

- **Domain** — Pure TypeScript: entities, enums, repository interfaces (no framework imports)
- **Application** — Use cases, DTOs, mappers (no HTTP or database imports)
- **Infrastructure** — Prisma repositories, mock payment service
- **Presentation** — NestJS controllers with Swagger decorators

### Atomic Payment + Confirmation

Payment and booking confirmation are **merged into a single atomic operation** (`ProcessPaymentUseCase`). One `POST /bookings/{id}/payments` request handles everything inside `prisma.$transaction()`, eliminating the need for a separate confirm endpoint and guaranteeing `INV-011` (atomic seat allocation).

### Defense-in-Depth

Business invariants are protected at multiple layers:

| Layer       | Mechanism                                                                      |
| ----------- | ------------------------------------------------------------------------------ |
| Application | `ProcessPaymentUseCase` validates all rules inside the transaction             |
| Database    | Partial unique index `(student_id, trial_class_id) WHERE status = 'CONFIRMED'` |
| Database    | `CHECK` constraints on status values                                           |
| Database    | Row-level lock (`SELECT ... FOR UPDATE`) for concurrency                       |

---

## Concurrency — Last-Seat Race (EC-004)

When two parents attempt to claim the final available spot simultaneously, **pessimistic row-level locking** guarantees only one succeeds.

### How It Works

```
Request A's transaction              Request B's transaction
       │                                    │
       ▼                                    ▼
  SELECT ... FOR UPDATE               SELECT ... FOR UPDATE
  (acquires lock)                     (WAITS — lock held by A)
       │                                    │
       ▼                                    │
  Count CONFIRMED = 3                 (blocked)
  → 1 spot available                        │
       │                                    │
       ▼                                    │
  Confirm booking                     (blocked)
  status → CONFIRMED                        │
       │                                    │
       ▼                                    ▼
  COMMIT (lock released)              SELECT ... FOR UPDATE
                                      (acquires lock — now sees 4 CONFIRMED)
                                             │
                                             ▼
                                      Count CONFIRMED = 4
                                      → CapacityExceededException
                                             │
                                             ▼
                                      ROLLBACK
```

The lock is held from validation through commit, making the entire check-and-confirm sequence atomic. See `architecture/concurrency-strategy.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master) for the full design.

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test:cov

# Run specific test
npm test -- test/integration/bookings/ec-004-last-seat-race
```

### Test Coverage

| Layer       | Tests                                                           |
| ----------- | --------------------------------------------------------------- |
| Unit        | `test/unit/bookings/`                                           |
| Integration | `test/integration/trial-classes/`, `test/integration/bookings/` |
| Edge Cases  | `ec-001` through `ec-004` in `test/integration/bookings/`       |

The EC-004 test uses `Promise.allSettled` to simulate concurrent payment requests, asserting exactly one succeeds and the other receives a `CAPACITY_EXCEEDED` error.

---

## Useful Commands

| Command                   | Purpose                         |
| ------------------------- | ------------------------------- |
| `npm run start:dev`       | Start with hot reload           |
| `npm test`                | Run all tests                   |
| `npm run lint`            | Lint code                       |
| `npm run format`          | Format code                     |
| `npm run type-check`      | TypeScript check                |
| `npm run db:setup`        | Setup database (migrate + seed) |
| `npm run db:reset`        | Reset database                  |
| `npm run db:studio`       | Open Prisma Studio              |
| `npm run prisma:generate` | Regenerate Prisma client        |

---

## Project Structure

See `CLAUDE.md` for the full directory structure, architecture details, development workflow, and troubleshooting.

See `PATTERNS.md` for coding standards: transaction patterns, error handling, DTO conventions, testing patterns, and naming conventions.

---

## Time Spent

| Phase                                     | Hours        |
| ----------------------------------------- | ------------ |
| Specification review (context repo)       | _            |
| Project scaffolding + config              | _            |
| Database (schema + seed)                  | _            |
| Bounded contexts (4 modules)              | _            |
| Concurrency implementation                | _            |
| Testing (unit + integration + edge cases) | _            |
| Docker + deployment                       | _            |
| Review + fixes                            | _            |
| **Total**                                 | **\_ hours** |

---

## AI Usage

See [`AI_USAGE.md`](AI_USAGE.md) for the full AI usage disclosure covering the implementation phase of this repository.

---

## References

- [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — Product, domain, architecture, and quality specs
- `CLAUDE.md` — Operating rules and project conventions
- `AGENTS.md` — Agent coordination for AI-assisted development
- `PATTERNS.md` — Coding standards and patterns
- `AI_USAGE.md` — AI usage disclosure (implementation phase)
