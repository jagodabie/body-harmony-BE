import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';

// Mock the service module before importing the controller
const mockGetFilteredBodyMetrics = jest.fn() as jest.MockedFunction<any>;
const mockGetBodyMetricById = jest.fn() as jest.MockedFunction<any>;
const mockCreateNewBodyMetric = jest.fn() as jest.MockedFunction<any>;
const mockUpdateBodyMetric = jest.fn() as jest.MockedFunction<any>;
const mockDeleteBodyMetric = jest.fn() as jest.MockedFunction<any>;
const mockGetStatsSummary = jest.fn() as jest.MockedFunction<any>;

jest.unstable_mockModule('../../../services/body-metric/body-metric.service.js', () => ({
  getFilteredBodyMetrics: mockGetFilteredBodyMetrics,
  getBodyMetricById: mockGetBodyMetricById,
  createNewBodyMetric: mockCreateNewBodyMetric,
  updateBodyMetric: mockUpdateBodyMetric,
  deleteBodyMetric: mockDeleteBodyMetric,
  getStatsSummary: mockGetStatsSummary,
}));

// Import controller after mocking
const {
  getBodyMetrics,
  getBodyMetricById,
  createBodyMetric,
  updateBodyMetric,
  deleteBodyMetric,
  getStatsSummary,
} = await import('../../../controllers/body-metric.controller.js');

