import express from 'express';
import {
  getBodyMetrics,
  getBodyMetricById,
  createBodyMetric,
  updateBodyMetric,
  deleteBodyMetric,
  getStatsSummary,
} from '../controllers/body-metric.controller.js';
import { validateBodyMetricData, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// GET /api/body-metrics - Get all body metrics (with optional filters)
router.get('/', getBodyMetrics);

// POST /api/body-metrics - Create a new body metric
router.post('/', validateBodyMetricData, createBodyMetric);

// GET /api/body-metrics/stats/summary - Get statistics summary
router.get('/stats/summary', getStatsSummary);

// GET /api/body-metrics/:id - Get body metric by ID
router.get('/:id', validateObjectId, getBodyMetricById);

// PUT /api/body-metrics/:id - Update body metric
router.put('/:id', validateObjectId, updateBodyMetric);

// DELETE /api/body-metrics/:id - Delete body metric
router.delete('/:id', validateObjectId, deleteBodyMetric);

export default router;
