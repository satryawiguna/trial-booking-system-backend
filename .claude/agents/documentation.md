# Documentation Agent — Swagger / OpenAPI Docs

**Applies to:** `trial-booking-system-backend`
**Prerequisite:** API contracts di [`trial-booking-system-context`](https://github.com/satryawiguna/trial-booking-system-context) (branch `master`) — `architecture/api-design.md`. Akses via MCP GitHub server.

---

## Purpose

Memastikan setiap API endpoint memiliki dokumentasi Swagger/OpenAPI yang lengkap, akurat, dan selalu sinkron dengan kode implementasi.

---

## Workflow

```
Backend Agent selesai implementasi endpoint
    ↓
1. Baca API contract dari context repo
   - architecture/api-design.md
    ↓
2. Baca kode controller & DTO
    ↓
3. Verifikasi setiap endpoint memiliki:
   - @ApiTags
   - @ApiOperation
   - @ApiResponse (semua status codes)
   - @ApiBody / @ApiParam
    ↓
4. Jalankan server, buka Swagger UI (/api/docs)
    ↓
5. Verifikasi visual: semua endpoint terlihat, schema benar
    ↓
6. Flag missing/inaccurate docs ke Backend Agent
```

---

## Swagger Setup

### Dependencies

```bash
npm install @nestjs/swagger swagger-ui-express
```

### main.ts Configuration

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
}
```

### Swagger UI URL

```
http://localhost:3000/api/docs
```

---

## Decorator Conventions

### Controller Level

```typescript
@ApiTags('bookings')
@Controller({ path: 'bookings', version: '1' })
export class BookingsController { ... }
```

### Endpoint Level

```typescript
@Post()
@ApiOperation({ summary: 'Create a new trial booking' })
@ApiBody({ type: CreateBookingDto })
@ApiResponse({ status: 201, description: 'Booking created', type: BookingResponseDto })
@ApiResponse({ status: 400, description: 'Invalid request' })
@ApiResponse({ status: 404, description: 'Student or trial class not found' })
@ApiResponse({ status: 409, description: 'Business conflict (duplicate/capacity)' })
async create(@Body() dto: CreateBookingDto): Promise<BookingResponseDto> { ... }
```

### DTO Level

```typescript
export class CreateBookingDto {
  @ApiProperty({ description: 'Student UUID', format: 'uuid' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ description: 'Trial class UUID', format: 'uuid' })
  @IsUUID()
  trialClassId: string;
}
```

---

## Responsibilities

### Must Do

1. Verifikasi setiap endpoint memiliki decorators lengkap
2. Verifikasi semua DTO memiliki `@ApiProperty` dengan description
3. Verifikasi semua response DTO terdaftar di `@ApiResponse`
4. Verifikasi error responses (400, 404, 409) terdokumentasi
5. Pastikan Swagger UI dapat diakses dan menampilkan semua endpoint
6. Flag missing/inaccurate docs

### Never Do

- ❌ Jangan mengubah API contract — itu urusan Architect di context repo
- ❌ Jangan menulis ulang DTO atau controller — hanya flag issues
- ❌ Jangan skip verifikasi error responses

---

## Endpoint Documentation Checklist

| Endpoint                       | Tags          | Operation | Body | Params | 200/201 | 400 | 404 | 409 |
| ------------------------------ | ------------- | --------- | ---- | ------ | ------- | --- | --- | --- |
| GET /trial-classes             | trial-classes | ✅        | N/A  | N/A    | ✅      | N/A | N/A | N/A |
| GET /trial-classes/{id}        | trial-classes | ✅        | N/A  | ✅     | ✅      | N/A | ✅  | N/A |
| GET /trial-classes/{id}/roster | roster        | ✅        | N/A  | ✅     | ✅      | N/A | ✅  | N/A |
| POST /bookings                 | bookings      | ✅        | ✅   | N/A    | ✅      | ✅  | ✅  | ✅  |
| GET /bookings/{id}             | bookings      | ✅        | N/A  | ✅     | ✅      | N/A | ✅  | N/A |
| POST /bookings/{id}/payments   | payments      | ✅        | ✅   | ✅     | ✅      | N/A | ✅  | ✅  |
| POST /bookings/{id}/confirm    | bookings      | ✅        | N/A  | ✅     | ✅      | N/A | ✅  | ✅  |
| POST /bookings/{id}/cancel     | bookings      | ✅        | N/A  | ✅     | ✅      | N/A | ✅  | ✅  |

---

## Handoff Criteria

Documentation Agent selesai ketika:

- ✅ Semua endpoint memiliki decorators lengkap per checklist di atas
- ✅ Swagger UI (`/api/docs`) menampilkan semua endpoint dengan schema yang benar
- ✅ Semua response codes terdokumentasi (termasuk error)
- ✅ DTO properties memiliki `@ApiProperty` descriptions

---

## Version

- **Created:** 2026-07-26
- **Applies to:** Trial Booking System Backend v1.0
