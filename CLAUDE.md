# CLAUDE.md — Trial Booking System Backend

This file provides guidance to Claude Code (claude.ai/code) when working on the **backend implementation** of the Trial Booking System.

---

## Project Overview

**Project Name:** Trial Booking System Backend  
**Purpose:** REST API for booking trial science/math classes, with explicit handling of edge cases: duplicate bookings, overbooking, payment failure, and last-seat race conditions.  
**Tech Stack:** NestJS, PostgreSQL, Prisma ORM, TypeScript  
**Source of Truth:** [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — Read CLAUDE.md and AGENTS.md there first. Access via MCP GitHub server (`github_repo` / `github_text_search` with repo `satryawiguna/trial-booking-system-context`).

---

## Core Responsibility

You are implementing the **Backend Agent** role (see `agents/backend.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) master). Your focus:

- ✅ Implement NestJS API endpoints per `architecture/api-design.md`
- ✅ Build Prisma schema and migrations per `architecture/database-design.md`
- ✅ Implement business logic per `domain/business-rule.md`
- ✅ Handle concurrency (pessimistic locking) per `architecture/concurrency-strategy.md`
- ✅ Write tests per `quality/acceptance-test-matrix.md` and `quality/edge-case-verification.md`
- ✅ Follow coding patterns in `PATTERNS.md` at all times
- ✅ Document all endpoints with Swagger decorators (`@nestjs/swagger`)
- ❌ Don't create new feature specs — those live in context repo
- ❌ Don't change database or API contracts without checking context repo first

---

## Project Structure (Clean Architecture + Modular Monolith)

```
trial-booking-system-backend/
├── .claude/agents/          # Sub-agents: planner, backend, tester, reviewer, documentation, devops
├── .vscode/mcp.json         # MCP Server GitHub
├── apps/api/                # NestJS entry point (main.ts, app.module.ts)
├── libs/
│   ├── trial-classes/       # Bounded context: domain/application/infrastructure/presentation
│   ├── bookings/            # Bounded context
│   ├── payments/            # Bounded context
│   ├── parents/             # Bounded context (Parent & Student)
│   ├── auth/                # Dummy auth guard (role from header: Parent/Admin)
│   ├── database/            # Prisma client, schema, migrations, seed
│   ├── logger/              # Request logging interceptor
│   └── shared/              # Cross-cutting: filters, guards, pipes, exceptions, constants
├── test/
│   ├── integration/         # Endpoint tests with test database
│   ├── unit/                # Isolated service/use-case tests
│   └── fixtures/            # Test data factories
├── docker/                  # Dockerfile + docker-compose.yml
├── CLAUDE.md                # This file
├── AGENTS.md                # Agent coordination
└── PATTERNS.md              # Coding standards & patterns
```

### Layer Architecture per Bounded Context

```
libs/{context}/
├── domain/              # Pure TS: entities, enums, repository interfaces
├── application/         # Use cases, DTOs, mappers (no HTTP/DB imports)
├── infrastructure/      # Prisma repositories, external service adapters
├── presentation/        # Controllers + Swagger DTOs
├── {context}.module.ts
└── index.ts
```

**Dependency direction:** `presentation → application → domain ← infrastructure`

> **Important:** Domain layer MUST NOT import from NestJS, Prisma, or any infrastructure concern.

---

## Development Commands

### Setup

```bash
# Install dependencies
npm install

# Setup database (create, migrate, seed)
npm run db:setup

# Generate Prisma client
npm run prisma:generate
```

### Running the Application

```bash
# Start development server (with watch)
npm run start:dev

# Start production build
npm run build
npm run start:prod

# Dev server (no watch)
npm run start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run a specific test file
npm test -- src/path/to/test.spec.ts

# Run tests with coverage
npm test:cov
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking (via TypeScript)
npm run type-check
```

### Database

```bash
# Run pending migrations
npm run db:migrate

# Generate migration after schema change
npm run db:migration -- add <migration_name>

# Seed database with test data
npm run db:seed

# Reset database (development only)
npm run db:reset

# Open Prisma Studio (interactive DB browser)
npm run db:studio
```

---

## Architecture & Structure

### High-Level Architecture

```
HTTP Request
    ↓
Controllers (routing, input validation)
    ↓
Services (business logic, transactions)
    ↓
Prisma ORM (data access, schema enforcement)
    ↓
PostgreSQL (persistence, constraints, locking)
```

**Key Pattern:** Unit of Work pattern with pessimistic locking for concurrency control. When confirming a booking for the last seat, acquire a row lock on the Trial Class before checking capacity.

### Directory Structure

```
src/
├── modules/
│   ├── trial-classes/      # Trial class CRUD and roster
│   ├── bookings/           # Booking lifecycle (pending → confirmed/failed)
│   ├── payments/           # Payment attempt recording and processing
│   ├── parents/            # Parent and student data
│   └── common/             # Shared services, guards, interceptors, filters
├── prisma/
│   ├── schema.prisma       # Prisma schema (entities, relationships, constraints)
│   └── migrations/         # Database migrations
├── config/                 # Environment config and constants
├── main.ts                 # App bootstrap
└── app.module.ts           # Root module
```

### Key Modules

- **trial-classes** — List classes, check availability, get roster (confirmed bookings only)
- **bookings** — Create booking (pending), confirm after payment, cancel
- **payments** — Record payment attempt (success/failure), trigger booking confirmation
- **parents** — Student and parent data (no CRUD exposed — seeded only)
- **auth** — Dummy auth guard (role-based: Parent/Admin from header)
- **database** — Prisma client, schema, migrations, seed
- **logger** — Request logging interceptor (method, URL, status, duration)
- **shared** — Cross-cutting: exception filters, guards, pipes, interceptors

### Core Dependencies

- **@nestjs/core** — Framework core
- **@prisma/client** — ORM for type-safe data access
- **@nestjs/config** — Environment config
- **@nestjs/swagger** — Swagger/OpenAPI documentation
- **swagger-ui-express** — Swagger UI
- **class-validator** — DTO validation
- **class-transformer** — DTO transformation
- **pg** — PostgreSQL driver

---

## Development Workflow

### Before Starting Work

1. **Read the specs** — Start with `README.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master), then your assigned phase docs
2. **Understand the IDs** — Every feature has an ID (`BR-###`, `US-###`, `AC-###`, etc.). Know which IDs you're implementing
3. **Check database schema** — Read `architecture/database-design.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master)
4. **Check API contracts** — Read `architecture/api-design.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master)
5. **Know the invariants** — Read `domain/invariants.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master)
6. **Setup database** — `npm run db:setup` creates PostgreSQL, applies migrations, seeds test data

### Common Development Patterns

#### Adding a New API Endpoint

1. **Check spec** — Find the endpoint in `architecture/api-design.md` (e.g., `POST /api/v1/bookings`)
2. **Create controller** — `src/modules/{feature}/controllers/{feature}.controller.ts`
   - Add route decorator (`@Post()`, `@Get()`, etc.)
   - Validate input via DTO
   - Call service, return response
3. **Create service** — `src/modules/{feature}/services/{feature}.service.ts`
   - Implement business logic
   - Use Prisma for data access
   - Apply transactions where needed
4. **Create DTO** — `src/modules/{feature}/dtos/create-{entity}.dto.ts`
   - Use class-validator decorators
   - Match request schema in spec
5. **Register** — Add to module's controllers, providers
6. **Test** — Write unit + integration test per `quality/acceptance-test-matrix.md`

#### Adding a Database Migration

1. **Update `schema.prisma`** — Add/modify entity or relationship
2. **Generate migration** — `npm run db:migration -- add <name>`
   - Review generated SQL in `prisma/migrations/`
3. **Apply** — `npm run db:migrate` (auto-applied in dev)
4. **Seed** — Update `prisma/seed.ts` if test data needs to change

#### Implementing Pessimistic Locking (Last-Seat Race)

When confirming a booking and checking if seat is available:

```typescript
// DON'T:
const booking = await prisma.booking.findUnique(...);
const count = await prisma.booking.count({ where: { status: 'Confirmed', trialClassId } });
if (count < 4) { ... }

