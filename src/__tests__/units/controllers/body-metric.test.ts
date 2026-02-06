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

// Helper to assert server error response
const expectServerError = (res: any, message: string) => {
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    error: 'Server error',
    message,
  });
};

// Helper to assert validation error response
const expectValidationError = (res: any, details: string[]) => {
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: 'Validation error',
    details,
  });
};

// Helper to create validation error
const createValidationError = (errors: Record<string, string>) => ({
  name: 'ValidationError',
  errors: Object.fromEntries(
    Object.entries(errors).map(([key, message]) => [key, { message }])
  ),
});

describe('BodyMetrics Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = res;

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

      mockCreateNewBodyMetric.mockRejectedValue(
        createValidationError({
          value: 'Value is required',
          date: 'Date is required',
        })
      );

      await createBodyMetric(mockRequest as Request, mockResponse as Response);

      expectValidationError(res, ['Value is required', 'Date is required']);
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

      mockUpdateBodyMetric.mockRejectedValue(
        createValidationError({ value: 'Value must be positive' })
      );

      await updateBodyMetric(mockRequest as Request, mockResponse as Response);

      expectValidationError(res, ['Value must be positive']);
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
  });

  describe('Error Handling', () => {
    it('should return 500 with error message when service throws', async () => {
      const error = new Error('Database connection failed');
      mockGetFilteredBodyMetrics.mockRejectedValue(error);

      await getBodyMetrics(mockRequest as Request, mockResponse as Response);

      expectServerError(res, 'Database connection failed');
    });

    it('should return "Server error" message when error is not an Error instance', async () => {
      mockGetFilteredBodyMetrics.mockRejectedValue('string error');

      await getBodyMetrics(mockRequest as Request, mockResponse as Response);

      expectServerError(res, 'Server error');
    });
  });
});
