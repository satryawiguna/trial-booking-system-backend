# PATTERNS.md — Coding Standards & Patterns

**Applies to:** `trial-booking-system-backend`
**Architecture:** Clean Architecture + Modular Monolith
**Framework:** NestJS + Prisma + PostgreSQL

---

## 1. Project Structure (Clean Architecture)

Setiap bounded context di `libs/` mengikuti 4-layer architecture:

```
libs/{context}/
├── domain/              # Pure TypeScript — NO NestJS/Prisma imports
│   ├── entities/        # Domain entities with behavior
│   ├── enums/           # Status enums, types
│   ├── repositories/    # Interfaces (IBookingRepository)
│   └── exceptions/      # Domain exceptions
│
├── application/         # Use cases — NO HTTP/DB imports
│   ├── use-cases/       # One class per business action
│   ├── dto/             # Application DTOs (input/output)
│   └── mappers/         # Entity ↔ DTO transformation
│
├── infrastructure/       # Concrete implementations
│   └── persistence/
│       ├── {name}.repository.ts    # Implements domain interface
│       └── {name}.mapper.ts        # Prisma model ↔ domain entity
│
├── presentation/        # HTTP layer
│   ├── controllers/
│   └── dto/             # Request/Response DTOs with Swagger decorators
│
├── {context}.module.ts
└── index.ts
```

### Dependency Direction

```
presentation → application → domain ← infrastructure
```

- **Domain** tidak import dari layer manapun
- **Application** hanya import dari domain
- **Infrastructure** implement interface dari domain
- **Presentation** hanya import dari application

---

## 2. Module Structure

### Libs Grouping

```
libs/
├── trial-classes/       # TrialClass bounded context
├── bookings/            # Booking bounded context
├── payments/            # Payment bounded context
├── parents/             # Parent & Student bounded context
├── auth/                # Dummy auth guard (role from header)
├── database/            # Prisma client, migrations, seed
├── logger/              # Request logging interceptor
└── shared/              # Cross-cutting: filters, guards, pipes, utils
```

### Module Registration

```typescript
// apps/api/app.module.ts
@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    LoggerModule,
    TrialClassesModule,
    BookingsModule,
    PaymentsModule,
    ParentsModule,
  ],
})
export class AppModule {}
```

---

## 3. Transaction & Locking Pattern

### Booking Confirmation (Critical)

```typescript
// File: libs/bookings/application/use-cases/confirm-booking/confirm-booking.usecase.ts

@Injectable()
export class ConfirmBookingUseCase {
  constructor(
    @Inject("IBookingRepository")
    private readonly bookingRepo: IBookingRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(bookingId: string): Promise<Booking> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Lock trial class row
      const trialClass = await tx.$queryRaw<TrialClass[]>`
        SELECT * FROM trial_classes 
        WHERE id = (
          SELECT trial_class_id FROM bookings WHERE id = ${bookingId}
        ) 
        FOR UPDATE
      `;

      if (!trialClass.length) {
        throw new TrialClassNotFoundException();
      }

      // 2. Count confirmed bookings (inside lock)
      const confirmedCount = await tx.booking.count({
        where: {
          trialClassId: trialClass[0].id,
          status: BookingStatus.CONFIRMED,
        },
      });

      // 3. Validate capacity
      if (confirmedCount >= 4) {
        throw new CapacityExceededException();
      }

      // 4. Validate no duplicate (inside lock)
      const existingConfirmed = await tx.booking.findFirst({
        where: {
          studentId: booking.studentId,
          trialClassId: trialClass[0].id,
          status: BookingStatus.CONFIRMED,
          id: { not: bookingId },
        },
      });

      if (existingConfirmed) {
        throw new DuplicateBookingException();
      }

      // 5. Validate successful payment
      const payment = await tx.paymentAttempt.findFirst({
        where: { bookingId, status: "SUCCESS" },
      });

      if (!payment) {
        throw new PaymentRequiredException();
      }

      // 6. Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      // Lock released on commit
    });
  }
}
```

### Rules

- ❌ JANGAN count confirmed bookings DI LUAR transaction
- ❌ JANGAN gunakan optimistic locking (version column)
- ✅ SELALU lock row trial_class dengan `FOR UPDATE`
- ✅ SELALU re-validate capacity DI DALAM lock
- ✅ SELALU keep transaction SHORT (no external API calls inside)

---

## 4. Error Handling Pattern

### Domain Exceptions

```typescript
// libs/shared/exceptions/domain.exception.ts
export abstract class DomainException extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;
}

// libs/bookings/domain/exceptions/capacity-exceeded.exception.ts
export class CapacityExceededException extends DomainException {
  readonly statusCode = 409;
  readonly errorCode = "CAPACITY_EXCEEDED";
  readonly message = "Class is full";
}
```

### Global Exception Filter

```typescript
// libs/shared/filters/http-exception.filter.ts
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      errorCode: exception.errorCode,
      message: exception.message,
    });
  }
}
```

### Error Response Format

```json
{
  "statusCode": 409,
  "errorCode": "CAPACITY_EXCEEDED",
  "message": "Class is full"
}
```

### Custom Exceptions

| Exception                          | HTTP | Error Code           |
| ---------------------------------- | ---- | -------------------- |
| `CapacityExceededException`        | 409  | `CAPACITY_EXCEEDED`  |
| `DuplicateBookingException`        | 409  | `DUPLICATE_BOOKING`  |
| `PaymentRequiredException`         | 422  | `PAYMENT_REQUIRED`   |
| `InvalidStatusTransitionException` | 422  | `INVALID_TRANSITION` |

---

## 5. DTO & Validation Pattern

### Request DTO

