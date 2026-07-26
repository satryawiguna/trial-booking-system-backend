import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../test-setup';
import { TEST_IDS } from '../../fixtures/test-ids';

/**
 * EC-003: Payment Failure Isolation
 *
 * A failed payment must NOT create a confirmed booking or reserve a seat
 * (BR-007, INV-005, INV-006).
 */
describe('EC-003: Payment Failure Isolation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should set booking to PaymentFailed and not consume capacity', async () => {
    // Use English Literature (0/4, empty) and student Noah (not used by other tests)
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .send({
        studentId: TEST_IDS.students.noah,
        trialClassId: TEST_IDS.trialClasses.englishLiterature,
      })
      .expect(201);

    const bookingId = createRes.body.bookingId;

    // Record FAILED payment (atomic: no confirm)
    const payRes = await request(app.getHttpServer())
      .post(`/api/v1/bookings/${bookingId}/payments`)
      .send({ result: 'failed' })
      .expect(200);

    expect(payRes.body.paymentStatus).toBe('FAILED');
    expect(payRes.body.bookingStatus).toBe('PAYMENT_FAILED');

    // Verify booking status is PaymentFailed
    const bookingRes = await request(app.getHttpServer())
      .get(`/api/v1/bookings/${bookingId}`)
      .expect(200);

    expect(bookingRes.body.status).toBe('PAYMENT_FAILED');

    // Verify roster: the failed payment did NOT consume a seat (INV-006)
    const rosterRes = await request(app.getHttpServer())
      .get(
        `/api/v1/trial-classes/${TEST_IDS.trialClasses.englishLiterature}/roster`,
      )
      .expect(200);

    // The failed student must NOT appear in roster
    const participantIds = rosterRes.body.participants.map(
      (p: any) => p.studentId,
    );
    expect(participantIds).not.toContain(TEST_IDS.students.noah);
  });
});
