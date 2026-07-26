import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../test-setup';
import { TEST_IDS } from '../../fixtures/test-ids';

/**
 * EC-004: Last-Seat Race Condition
 *
 * When two users compete for the final available spot, only one
 * must become confirmed (BR-014, INV-010, INV-011).
 *
 * Payment + confirm is atomic — send concurrent payment requests.
 */
describe('EC-004: Last-Seat Race Condition (e2e)', () => {
  let app: INestApplication;
  let bookingId1: string;
  let bookingId2: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Science Explorer is 3/4 (nearly full — 1 spot remaining)
    const [create1, create2] = await Promise.all([
      request(app.getHttpServer()).post('/api/v1/bookings').send({
        studentId: TEST_IDS.students.liam,
        trialClassId: TEST_IDS.trialClasses.scienceExplorer,
      }),
      request(app.getHttpServer()).post('/api/v1/bookings').send({
        studentId: TEST_IDS.students.mason,
        trialClassId: TEST_IDS.trialClasses.scienceExplorer,
      }),
    ]);

    bookingId1 = create1.body.bookingId;
    bookingId2 = create2.body.bookingId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should confirm exactly ONE of the two concurrent payment requests', async () => {
    // Send both payment requests SIMULTANEOUSLY (atomic pay+confirm)
    const [result1, result2] = await Promise.allSettled([
      request(app.getHttpServer())
        .post(`/api/v1/bookings/${bookingId1}/payments`)
        .send({ result: 'success' }),
      request(app.getHttpServer())
        .post(`/api/v1/bookings/${bookingId2}/payments`)
        .send({ result: 'success' }),
    ]);

    // Count successful confirmations
    const successCount = [result1, result2].filter(
      (r) =>
        r.status === 'fulfilled' &&
        (r.value as any).body?.bookingStatus === 'CONFIRMED',
    ).length;

    const conflictCount = [result1, result2].filter(
      (r) =>
        r.status === 'fulfilled' &&
        (r.value as any).body?.errorCode === 'CAPACITY_EXCEEDED',
    ).length;

    // Exactly one must succeed, the other gets capacity exceeded
    expect(successCount).toBe(1);
    expect(successCount + conflictCount).toBe(2);

    // Verify the roster has exactly 4 confirmed students
    const rosterRes = await request(app.getHttpServer())
      .get(
        `/api/v1/trial-classes/${TEST_IDS.trialClasses.scienceExplorer}/roster`,
      )
      .expect(200);

    expect(rosterRes.body.participants).toHaveLength(4);
  });
});
