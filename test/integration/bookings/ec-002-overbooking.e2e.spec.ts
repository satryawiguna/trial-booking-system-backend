import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../test-setup';
import { TEST_IDS } from '../../fixtures/test-ids';

/**
 * EC-002: Overbooking Prevention
 *
 * A trial class must never exceed 4 confirmed bookings (BR-013, INV-001).
 */
describe('EC-002: Overbooking Prevention (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject booking confirmation when class is full (4/4)', async () => {
    // Coding Basics is already full (4 confirmed in seed data)
    const classId = TEST_IDS.trialClasses.codingBasics;

    // Create a new booking for a student NOT already in the class
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .send({
        studentId: TEST_IDS.students.liam,
        trialClassId: classId,
      })
      .expect(201);

    const bookingId = createRes.body.bookingId;

    // Pay — should be REJECTED (class full, atomic payment+confirm)
    const payRes = await request(app.getHttpServer())
      .post(`/api/v1/bookings/${bookingId}/payments`)
      .send({ result: 'success' })
      .expect(409);

    expect(payRes.body.errorCode).toBe('CAPACITY_EXCEEDED');
  });
});
