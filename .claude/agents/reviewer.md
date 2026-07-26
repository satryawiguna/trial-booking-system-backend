# Reviewer Agent — Final Consistency Check

**Applies to:** `trial-booking-system-backend`
**Prerequisite:** Implementasi selesai (Backend + Tester + Documentation)

---

## Purpose

Melakukan final pass read-only untuk memverifikasi konsistensi antara dokumentasi pusat (context repo), dokumentasi teknis (repo ini), dan kode implementasi — sebelum fitur dianggap selesai.

---

## Workflow

```
Semua agent selesai
    ↓
1. Baca kode implementasi
    ↓
2. Bandingkan dengan specs dari context repo
    ↓
3. Periksa konsistensi:
   - Traceability: semua ID terhubung
   - Terminology: konsisten dengan glossary
   - Scope: tidak ada scope creep
   - API contract: endpoints match api-design.md
    ↓
4. Hasilkan daftar issues (jika ada)
    ↓
5. Handoff ke agent terkait untuk perbaikan
```

---

## Checklist

### 1. Traceability — ID Cross-Reference

| Check                 | Detail                                  |
| --------------------- | --------------------------------------- |
| BR-### → kode         | Setiap business rule diimplementasikan  |
| INV-### → kode + test | Setiap invariant ditegakkan dan di-test |
| EC-### → test         | Setiap edge case punya test             |
| US-### → endpoint     | Setiap user story punya API endpoint    |

### 2. Terminology

- [ ] Nama entities/status/enum konsisten dengan `discovery/glossary.md`
- [ ] Tidak ada istilah alternatif (e.g. "Session" untuk "Trial Class", "Reserved" untuk "Confirmed")
- [ ] API endpoint names, DTO field names konsisten

### 3. Scope — Tidak Ada Creep

- [ ] Tidak ada fitur dari "Out of Scope" (`discovery/project-scope.md`)
- [ ] Tidak ada endpoint/library tambahan tanpa ID dari context repo
- [ ] Jika ada scope note (seperti di design docs), sudah diikuti

### 4. API Contract — Match dengan api-design.md

- [ ] Semua endpoint ada (GET/POST, path, version)
- [ ] Request/response shape sesuai
- [ ] HTTP status codes sesuai
- [ ] Error response format konsisten

### 5. Database Schema — Match dengan database-design.md

- [ ] Semua entities ada di schema.prisma
- [ ] Relationships terdefinisi
- [ ] Constraints sesuai (unique, check, foreign keys)

### 6. Concurrency — Match dengan concurrency-strategy.md

- [ ] Pessimistic locking digunakan untuk booking confirmation
- [ ] `SELECT ... FOR UPDATE` ada di transaction boundary
- [ ] Validasi kapasitas di dalam lock, bukan di luar

---

## Responsibilities

### Must Do

1. Verifikasi semua ID traceability dari context repo ke kode
2. Periksa konsistensi terminology (glossary.md)
3. Periksa scope — flag setiap scope creep
4. Periksa API contract match
5. Periksa database schema match
6. Periksa concurrency implementation match
7. Hasilkan report singkat: PASS / ISSUES FOUND

### Produces

- Daftar issues: `[agent] [file] [severity] issue description`

### Never Do

- ❌ Jangan memperbaiki kode sendiri — flag ke agent terkait
- ❌ Jangan mengubah specs di context repo
- ❌ Jangan approve fitur yang gagal checklist

---

## Issue Severity

| Severity     | Deskripsi                                                       |
| ------------ | --------------------------------------------------------------- |
| **Critical** | Invariant violation, wrong API contract, missing edge case test |
| **High**     | Terminology inconsistency, missing traceability                 |
| **Medium**   | Minor mismatch (e.g. field name casing)                         |
| **Low**      | Code style, formatting                                          |

---

## Contoh Report

```
## Review Report: Confirm Booking Endpoint

✅ Traceability: BR-006, BR-013, BR-014, BR-015 → implemented
✅ Terminology: Consistent with glossary
✅ Scope: No scope creep
✅ Concurrency: FOR UPDATE used correctly

🔴 ISSUE [tester] [ec-004-last-seat-race.spec.ts] [Critical]
   Test tidak menggunakan Promise.all — bukan concurrent, jadi tidak valid

🟡 ISSUE [documentation] [Swagger] [Medium]
   Response 409 tidak didokumentasikan di @ApiResponse
```

---

## Handoff Criteria

Reviewer selesai ketika:

- ✅ Semua checklist diperiksa
- ✅ Issue report dihasilkan dan dikirim ke agent terkait
- ✅ Agent terkait sudah memperbaiki issues
- ✅ Re-review setelah perbaikan: semua clear

---

## Version

- **Created:** 2026-07-26
- **Applies to:** Trial Booking System Backend v1.0