```typescript
// libs/bookings/presentation/dto/create-booking.dto.ts
export class CreateBookingDto {
  @ApiProperty({ description: "Student UUID", format: "uuid" })
  @IsUUID()
  studentId: string;

  @ApiProperty({ description: "Trial class UUID", format: "uuid" })
  @IsUUID()
  trialClassId: string;
}
```

### Response DTO

```typescript
// libs/bookings/presentation/dto/booking-response.dto.ts
export class BookingResponseDto {
  @ApiProperty({ format: "uuid" })
  bookingId: string;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ format: "uuid" })
  studentId: string;

  @ApiProperty({ format: "uuid" })
  trialClassId: string;

  @ApiProperty({ format: "date-time", nullable: true })
  confirmedAt: Date | null;

  @ApiProperty({ format: "date-time" })
  createdAt: Date;
}
```

### Application DTO (internal)

```typescript
// libs/bookings/application/dto/confirm-booking.dto.ts
export interface ConfirmBookingInput {
  bookingId: string;
}

export interface ConfirmBookingOutput {
  bookingId: string;
  status: BookingStatus;
}
```

### Mapper

```typescript
// libs/bookings/application/mappers/booking.mapper.ts
export class BookingMapper {
  static toResponseDto(booking: Booking): BookingResponseDto {
    return {
      bookingId: booking.id,
      status: booking.status,
      studentId: booking.studentId,
      trialClassId: booking.trialClassId,
      confirmedAt: booking.confirmedAt,
      createdAt: booking.createdAt,
    };
  }
}
```

---

## 6. Naming Conventions

| Layer                    | Convention                     | Contoh                              |
| ------------------------ | ------------------------------ | ----------------------------------- |
| **Domain Entity**        | PascalCase, singular           | `Booking`, `TrialClass`             |
| **Domain Enum**          | PascalCase, UPPER_SNAKE values | `BookingStatus.CONFIRMED`           |
| **Repository Interface** | `I` prefix                     | `IBookingRepository`                |
| **Repository Impl**      | entity + `.repository.ts`      | `booking.repository.ts`             |
| **Use Case**             | PascalCase + `UseCase`         | `ConfirmBookingUseCase`             |
| **Controller**           | PascalCase + `Controller`      | `BookingsController`                |
| **DTO**                  | PascalCase + `Dto`             | `CreateBookingDto`                  |
| **Module**               | PascalCase + `Module`          | `BookingsModule`                    |
| **File**                 | kebab-case                     | `confirm-booking.usecase.ts`        |
| **Route**                | plural, kebab-case             | `/bookings`, `/trial-classes`       |
| **Database Table**       | snake_case, plural             | `trial_classes`, `payment_attempts` |
| **Database Column**      | snake_case                     | `student_id`, `trial_class_id`      |

---

## 7. Testing Pattern

### Unit Test

```typescript
// test/unit/bookings/confirm-booking.usecase.spec.ts
describe("ConfirmBookingUseCase", () => {
  let useCase: ConfirmBookingUseCase;
  let mockBookingRepo: jest.Mocked<IBookingRepository>;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    mockBookingRepo = { findById: jest.fn(), confirm: jest.fn() };
    mockPrisma = createMockPrisma();

    const module = await Test.createTestingModule({
      providers: [
        ConfirmBookingUseCase,
        { provide: "IBookingRepository", useValue: mockBookingRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get(ConfirmBookingUseCase);
  });

  it("should reject when class is full", async () => {
    // Arrange: mock 4 confirmed bookings
    // Act: execute use case
    // Assert: expect CapacityExceededException
  });
});
```

### Integration Test

```typescript
// test/integration/bookings/confirm-booking.spec.ts
describe("POST /api/v1/bookings/:id/confirm", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Apply same global filters, pipes as main.ts
    await app.init();
  });

  it("should return 409 when class is full", async () => {
    // Arrange: seed 4 confirmed bookings
    // Act: POST /api/v1/bookings/:id/confirm
    // Assert: 409 + CAPACITY_EXCEEDED
  });
});
```

### Concurrency Test (EC-004)

```typescript
// test/integration/bookings/edge-cases/ec-004-last-seat-race.spec.ts
it("should confirm only one booking for the last seat", async () => {
  // Arrange: seed class with 3 confirmed, create 2 pending bookings
  // Act: send both confirm requests concurrently
  const [result1, result2] = await Promise.allSettled([
    request(app.getHttpServer()).post(`/api/v1/bookings/${bookingId1}/confirm`),
    request(app.getHttpServer()).post(`/api/v1/bookings/${bookingId2}/confirm`),
  ]);

  // Assert: exactly one 200, one 409
  const successes = [result1, result2].filter((r) => r.status === "fulfilled");
  expect(successes).toHaveLength(1);

  // Verify: total confirmed = 4
  const response = await request(app.getHttpServer()).get(
    `/api/v1/trial-classes/${classId}/roster`,
  );
  expect(response.body.participants).toHaveLength(4);
});
```

---

## 8. Auth Pattern (Dummy)

### Auth Guard

```typescript
// libs/auth/guards/role.guard.ts
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request.headers["x-user-role"] || "parent";
    // Attach role to request for later use
    request.user = { role };
    return true; // Dummy — always pass
  }
}
```

### Role Decorator

```typescript
// libs/auth/decorators/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

### Usage in Controller

```typescript
@Controller({ path: 'admin', version: '1' })
@Roles('admin')
@UseGuards(RoleGuard)
export class AdminController { ... }
```

---

## 9. Logger Pattern

```typescript
// libs/logger/request-logger.interceptor.ts
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        this.logger.log(`${method} ${url} ${statusCode} ${Date.now() - now}ms`);
      }),
    );
  }
}
```

---

## 10. Version

- **Created:** 2026-07-26
- **Applies to:** Trial Booking System Backend v1.0
