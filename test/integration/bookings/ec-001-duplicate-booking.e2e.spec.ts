import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../test-setup';
import { TEST_IDS } from '../../fixtures/test-ids';

/**
 * EC-001: Duplicate Booking Prevention
 *
 * A student must never have more than one confirmed booking
 * for the same trial class (BR-004, INV-003).
 */
describe('EC-001: Duplicate Booking Prevention (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject a second confirmed booking for the same student + class', async () => {
    // Emma already has a confirmed booking for Science Explorer (seed data)
    const studentId = TEST_IDS.students.emma;
    const classId = TEST_IDS.trialClasses.scienceExplorer;

    // Create second booking attempt
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .send({ studentId, trialClassId: classId })
      .expect(201);

    const secondBookingId = createRes.body.bookingId;

    // Pay — should be REJECTED due to duplicate (payment + confirm atomically)
    const payRes = await request(app.getHttpServer())
      .post(`/api/v1/bookings/${secondBookingId}/payments`)
      .send({ result: 'success' })
      .expect(409);

    expect(['DUPLICATE_BOOKING', 'CAPACITY_EXCEEDED']).toContain(
      payRes.body.errorCode,
    );
  });
});
