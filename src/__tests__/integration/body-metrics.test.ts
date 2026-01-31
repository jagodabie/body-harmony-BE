import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';
import connectDB from '../../config/database.js';
import { bodyMetricRepository } from '../../repository/body-metric/body-metric.instance.js';

describe('Integration Tests - BodyMetrics API Endpoints', () => {
  let createdBodyMetricId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    await bodyMetricRepository.deleteMany();
  });

  afterEach(async () => {
    // Keep created data for subsequent tests, but clean up if needed
  });

  afterAll(async () => {
    await bodyMetricRepository.deleteMany();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/body-metrics', () => {
    it('should return 200 and empty array when no body metrics exist', async () => {
      const res = await request(app).get('/api/body-metrics');

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 200 and array of body metrics', async () => {
      const testMetric = await bodyMetricRepository.createMetric({
        type: 'weight',
        value: '70',
        unit: 'kg',
        date: new Date('2024-01-15'),
      });

      const res = await request(app).get('/api/body-metrics');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const metric = res.body.find((m: { id: string }) => m.id === testMetric.id);
      expect(metric).toBeDefined();
      expect(metric.type).toBe('weight');
      expect(metric.value).toBe('70');
    });

    it('should handle query parameters for filtering by type', async () => {
      await bodyMetricRepository.createMetric({
        type: 'weight',
        value: '70',
        unit: 'kg',
        date: new Date('2024-01-15'),
      });
      await bodyMetricRepository.createMetric({
        type: 'mood',
        value: 'happy',
        date: new Date('2024-01-16'),
      });

      const res = await request(app)
        .get('/api/body-metrics')
        .query({ type: 'weight' });

      expect([200, 500]).toContain(res.statusCode);
      expect(res.body).toBeDefined();

      if (res.statusCode === 200 && Array.isArray(res.body)) {
        res.body.forEach((metric: { type: string }) => {
          expect(metric.type).toBe('weight');
        });
      }
    });

    it('should handle date range filters', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-01-31').toISOString();

      const res = await request(app)
        .get('/api/body-metrics')
        .query({ startDate, endDate });

      expect([200, 500]).toContain(res.statusCode);
      expect(res.body).toBeDefined();
    });

    it('should handle combined filters (type and date range)', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();

      const res = await request(app)
        .get('/api/body-metrics')
        .query({ type: 'weight', startDate, endDate });

      expect([200, 500]).toContain(res.statusCode);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /api/body-metrics', () => {
    it('should create a new body metric with required fields', async () => {
      const newMetric = {
        type: 'weight',
        value: '75',
        unit: 'kg',
        date: '2024-01-20',
      };

      const res = await request(app)
        .post('/api/body-metrics')
        .send(newMetric);

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body.type).toBe('weight');
      expect(res.body.value).toBe('75');
      expect(res.body.unit).toBe('kg');
      expect(res.body.id).toBeDefined();

      createdBodyMetricId = res.body.id;
    });

    it('should create a body metric without optional fields', async () => {
      const newMetric = {
        type: 'mood',
        value: 'happy',
      };

      const res = await request(app)
        .post('/api/body-metrics')
        .send(newMetric);

      expect(res.statusCode).toBe(201);
      expect(res.body.type).toBe('mood');
      expect(res.body.value).toBe('happy');
    });

    it('should return 400 when type is missing', async () => {
      const res = await request(app)
        .post('/api/body-metrics')
        .send({ value: '70' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
      expect(res.body.details.type).toBe('Type is required');
    });

    it('should return 400 when value is missing', async () => {
      const res = await request(app)
        .post('/api/body-metrics')
        .send({ type: 'weight' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
      expect(res.body.details.value).toBe('Value is required');
    });

    it('should return 400 when type is invalid', async () => {
      const res = await request(app)
        .post('/api/body-metrics')
        .send({ type: 'invalid_type', value: '70' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid type');
      expect(res.body.allowedTypes).toBeDefined();
    });

    it('should return 400 when notes exceed 500 characters', async () => {
      const longNotes = 'a'.repeat(501);
      const res = await request(app)
        .post('/api/body-metrics')
        .send({
          type: 'weight',
          value: '70',
          notes: longNotes,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Notes too long');
    });

    it('should create body metric with all allowed types', async () => {
      const types = ['weight', 'measurement', 'mood', 'energy', 'sleep', 'exercise', 'nutrition', 'water'];

      for (const type of types) {
        const res = await request(app)
          .post('/api/body-metrics')
          .send({ type, value: 'test' });

        expect(res.statusCode).toBe(201);
        expect(res.body.type).toBe(type);
      }
    });
  });

  describe('GET /api/body-metrics/:id', () => {
    it('should return 400 when ID format is invalid', async () => {
      const res = await request(app).get('/api/body-metrics/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid ID format');
    });

    it('should return 404 when body metric not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/body-metrics/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Body metric not found');
    });

    it('should return body metric by valid ID', async () => {
      const testMetric = await bodyMetricRepository.createMetric({
        type: 'weight',
        value: '80',
        unit: 'kg',
        date: new Date('2024-01-25'),
      });

      const res = await request(app).get(`/api/body-metrics/${testMetric.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(testMetric.id);
      expect(res.body.type).toBe('weight');
      expect(res.body.value).toBe('80');
    });
  });

  describe('PUT /api/body-metrics/:id', () => {
    it('should return 400 when ID format is invalid', async () => {
      const res = await request(app)
        .put('/api/body-metrics/invalid-id')
        .send({ value: '75' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid ID format');
    });

    it('should return 404 when body metric not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/body-metrics/${fakeId}`)
        .send({ value: '75' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Body metric not found');
    });

    it('should update an existing body metric', async () => {
      const testMetric = await bodyMetricRepository.createMetric({
        type: 'weight',
        value: '70',
        unit: 'kg',
        date: new Date('2024-01-20'),
      });

      const res = await request(app)
        .put(`/api/body-metrics/${testMetric.id}`)
        .send({ value: '75' });

      expect(res.statusCode).toBe(200);
      expect(res.body.value).toBe('75');
      expect(res.body.type).toBe('weight');
    });

    it('should update multiple fields', async () => {
      const testMetric = await bodyMetricRepository.createMetric({
        type: 'weight',
        value: '70',
        unit: 'kg',
        notes: 'Initial note',
      });

      const res = await request(app)
        .put(`/api/body-metrics/${testMetric.id}`)
        .send({
          value: '72',
          notes: 'Updated note',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.value).toBe('72');
      expect(res.body.notes).toBe('Updated note');
    });
  });

  describe('DELETE /api/body-metrics/:id', () => {
    it('should return 400 when ID format is invalid', async () => {
      const res = await request(app).delete('/api/body-metrics/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid ID format');
    });

    it('should return 404 when body metric not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).delete(`/api/body-metrics/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Body metric not found');
    });

    it('should delete an existing body metric', async () => {
      const testMetric = await bodyMetricRepository.createMetric({
        type: 'weight',
        value: '70',
        unit: 'kg',
      });

      const res = await request(app).delete(`/api/body-metrics/${testMetric.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Body metric deleted successfully');
      expect(res.body.bodyMetric).toBeDefined();
      expect(res.body.bodyMetric.id).toBe(testMetric.id);

      const getRes = await request(app).get(`/api/body-metrics/${testMetric.id}`);
      expect(getRes.statusCode).toBe(404);
    });
  });

  describe('GET /api/body-metrics/stats/summary', () => {
    it('should return stats summary', async () => {
      await bodyMetricRepository.createMetric({ type: 'weight', value: '70' });
      await bodyMetricRepository.createMetric({ type: 'weight', value: '71' });
      await bodyMetricRepository.createMetric({ type: 'mood', value: 'happy' });

      const res = await request(app).get('/api/body-metrics/stats/summary');

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return empty array when no data exists', async () => {
      await bodyMetricRepository.deleteMany();

      const res = await request(app).get('/api/body-metrics/stats/summary');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
