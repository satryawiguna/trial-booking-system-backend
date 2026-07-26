import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../../test-setup';
import { TEST_IDS } from '../../../fixtures/test-ids';

describe('Bookings (e2e)', () => {
  let app: INestApplication;
  let createdBookingId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a booking in PendingPayment status (TS-003)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .send({
          studentId: TEST_IDS.students.liam,
          trialClassId: TEST_IDS.trialClasses.mathFundamentals,
        })
        .expect(201);

      expect(res.body.status).toBe('PENDING_PAYMENT');
      expect(res.body.bookingId).toBeDefined();
      createdBookingId = res.body.bookingId;
    });

    it('should reject with 404 for non-existent student', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .send({
          studentId: '00000000-0000-0000-0000-000000000099',
          trialClassId: TEST_IDS.trialClasses.mathFundamentals,
        })
        .expect(404);
    });

    it('should reject with 404 for non-existent class', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .send({
          studentId: TEST_IDS.students.liam,
          trialClassId: '00000000-0000-0000-0000-000000000099',
        })
        .expect(404);
    });

    it('should reject with 400 for invalid UUIDs', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .send({
          studentId: 'not-a-uuid',
          trialClassId: 'not-a-uuid',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    it('should return booking details (TS-005)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/bookings/${createdBookingId}`)
        .expect(200);

      expect(res.body.bookingId).toBe(createdBookingId);
      expect(res.body.status).toBe('PENDING_PAYMENT');
    });

    it('should return 404 for non-existent booking', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/bookings/00000000-0000-0000-0000-000000000099')
        .expect(404);
    });
  });

  describe('POST /api/v1/bookings/:id/payments', () => {
    it('should process payment and auto-confirm the booking (TS-004)', async () => {
      const payRes = await request(app.getHttpServer())
        .post(`/api/v1/bookings/${createdBookingId}/payments`)
        .send({ result: 'success' })
        .expect(200);

      expect(payRes.body.paymentStatus).toBe('SUCCESS');
      expect(payRes.body.bookingStatus).toBe('CONFIRMED');
    });
  });

  describe('POST /api/v1/bookings/:id/cancel', () => {
    it('should cancel a confirmed booking (TS-007)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .send({
          studentId: TEST_IDS.students.mason,
          trialClassId: TEST_IDS.trialClasses.mathFundamentals,
        })
        .expect(201);

      const newBookingId = createRes.body.bookingId;

      // Pay (auto-confirms)
      await request(app.getHttpServer())
        .post(`/api/v1/bookings/${newBookingId}/payments`)
        .send({ result: 'success' })
        .expect(200);

      const cancelRes = await request(app.getHttpServer())
        .post(`/api/v1/bookings/${newBookingId}/cancel`)
        .expect(200);

      expect(cancelRes.body.status).toBe('CANCELLED');
    });
  });
});
