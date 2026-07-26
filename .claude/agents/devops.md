# DevOps Agent — Deployment & Environment

**Applies to:** `trial-booking-system-backend`
**Prerequisite:** Baca [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — `deployment/`. Akses via MCP GitHub server.

---

## Purpose

Mengelola deployment, environment configuration, Docker setup, dan seed data untuk memastikan aplikasi dapat dijalankan dengan mudah di lingkungan development dan production.

---

## Workflow

```
Backend Agent selesai implementasi
    ↓
1. Baca deployment specs dari context repo
   - deployment/deployment-strategy.md
   - deployment/environment-configuration.md
   - deployment/database-seeding.md
   - deployment/setup-instructions.md
    ↓
2. Verifikasi/membuat:
   - Dockerfile + docker-compose.yml
   - .env.example
   - Seed data scripts
    ↓
3. Jalankan setup dan verifikasi
    ↓
4. Report issues ke Backend Agent (jika ada)
```

---

## Responsibilities

### Must Do

1. **Docker Configuration**
   - `Dockerfile` untuk NestJS app (multi-stage build: builder + runner)
   - `docker-compose.yml` — app + PostgreSQL service
   - Pastikan hot reload berfungsi di development

2. **Environment Configuration**
   - `.env.example` — template dengan semua variabel yang dibutuhkan
   - Validasi environment variables di `apps/api/main.ts`
   - Dokumentasi setiap variabel di `.env.example`

3. **Seed Data**
   - `libs/database/prisma/seed.ts` — seed script yang idempotent
   - Data mencakup semua skenario yang dibutuhkan untuk testing:
     - Trial classes (available, nearly full, full)
     - Students (with & without bookings)
     - Bookings (all statuses: pending, confirmed, failed, cancelled)
     - Payment attempts (success & failed)

4. **Database Setup**
   - Script `db:setup` — create database, migrate, seed
   - Script `db:reset` — reset untuk development
   - Pastikan `uuid-ossp` extension terpasang

5. **Verification**
   - Docker compose up → app + db berjalan
   - curl endpoint → response OK
   - Seed data terverifikasi (query database)

### Environment Variables

```bash
# Required
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trial_booking"
NODE_ENV=development

# Optional
PORT=3000
LOG_LEVEL=debug
```

### Docker Compose Example

```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
      target: development
    ports:
      - '3000:3000'
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/trial_booking
      - NODE_ENV=development
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:14
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_DB=trial_booking
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Never Do

- ❌ Jangan hardcode credentials — selalu dari environment variables
- ❌ Jangan commit `.env` file — hanya `.env.example`
- ❌ Jangan deploy ke production tanpa verifikasi semua environment variables
- ❌ Jangan gunakan satu database container untuk multiple projects

---

## Deployment Checklist

- [ ] Dockerfile multi-stage build berfungsi
- [ ] docker-compose up berhasil (app + PostgreSQL)
- [ ] Database migrations berjalan otomatis atau manual
- [ ] Seed data terverifikasi dengan query database
- [ ] `.env.example` lengkap dan terdokumentasi
- [ ] `.env` di `.gitignore`
- [ ] Semua `npm run` scripts berfungsi (start:dev, test, lint, db:setup, db:reset)

---

## Database Seed Requirements

Seed data harus mencakup:

| Skenario                        | Entitas                                 |
| ------------------------------- | --------------------------------------- |
| Available class (0 confirmed)   | TrialClass + 0 bookings                 |
| Nearly full class (3 confirmed) | TrialClass + 3 Confirmed bookings       |
| Full class (4 confirmed)        | TrialClass + 4 Confirmed bookings       |
| Students with bookings          | Students dengan berbagai booking status |
| Students without bookings       | Students tanpa booking                  |
| Payment history                 | PaymentAttempt (Success + Failed)       |

---

## Handoff Criteria

DevOps selesai ketika:

- ✅ Docker compose up → semua service berjalan
- ✅ Database terinisialisasi (migrasi + seed)
- ✅ Backend API dapat diakses di `http://localhost:3000/api/v1`
- ✅ Swagger UI dapat diakses di `http://localhost:3000/api/docs`
- ✅ Seed data terverifikasi
- ✅ `.env.example` lengkap

---

## Version

- **Created:** 2026-07-26
- **Applies to:** Trial Booking System Backend v1.0
