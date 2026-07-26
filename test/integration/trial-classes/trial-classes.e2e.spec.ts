import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../../test-setup';
import { TEST_IDS } from '../../../fixtures/test-ids';

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

      const sci = res.body.find(
        (c: any) => c.id === TEST_IDS.trialClasses.scienceExplorer,
      );
      expect(sci.availableSeats).toBe(1); // 3 confirmed, 4 capacity

      const coding = res.body.find(
        (c: any) => c.id === TEST_IDS.trialClasses.codingBasics,
      );
      expect(coding.availableSeats).toBe(0); // FULL
    });
  });

  describe('GET /api/v1/trial-classes/:id', () => {
    it('should return class detail with confirmed count', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/trial-classes/${TEST_IDS.trialClasses.scienceExplorer}`)
        .expect(200);

      expect(res.body.confirmedCount).toBe(3);
      expect(res.body.availableSeats).toBe(1);
      expect(res.body.capacity).toBe(4);
    });

    it('should return 404 for non-existent class', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/trial-classes/00000000-0000-0000-0000-000000000099')
        .expect(404);
    });
  });

  describe('GET /api/v1/trial-classes/:id/roster', () => {
    it('should return only confirmed participants (INV-007)', async () => {
      const res = await request(app.getHttpServer())
        .get(
          `/api/v1/trial-classes/${TEST_IDS.trialClasses.scienceExplorer}/roster`,
        )
        .expect(200);

      expect(res.body.participants).toHaveLength(3);
      expect(res.body.trialClassId).toBe(TEST_IDS.trialClasses.scienceExplorer);
    });

    it('should return empty roster for class with no confirmed', async () => {
      const res = await request(app.getHttpServer())
        .get(
          `/api/v1/trial-classes/${TEST_IDS.trialClasses.mathFundamentals}/roster`,
        )
        .expect(200);

      expect(res.body.participants).toHaveLength(0);
    });
  });
});
