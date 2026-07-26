import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../test-setup';
import { TEST_IDS } from '../../fixtures/test-ids';

describe('Trial Classes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/trial-classes', () => {
    it('should return all trial classes with availability', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/trial-classes')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.length).toBeGreaterThanOrEqual(4);

      // INV-001: availableSeats must be between 0 and capacity
      for (const cls of res.body) {
        expect(cls.availableSeats).toBeGreaterThanOrEqual(0);
        expect(cls.availableSeats).toBeLessThanOrEqual(cls.capacity);
      }
    });
  });

  describe('GET /api/v1/trial-classes/:id', () => {
    it('should return class detail with confirmed count', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/trial-classes/${TEST_IDS.trialClasses.scienceExplorer}`)
        .expect(200);

      expect(res.body.capacity).toBe(4);
      expect(res.body.confirmedCount).toBeGreaterThanOrEqual(0);
      expect(res.body.confirmedCount).toBeLessThanOrEqual(4);
      // INV-001: availableSeats = capacity - confirmedCount
      expect(res.body.availableSeats).toBe(4 - res.body.confirmedCount);
    });

    it('should return 404 for non-existent class', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/trial-classes/00000000-0000-4000-8000-000000000099')
        .expect(404);
    });
  });

  describe('GET /api/v1/trial-classes/:id/roster', () => {
    it('should return only confirmed participants (INV-007)', async () => {
      // First get the class detail to know how many confirmed
      const detailRes = await request(app.getHttpServer())
        .get(`/api/v1/trial-classes/${TEST_IDS.trialClasses.scienceExplorer}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(
          `/api/v1/trial-classes/${TEST_IDS.trialClasses.scienceExplorer}/roster`,
        )
        .expect(200);

      // Roster must match confirmed count
      expect(res.body.participants).toHaveLength(detailRes.body.confirmedCount);
      expect(res.body.trialClassId).toBe(TEST_IDS.trialClasses.scienceExplorer);
    });

    it('should return roster consistent with confirmed count', async () => {
      // First get the class detail to know how many confirmed
      const detailRes = await request(app.getHttpServer())
        .get(`/api/v1/trial-classes/${TEST_IDS.trialClasses.mathFundamentals}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(
          `/api/v1/trial-classes/${TEST_IDS.trialClasses.mathFundamentals}/roster`,
        )
        .expect(200);

      // Roster must match confirmed count
      expect(res.body.participants).toHaveLength(detailRes.body.confirmedCount);
    });
  });
});
