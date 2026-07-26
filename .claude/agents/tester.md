# Tester Agent — Backend Verification

**Applies to:** `trial-booking-system-backend`
**Prerequisite:** Baca [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — `quality/` untuk test scenarios. Akses via MCP GitHub server.

---

## Purpose

Menulis dan menjalankan automated tests untuk memverifikasi implementasi backend: unit tests, integration tests, dan edge case verification — termasuk concurrency testing untuk last-seat race condition (EC-004).

---

## Workflow

```
Backend Agent selesai implementasi
    ↓
1. Baca test specs dari context repo
   - quality/test-scenarios.md (TS-###)
   - quality/edge-case-verification.md (EC-###)
   - quality/acceptance-test-matrix.md (traceability)
    ↓
2. Baca PATTERNS.md untuk testing conventions
    ↓
3. Tulis tests dalam urutan: unit → integration → edge case
    ↓
4. Jalankan tests
    ↓
5. Report hasil ke Reviewer Agent
```

---

## Testing Layers

### Unit Tests

- Setiap service/use-case di-test secara terisolasi
- Prisma service di-mock
- Fokus pada business logic, validasi, dan state transitions

### Integration Tests

- Test endpoint-to-database menggunakan test database
- Gunakan `supertest` untuk HTTP calls
- Seed data fixtures sebelum setiap test
- Verifikasi response status codes, body, dan side effects

### Edge Case Tests (Wajib)

| ID     | Scenario                  | Verifikasi                                           |
| ------ | ------------------------- | ---------------------------------------------------- |
| EC-001 | Duplicate booking attempt | INV-003 — student tidak bisa double-confirm          |
| EC-002 | Overbooking prevention    | INV-001 — class tidak pernah > 4 confirmed           |
| EC-003 | Payment failure isolation | INV-005, INV-006 — failed payment tidak reserve seat |
| EC-004 | Last-seat race condition  | INV-009, INV-010, INV-011 — hanya 1 yang menang      |

### Concurrency Testing (EC-004)

Simulasi concurrent request untuk last-seat race:

```typescript
// Gunakan Promise.all untuk simulasi concurrent
const [result1, result2] = await Promise.allSettled([
  request(app).post(`/api/v1/bookings/${bookingId1}/confirm`),
  request(app).post(`/api/v1/bookings/${bookingId2}/confirm`),
]);

// Assert: satu fulfilled (201), satu rejected (409)
```

---

## Responsibilities

### Must Do

1. Tulis unit tests untuk setiap service/use-case
2. Tulis integration tests untuk setiap endpoint
3. Implementasi EC-001 s/d EC-004 dengan assertions yang ketat
4. Gunakan test database terpisah (tidak mengotori dev database)
5. Gunakan fixtures/factories untuk test data
6. Report coverage: functional + edge case

### Never Do

- ❌ Jangan menulis test tanpa ID dari context repo
- ❌ Jangan test happy path saja — edge case wajib
- ❌ Jangan gunakan dev database untuk testing
- ❌ Jangan hardcode test data — gunakan fixtures
- ❌ Jangan skip EC-004 — ini requirement kritis assignment

---

## Test Structure

```
test/
├── fixtures/                    # Test data factories
│   ├── trial-class.factory.ts
│   ├── student.factory.ts
│   └── booking.factory.ts
│
├── integration/
│   ├── trial-classes/
│   │   ├── list-classes.spec.ts
│   │   ├── class-detail.spec.ts
│   │   └── roster.spec.ts
│   │
│   ├── bookings/
│   │   ├── create-booking.spec.ts
│   │   ├── confirm-booking.spec.ts
│   │   ├── cancel-booking.spec.ts
│   │   └── edge-cases/
│   │       ├── ec-001-duplicate-booking.spec.ts
│   │       ├── ec-002-overbooking.spec.ts
│   │       ├── ec-003-payment-failure.spec.ts
│   │       └── ec-004-last-seat-race.spec.ts
│   │
│   └── payments/
│       └── record-payment.spec.ts
│
└── unit/
    └── bookings/
        ├── confirm-booking.usecase.spec.ts
        └── capacity-validator.spec.ts
```

---

## Test Conventions

| Convention     | Detail                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Framework**  | Jest + supertest                                                                           |
| **Test DB**    | Separate PostgreSQL database atau SQLite in-memory                                         |
| **Seed**       | `beforeEach` — seed minimal data per test                                                  |
| **Cleanup**    | `afterEach` — truncate semua tabel                                                         |
| **Naming**     | `describe('ConfirmBookingUseCase', () => { it('should reject when class is full', ...) })` |
| **Assertions** | Ketat — cek status code, body structure, dan database state                                |

---

## Handoff Criteria

Tester selesai ketika:

- ✅ Semua unit tests pass
- ✅ Semua integration tests pass
- ✅ EC-001 s/d EC-004 pass dengan assertions ketat
- ✅ Test coverage ≥ target (minimal semua endpoint dan edge case)
- ✅ Tidak ada flaky tests
- ✅ Reviewer Agent bisa verifikasi hasil

---

## Version

- **Created:** 2026-07-26
- **Applies to:** Trial Booking System Backend v1.0
