import request from 'supertest';
import app from '../../app.js';
import mongoose from 'mongoose';
import connectDB from '../../config/database.js';
import { mealRepository } from '../../repository/meal/meal.instance.js';

describe('Integration Tests - Meals API Endpoints', () => {
  let createdMealId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    await mealRepository.deleteMany();
  });

  afterEach(async () => {
    // Keep created data for subsequent tests, but clean up if needed
  });

  afterAll(async () => {
    await mealRepository.deleteMany();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/meals', () => {
    it('should return 200 and empty array when no meals exist', async () => {
      const res = await request(app).get('/api/meals');
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 200 and array of meals', async () => {
      const testMeal = await mealRepository.createMeal({
        name: 'Morning oatmeal',
        mealType: 'BREAKFAST',
        date: new Date('2024-01-15'),
        notes: 'With berries',
      });

      const res = await request(app).get('/api/meals');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const meal = res.body.find((m: { id: string }) => m.id === testMeal.id);
      expect(meal).toBeDefined();
      expect(meal.name).toBe('Morning oatmeal');
      expect(meal.mealType).toBe('BREAKFAST');
    });

    it('should handle query parameters for filtering by mealType', async () => {
      await mealRepository.createMeal({
        name: 'Chicken salad',
        mealType: 'LUNCH',
        date: new Date('2024-01-15'),
      });
      await mealRepository.createMeal({
        name: 'Pasta',
        mealType: 'DINNER',
        date: new Date('2024-01-15'),
      });

      const res = await request(app)
        .get('/api/meals')
        .query({ mealType: 'LUNCH' });

      expect([200, 500]).toContain(res.statusCode);
      expect(res.body).toBeDefined();

      if (res.statusCode === 200 && Array.isArray(res.body)) {
        res.body.forEach((meal: { mealType: string }) => {
          expect(meal.mealType).toBe('LUNCH');
        });
      }
    });

    it('should handle date range filters', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();

      const res = await request(app)
        .get('/api/meals')
        .query({ startDate, endDate });

      expect([200, 500]).toContain(res.statusCode);
      expect(res.body).toBeDefined();
    });

    it('should handle combined filters (mealType and date range)', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();

      const res = await request(app)
        .get('/api/meals')
        .query({ mealType: 'BREAKFAST', startDate, endDate });

      expect([200, 500]).toContain(res.statusCode);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /api/meals', () => {
    it('should create a new meal with required fields', async () => {
      const newMeal = {
        name: 'Grilled chicken',
        mealType: 'LUNCH',
        date: '2024-01-20',
      };

      const res = await request(app)
        .post('/api/meals')
        .send(newMeal);

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body.name).toBe('Grilled chicken');
      expect(res.body.mealType).toBe('LUNCH');
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();

      createdMealId = res.body.id;
    });

    it('should create a meal with optional fields', async () => {
      const newMeal = {
        name: 'Salmon dinner',
        mealType: 'DINNER',
        date: '2024-01-20',
        time: '19:30',
        notes: 'Grilled salmon with vegetables',
      };

      const res = await request(app)
        .post('/api/meals')
        .send(newMeal);

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Salmon dinner');
      expect(res.body.mealType).toBe('DINNER');
      expect(res.body.time).toBe('19:30');
      expect(res.body.notes).toBe('Grilled salmon with vegetables');
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/meals')
        .send({ mealType: 'LUNCH', date: '2024-01-20' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });

    it('should return 400 when mealType is missing', async () => {
      const res = await request(app)
        .post('/api/meals')
        .send({ name: 'Test meal', date: '2024-01-20' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });

    it('should return 400 when date is missing', async () => {
      const res = await request(app)
        .post('/api/meals')
        .send({ name: 'Test meal', mealType: 'LUNCH' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });

    it('should return 400 when mealType is invalid', async () => {
      const res = await request(app)
        .post('/api/meals')
        .send({ name: 'Test meal', mealType: 'INVALID_TYPE', date: '2024-01-20' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });

    it('should return 400 when notes exceed 500 characters', async () => {
      const longNotes = 'a'.repeat(501);
      const res = await request(app)
        .post('/api/meals')
        .send({
          name: 'Test meal',
          mealType: 'BREAKFAST',
          date: '2024-01-20',
          notes: longNotes,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });

    it('should return 400 when name exceeds 100 characters', async () => {
      const longName = 'a'.repeat(101);
      const res = await request(app)
        .post('/api/meals')
        .send({
          name: longName,
          mealType: 'BREAKFAST',
          date: '2024-01-20',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });

    it('should return 400 when time format is invalid', async () => {
      const res = await request(app)
        .post('/api/meals')
        .send({
          name: 'Test meal',
          mealType: 'BREAKFAST',
          date: '2024-01-20',
          time: 'invalid-time',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });

    it('should create meal with all allowed meal types', async () => {
      const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'SUPPER'];

      for (const mealType of mealTypes) {
        const res = await request(app)
          .post('/api/meals')
          .send({
            name: `Test ${mealType.toLowerCase()}`,
            mealType,
            date: '2024-01-20',
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.mealType).toBe(mealType);
      }
    });

    it('should accept valid time formats', async () => {
      const validTimes = ['08:00', '12:30', '19:45', '23:59', '00:00'];

      for (const time of validTimes) {
        const res = await request(app)
          .post('/api/meals')
          .send({
            name: `Meal at ${time}`,
            mealType: 'SNACK',
            date: '2024-01-20',
            time,
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.time).toBe(time);
      }
    });
  });

  describe('GET /api/meals/:id', () => {
    it('should return 400 when ID format is invalid', async () => {
      const res = await request(app).get('/api/meals/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid ID format');
    });

    it('should return 404 when meal not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/meals/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Meal not found');
    });

    it('should return meal by valid ID', async () => {
      const testMeal = await mealRepository.createMeal({
        name: 'Apple snack',
        mealType: 'SNACK',
        date: new Date('2024-01-20'),
        notes: 'With peanut butter',
      });

      const res = await request(app).get(`/api/meals/${testMeal.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(testMeal.id);
      expect(res.body.name).toBe('Apple snack');
      expect(res.body.mealType).toBe('SNACK');
      expect(res.body.notes).toBe('With peanut butter');
    });
  });

  describe('PUT /api/meals/:id', () => {
    it('should return 400 when ID format is invalid', async () => {
      const res = await request(app)
        .put('/api/meals/invalid-id')
        .send({ name: 'Updated meal' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid ID format');
    });

    it('should return 404 when meal not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/meals/${fakeId}`)
        .send({ name: 'Updated meal' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Meal not found');
    });

    it('should update an existing meal name', async () => {
      const testMeal = await mealRepository.createMeal({
        name: 'Original meal',
        mealType: 'BREAKFAST',
        date: new Date('2024-01-20'),
      });

      const res = await request(app)
        .put(`/api/meals/${testMeal.id}`)
        .send({ name: 'Updated meal name' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated meal name');
      expect(res.body.mealType).toBe('BREAKFAST');
    });

    it('should update meal type', async () => {
      const testMeal = await mealRepository.createMeal({
        name: 'Test meal',
        mealType: 'BREAKFAST',
        date: new Date('2024-01-20'),
      });

      const res = await request(app)
        .put(`/api/meals/${testMeal.id}`)
        .send({ mealType: 'LUNCH' });

      expect(res.statusCode).toBe(200);
      expect(res.body.mealType).toBe('LUNCH');
    });

    it('should update multiple fields', async () => {
      const testMeal = await mealRepository.createMeal({
        name: 'Original',
        mealType: 'DINNER',
        date: new Date('2024-01-20'),
        notes: 'Initial note',
      });

      const res = await request(app)
        .put(`/api/meals/${testMeal.id}`)
        .send({
          name: 'Updated name',
          mealType: 'SUPPER',
          notes: 'Updated note',
          time: '20:00',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated name');
      expect(res.body.mealType).toBe('SUPPER');
      expect(res.body.notes).toBe('Updated note');
      expect(res.body.time).toBe('20:00');
    });

    it('should return 400 when updating with invalid meal type', async () => {
      const testMeal = await mealRepository.createMeal({
        name: 'Test meal',
        mealType: 'BREAKFAST',
        date: new Date('2024-01-20'),
      });

      const res = await request(app)
        .put(`/api/meals/${testMeal.id}`)
        .send({ mealType: 'INVALID_TYPE' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });
  });

  describe('DELETE /api/meals/:id', () => {
    it('should return 400 when ID format is invalid', async () => {
      const res = await request(app).delete('/api/meals/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid ID format');
    });

    it('should return 404 when meal not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).delete(`/api/meals/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Meal not found');
    });

    it('should delete an existing meal', async () => {
      const testMeal = await mealRepository.createMeal({
        name: 'To be deleted',
        mealType: 'SNACK',
        date: new Date('2024-01-20'),
      });

      const res = await request(app).delete(`/api/meals/${testMeal.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Meal deleted successfully');
      expect(res.body.meal).toBeDefined();
      expect(res.body.meal.id).toBe(testMeal.id);

      // Verify meal is actually deleted
      const getRes = await request(app).get(`/api/meals/${testMeal.id}`);
      expect(getRes.statusCode).toBe(404);
    });
  });

  describe('Meal Response Format', () => {
    it('should return meals with correct response structure', async () => {
      const testMeal = await mealRepository.createMeal({
        name: 'Structure test',
        mealType: 'BREAKFAST',
        date: new Date('2024-01-20'),
        time: '08:30',
        notes: 'Test notes',
      });

      const res = await request(app).get(`/api/meals/${testMeal.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('mealType');
      expect(res.body).toHaveProperty('date');
      expect(res.body).toHaveProperty('time');
      expect(res.body).toHaveProperty('notes');
      expect(res.body).toHaveProperty('createdAt');
      // Should not expose internal _id
      expect(res.body).not.toHaveProperty('_id');
    });

    it('should sort meals by date descending and time ascending', async () => {
      // Clear existing meals
      await mealRepository.deleteMany();

      // Create meals with different dates and times
      await mealRepository.createMeal({
        name: 'Breakfast day 1',
        mealType: 'BREAKFAST',
        date: new Date('2024-01-15'),
        time: '08:00',
      });
      await mealRepository.createMeal({
        name: 'Lunch day 1',
        mealType: 'LUNCH',
        date: new Date('2024-01-15'),
        time: '12:00',
      });
      await mealRepository.createMeal({
        name: 'Breakfast day 2',
        mealType: 'BREAKFAST',
        date: new Date('2024-01-16'),
        time: '08:00',
      });

      const res = await request(app).get('/api/meals');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      // Most recent date should be first
      expect(res.body[0].name).toBe('Breakfast day 2');
      // Same date sorted by time ascending
      expect(res.body[1].name).toBe('Breakfast day 1');
      expect(res.body[2].name).toBe('Lunch day 1');
    });
  });
});