describe('BodyMetrics Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let res: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock response
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = res;

    // Setup mock request
    mockRequest = {
      query: {},
      params: {},
      body: {},
    };
  });

  describe('getBodyMetrics', () => {
    it('should return mapped body metrics with all filters', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'weight',
      };

      const fakeMetrics = [
        { id: '1', value: '70', type: 'weight' },
        { id: '2', value: '71', type: 'weight' },
      ];

      mockGetFilteredBodyMetrics.mockResolvedValue(fakeMetrics);

      await getBodyMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockGetFilteredBodyMetrics).toHaveBeenCalledWith({
        type: 'weight',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(res.json).toHaveBeenCalledWith([
        { id: '1', value: '70', type: 'weight' },
        { id: '2', value: '71', type: 'weight' },
      ]);

      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return body metrics without filters', async () => {
      mockRequest.query = {};

      const fakeMetrics = [{ id: '1', value: '70' }];

      mockGetFilteredBodyMetrics.mockResolvedValue(fakeMetrics);

      await getBodyMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockGetFilteredBodyMetrics).toHaveBeenCalledWith({
        type: undefined,
        startDate: undefined,
        endDate: undefined,
      });

      expect(res.json).toHaveBeenCalledWith([{ id: '1', value: '70' }]);
    });

    it('should handle service errors', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      const error = new Error('Database connection failed');
      mockGetFilteredBodyMetrics.mockRejectedValue(error);

      await getBodyMetrics(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server error',
        message: 'Database connection failed',
      });
    });
  });

  describe('getBodyMetricById', () => {
    it('should return body metric by id', async () => {
      mockRequest.params = { id: '123' };

      const fakeMetric = { id: '123', value: '70', type: 'weight' };

      mockGetBodyMetricById.mockResolvedValue(fakeMetric);

      await getBodyMetricById(mockRequest as Request, mockResponse as Response);

      expect(mockGetBodyMetricById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({ id: '123', value: '70', type: 'weight' });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle array id parameter', async () => {
      mockRequest.params = { id: ['123', '456'] };

      const fakeMetric = { id: '123', value: '70' };

      mockGetBodyMetricById.mockResolvedValue(fakeMetric);

      await getBodyMetricById(mockRequest as Request, mockResponse as Response);

      expect(mockGetBodyMetricById).toHaveBeenCalledWith('123');
    });

    it('should return 404 when body metric not found', async () => {
      mockRequest.params = { id: '123' };

      mockGetBodyMetricById.mockResolvedValue(null);

      await getBodyMetricById(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Body metric not found' });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: '123' };

      const error = new Error('Database error');
      mockGetBodyMetricById.mockRejectedValue(error);

      await getBodyMetricById(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server error',
        message: 'Database error',
      });
    });
  });

  describe('createBodyMetric', () => {
    it('should create a new body metric', async () => {
      mockRequest.body = {
        type: 'weight',
        value: 70,
        date: '2024-01-01',
      };

      const fakeMetric = {
        id: '123',
        type: 'weight',
        value: '70',
        date: '2024-01-01',
      };

      mockCreateNewBodyMetric.mockResolvedValue(fakeMetric);

      await createBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(mockCreateNewBodyMetric).toHaveBeenCalledWith({
        type: 'weight',
        value: 70,
        date: '2024-01-01',
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: '123',
        type: 'weight',
        value: '70',
        date: '2024-01-01',
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { type: 'invalid' };

      const validationError = {
        name: 'ValidationError',
        errors: {
          value: { message: 'Value is required' },
          date: { message: 'Date is required' },
        },
      };

      mockCreateNewBodyMetric.mockRejectedValue(validationError);

      await createBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['Value is required', 'Date is required'],
      });
    });

    it('should handle server errors', async () => {
      mockRequest.body = { type: 'weight', value: 70 };

      const error = new Error('Database error');
      mockCreateNewBodyMetric.mockRejectedValue(error);

      await createBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server error',
        message: 'Database error',
      });
    });
  });

  describe('updateBodyMetric', () => {
    it('should update an existing body metric', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = { value: 75 };

      const fakeMetric = { id: '123', value: '75', type: 'weight' };

      mockUpdateBodyMetric.mockResolvedValue(fakeMetric);

      await updateBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateBodyMetric).toHaveBeenCalledWith('123', { value: 75 });
      expect(res.json).toHaveBeenCalledWith({ id: '123', value: '75', type: 'weight' });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle array id parameter', async () => {
      mockRequest.params = { id: ['123'] };
      mockRequest.body = { value: 75 };

      const fakeMetric = { id: '123', value: '75' };

      mockUpdateBodyMetric.mockResolvedValue(fakeMetric);

      await updateBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateBodyMetric).toHaveBeenCalledWith('123', { value: 75 });
    });

    it('should return 404 when body metric not found', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = { value: 75 };

      mockUpdateBodyMetric.mockResolvedValue(null);

      await updateBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Body metric not found' });
    });

    it('should handle validation errors', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = { value: -10 };

      const validationError = {
        name: 'ValidationError',
        errors: {
          value: { message: 'Value must be positive' },
        },
      };

      mockUpdateBodyMetric.mockRejectedValue(validationError);

      await updateBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: ['Value must be positive'],
      });
    });

    it('should handle server errors', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = { value: 75 };

      const error = new Error('Database error');
      mockUpdateBodyMetric.mockRejectedValue(error);

      await updateBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server error',
        message: 'Database error',
      });
    });
  });

  describe('deleteBodyMetric', () => {
    it('should delete a body metric', async () => {
      mockRequest.params = { id: '123' };

      const fakeMetric = { id: '123', value: '70', type: 'weight' };

      mockGetBodyMetricById.mockResolvedValue(fakeMetric);
      mockDeleteBodyMetric.mockResolvedValue(undefined);

      await deleteBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(mockGetBodyMetricById).toHaveBeenCalledWith('123');
      expect(mockDeleteBodyMetric).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Body metric deleted successfully',
        bodyMetric: { id: '123', value: '70', type: 'weight' },
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle array id parameter', async () => {
      mockRequest.params = { id: ['123'] };

      const fakeMetric = { id: '123', value: '70' };

      mockGetBodyMetricById.mockResolvedValue(fakeMetric);
      mockDeleteBodyMetric.mockResolvedValue(undefined);

      await deleteBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(mockDeleteBodyMetric).toHaveBeenCalledWith('123');
    });

    it('should return 404 when body metric not found', async () => {
      mockRequest.params = { id: '123' };

      mockGetBodyMetricById.mockResolvedValue(null);

      await deleteBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(mockGetBodyMetricById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Body metric not found' });
    });

    it('should handle server errors', async () => {
      mockRequest.params = { id: '123' };

      mockGetBodyMetricById.mockResolvedValue({ id: '123', value: '70' });
      const error = new Error('Database error');
      mockDeleteBodyMetric.mockRejectedValue(error);

      await deleteBodyMetric(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server error',
        message: 'Database error',
      });
    });
  });

  describe('getStatsSummary', () => {
    it('should return stats summary', async () => {
      const fakeStats = {
        totalMetrics: 10,
        averageWeight: 70.5,
        averageBodyFat: 15.2,
      };

      mockGetStatsSummary.mockResolvedValue(fakeStats);

      await getStatsSummary(mockRequest as Request, mockResponse as Response);

      expect(mockGetStatsSummary).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeStats);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockGetStatsSummary.mockRejectedValue(error);

      await getStatsSummary(mockRequest as Request, mockResponse as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server error',
        message: 'Database error',
      });
    });
  });
});