// DO:
await prisma.$transaction(async (tx) => {
  // Lock the trial class row
  const trialClass = await tx.$queryRaw`
    SELECT * FROM trial_classes WHERE id = ${trialClassId} FOR UPDATE
  `;

  // Re-check count inside lock
  const count = await tx.booking.count({
    where: { status: 'Confirmed', trialClassId }
  });

  if (count < 4) {
    // Confirm booking
  } else {
    throw new ConflictException('Class is full');
  }
});
```

See `architecture/concurrency-strategy.md` for detailed explanation.

### Important Notes

- **No authentication** — Out of scope. System assumes pre-authenticated parent (session/token passed in header). Frontend provides dummy auth.
- **Mock payment** — Payment service returns success or failure deterministically based on input. Not integrated with real gateway.
- **Roster shows confirmed only** — When fetching roster, filter status = 'Confirmed'. This is not optional.
- **Duplicate booking check** — Before creating booking, verify no confirmed booking exists for (student_id, trial_class_id).
- **Pessimistic locking is critical** — Don't use optimistic locking or no locking for the last-seat scenario. Race condition will be caught in tests.
- **Transaction scope** — Payment confirmation must be atomic: check capacity, create booking, update status in one transaction.

---

## Database & Migrations

**Technology:** PostgreSQL 14+  
**ORM:** Prisma  
**Schema Location:** `prisma/schema.prisma`  
**Migration Strategy:** Prisma migrations (auto-applied in dev)

### Key Constraints

- **Unique:** `(student_id, trial_class_id, status='Confirmed')` — Prevents duplicate confirmed bookings
- **Check:** `confirmed_count <= 4` — Class capacity limit
- **Foreign Keys:** Student → Parent, Booking → Student/TrialClass, PaymentAttempt → Booking
- **Row-level locking:** `SELECT ... FOR UPDATE` on trial_classes during booking confirmation

See `architecture/database-design.md` for full schema and relationships.

---

## API Conventions

**Base URL:** `http://localhost:3000/api/v1`  
**Version:** v1 (in URL path)  
**Request Format:** JSON  
**Response Format:** JSON

