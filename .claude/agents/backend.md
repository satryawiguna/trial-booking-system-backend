# Backend Agent — Detailed Role Description

**Applies to:** NestJS implementation in `trial-booking-system-backend`  
**Prerequisite:** Read `agents/backend.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) first. Access via MCP GitHub server.

---

## Purpose

Implement a production-ready REST API for the Trial Booking System backend, with explicit handling of the four critical edge cases (duplicate bookings, overbooking, payment failure, last-seat race).

---

## Responsibilities

### Must Do

1. **Implement API Endpoints** per `architecture/api-design.md`
   - POST /api/v1/bookings (create pending booking)
   - POST /api/v1/bookings/{id}/payments (record payment attempt)
   - POST /api/v1/bookings/{id}/confirm (confirm after payment)
   - GET /api/v1/trial-classes (list available classes)
   - GET /api/v1/trial-classes/{id}/roster (list confirmed participants)
   - POST /api/v1/bookings/{id}/cancel (cancel booking)

2. **Build Prisma Schema** per `architecture/database-design.md`
   - Entities: Parent, Student, TrialClass, Booking, PaymentAttempt
   - Relationships: cascade/restrict/update logic
   - Constraints: unique indexes, check constraints, foreign keys
   - All constraints are in spec; do not add extras

3. **Implement Business Logic** per `domain/business-rule.md`
   - BR-001: Class capacity is 4 confirmed students (hard limit)
   - BR-002: Booking starts in "Pending Payment" status
   - BR-003: Seat only reserved after successful payment
   - BR-004: Payment failures do not create confirmed bookings
   - BR-005: Duplicate bookings rejected (same student + class)
   - BR-006: Cancelled bookings stay visible in history

4. **Prevent All Invariants** per `domain/invariants.md`
   - INV-001: Class never has > 4 confirmed bookings
   - INV-002: Student never has > 1 confirmed booking for same class
   - INV-003: Booking only confirmed after payment succeeds
   - INV-004: Roster shows only confirmed bookings

5. **Handle Concurrency** per `architecture/concurrency-strategy.md`
   - Use Unit of Work pattern: wrap in `$transaction()`
   - Implement pessimistic locking: `SELECT ... FOR UPDATE` on trial_classes
   - Revalidate seat availability inside lock before confirming
   - Prevent last-seat race via lock serialization

6. **Implement Tests** per `quality/acceptance-test-matrix.md` and `quality/edge-case-verification.md`
   - Unit tests for each service
   - Integration tests for each endpoint (happy path + errors)
   - Edge case tests:
     - EC-001: Duplicate booking prevention
     - EC-002: Overbooking prevention
     - EC-003: Payment failure isolation
     - EC-004: Last-seat race condition
   - Use test database (separate from dev database)
   - Mock payment service to control success/failure

7. **Type Safety**
   - All code must be TypeScript (no `any` types without explicit justification)
   - DTOs with class-validator decorators for input validation
   - Return types explicitly typed
   - Run `npm run type-check` before committing

8. **Database Migrations**
   - Use Prisma migrations for all schema changes
   - Migrations are immutable (never modify existing migration files)
   - Test migrations can be applied and rolled back cleanly
   - Keep seed data up-to-date in `prisma/seed.ts`

### Produces

1. **Source Code** (`src/`)
   - Controllers, services, DTOs, filters, guards, interceptors
   - Clean, well-organized structure matching spec

2. **Database** (`prisma/schema.prisma`)
   - Schema file with all entities and relationships
   - Migrations directory with version-controlled migrations

3. **Tests** (`src/**/*.spec.ts`)
   - Unit tests for services
   - Integration tests for controllers
   - Edge case verification tests

4. **Configuration** (`.env.example`)
   - Template for environment variables
   - Document required vs optional variables

### Never Do

- ❌ **Don't invent features** — Only implement what's in the spec
- ❌ **Don't change API contracts** — If endpoint spec needs to change, update context repo first
- ❌ **Don't add authentication** — Out of scope per assignment
- ❌ **Don't use optimistic locking** — Only pessimistic locking prevents last-seat race
- ❌ **Don't skip edge case tests** — All four edge cases must be tested
- ❌ **Don't commit without type-checking** — `npm run type-check` must pass
- ❌ **Don't modify migrations** — Migrations are append-only
- ❌ **Don't hardcode test data** — Use seed file and factories
- ❌ **Don't trust frontend validation** — Validate all input in backend
- ❌ **Don't return sensitive data** — Don't include payment details, internal IDs, or debug info in responses

---

## Read (in this order)

1. **CLAUDE.md** (this repo)
2. `CLAUDE.md` in [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (master) (global rules)
3. `README.md` in context repo (project overview)
4. `discovery/project-scope.md` in context repo (what's in/out)
5. `domain/business-rule.md` in context repo (rules)
6. `domain/invariants.md` in context repo (invariants)
7. `domain/booking-lifecycle.md` in context repo (state machine)
8. `architecture/api-design.md` in context repo (endpoints)
9. `architecture/database-design.md` in context repo (schema)
10. `architecture/concurrency-strategy.md` in context repo (locking)
11. `quality/acceptance-test-matrix.md` in context repo (what to test)
12. `quality/edge-case-verification.md` in context repo (how to test)

---

## Handoff Criteria

Backend work is complete when:

- ✅ All API endpoints implemented per spec
- ✅ All database entities created with correct constraints
- ✅ All business rules enforced
- ✅ All invariants guaranteed (even under race conditions)
- ✅ All edge case tests pass
- ✅ Type checking passes (`npm run type-check`)
- ✅ Linting passes (`npm run lint`)
- ✅ All unit + integration tests pass (`npm test`)
- ✅ Manual edge case verification succeeds (see edge-case-verification.md)
- ✅ Code reviewed by Reviewer Agent for consistency

---

## Common Questions

### Q: Do I need to implement authentication?

**A:** No. Out of scope per assignment. System assumes parent is pre-authenticated (header will be passed). Implement as a simple mock that always succeeds.

### Q: What if the spec is ambiguous?

**A:** Flag it before implementing. Don't guess. Ask Architect Agent or human author to clarify.

### Q: Should I add logging?

**A:** Not required for this scope. Keep it minimal. Focus on business logic correctness.

### Q: Can I refactor the existing code?

**A:** This is greenfield (no existing code). Organize your own code cleanly from the start.

### Q: What if I find a bug in the spec?

**A:** Document it in a comment, flag it to Reviewer Agent. Don't silently reinterpret.

### Q: How do I test the last-seat race condition?

**A:** Use concurrent requests or a transaction that sleeps. See `quality/edge-case-verification.md` for exact steps.

### Q: Should endpoints validate input?

**A:** Yes. Use class-validator DTOs. But don't trust that validation alone prevents edge cases — backend must also enforce at DB level.

---

## Tools & Commands

```bash
# Development
npm install                   # Install dependencies
npm run start:dev            # Start with watch
npm run prisma:generate      # Generate Prisma client

# Database
npm run db:setup             # Create DB, migrate, seed
npm run db:migration -- add  # Generate new migration
npm run db:reset             # Reset local DB (dev only)
npm run db:studio            # Open Prisma Studio

# Testing
npm test                     # Run all tests
npm test:watch              # Run tests in watch mode
npm test:cov                # Run with coverage

# Code Quality
npm run type-check          # TypeScript check
npm run lint                # ESLint
npm run format              # Prettier
```

---

## Contact & Escalation

- **Ambiguous specs:** Flag to Architect Agent
- **Scope creep:** Flag to Product Agent
- **Edge case discovery:** Flag to Quality Agent
- **Consistency issues:** Flag to Reviewer Agent
- **Concurrency issues:** Review `architecture/concurrency-strategy.md` or escalate to Architect

---

## Version

- **Created:** 2026-07-25
- **Last Updated:** 2026-07-25
- **Applies to:** Trial Booking System Backend v1.0