### Authentication

- Header: `Authorization: Bearer <token>` (dummy/not validated in this scope)
- No authorization checks — system assumes valid parent is authenticated

### Error Responses

All errors return JSON with `statusCode` and `message`:

```json
{
  "statusCode": 409,
  "message": "Class is full or booking already exists",
  "error": "Conflict"
}
```

**Common Status Codes:**

- `201 Created` — Resource created
- `200 OK` — Success
- `400 Bad Request` — Input validation failed
- `404 Not Found` — Resource doesn't exist
- `409 Conflict` — Business logic violation (duplicate booking, overbooking, race condition)
- `500 Internal Server Error` — Unexpected error

### Pagination

Not used in this scope. All list endpoints return full results.

### Naming Conventions

- **Endpoints:** Plural resource names, lowercase: `/api/v1/trial-classes`, `/api/v1/bookings`
- **IDs:** UUID v4
- **Dates:** ISO 8601 (UTC)
- **Status fields:** Uppercase enum values: `Pending Payment`, `Confirmed`, `Payment Failed`

See `architecture/api-design.md` for full endpoint specs.

---

## Configuration & Environment

### Environment Variables

Required (development):

- `DATABASE_URL` — PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/trial_booking`)
- `NODE_ENV` — `development` or `production`

Optional:

- `PORT` — Server port (default: 3000)
- `LOG_LEVEL` — Logging level (default: `debug`)

### Configuration Files

- `.env` — Local development (git-ignored)
- `.env.example` — Template for `.env`
- `src/config/` — Typed config modules

---

## API Documentation (Swagger)

**Library:** `@nestjs/swagger` + `swagger-ui-express`

### Swagger Endpoint

- **URL:** `http://localhost:3000/api/docs`
- **Auto-generated** dari decorator pada controllers dan DTOs

### Setup di main.ts

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Trial Booking System API')
  .setDescription('REST API for booking trial science/math classes for kids')
  .setVersion('1.0')
  .addTag('trial-classes', 'Trial class management (including roster)')
  .addTag('bookings', 'Booking lifecycle')
  .addTag('payments', 'Payment processing')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Konvensi Decorator

| Decorator                                   | Penggunaan           |
| ------------------------------------------- | -------------------- |
| `@ApiTags('bookings')`                      | Setiap controller    |
| `@ApiOperation({ summary: '...' })`         | Setiap endpoint      |
| `@ApiResponse({ status: 201, type: ... })`  | Setiap response code |
| `@ApiBody({ type: CreateBookingDto })`      | Request body         |
| `@ApiParam({ name: 'id', type: 'string' })` | Path parameter       |
| `@ApiProperty({ description: '...' })`      | Setiap field di DTO  |

> **See `.claude/agents/documentation.md` for full documentation conventions.**

---

## Deployment

**Runtime:** Node.js 18+  
**Container:** Docker (see `deployment/deployment-strategy.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) master)

### Pre-Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Migrations are clean (no pending migrations)
- [ ] Environment variables are set correctly
- [ ] Database is accessible and schema is applied

### Deploy Steps

```bash
# Build Docker image
docker build -t trial-booking-backend:latest .

# Run container with PostgreSQL
docker-compose up -d

# Apply migrations (if auto-applied in entrypoint)
# or manually:
docker exec trial-booking-backend npm run db:migrate
```

---

## Troubleshooting

### "Column does not exist" error after migration

**Cause:** Local schema out of sync  
**Solution:**

```bash
npm run db:reset    # Reset local db
npm run db:setup    # Recreate and seed
```

### Last-seat race condition test fails (both users confirmed)

**Cause:** Missing or incorrect pessimistic locking  
**Solution:** Ensure booking confirmation acquires row lock on trial_classes via `FOR UPDATE`

### Duplicate booking check not working

**Cause:** Check happens without transaction, race between check and insert  
**Solution:** Wrap in `prisma.$transaction()`, check again inside lock

### Database connection refused

**Cause:** PostgreSQL not running or credentials wrong  
**Solution:**

```bash
# Start PostgreSQL locally or via Docker
docker-compose up postgres

# Verify connection string in .env
```

---

## References

## References

**Context Repo (Source of Truth):**

- [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — All specs, accessible via MCP GitHub server tools (`github_repo` / `github_text_search`)
- `CLAUDE.md` in context repo — Global rules
- `AGENTS.md` in context repo — Agent catalog
- `agents/backend.md` in context repo — Your detailed role

**Repo Standards:**

- `PATTERNS.md` — Coding standards, patterns, naming conventions

**Specs (Read in This Order):**

1. `README.md` in context repo — Overview
2. `architecture/api-design.md` in context repo — Endpoints
3. `architecture/database-design.md` in context repo — Schema
4. `domain/business-rule.md` in context repo — Rules
5. `domain/invariants.md` in context repo — Invariants
6. `architecture/concurrency-strategy.md` in context repo — Locking

**Quality:**

- `quality/acceptance-test-matrix.md` in context repo — What to test
- `quality/edge-case-verification.md` in context repo — Edge cases
