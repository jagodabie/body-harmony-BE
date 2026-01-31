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

/**
 * @swagger
 * /api/body-metrics:
 *   get:
 *     summary: Get all body metrics
 *     tags: [Body Metrics]
 */
router.get('/', getBodyMetrics);
router.post('/', validateBodyMetricData, createBodyMetric);

/**
 * @swagger
 * /api/body-metrics/stats/summary:
 *   get:
 *     summary: Get body metrics statistics summary
 *     tags: [Body Metrics]
 */
router.get('/stats/summary', getStatsSummary);

/**
 * @swagger
 * /api/body-metrics/{id}:
 *   get:
 *     summary: Get body metrics by ID
 *     tags: [Body Metrics]
 *   put:
 *     summary: Update body metrics
 *     tags: [Body Metrics]
 *   delete:
 *     summary: Delete body metrics
 *     tags: [Body Metrics]
 */
router.get('/:id', validateObjectId, getBodyMetricById);
router.put('/:id', validateObjectId, updateBodyMetric);
router.delete('/:id', validateObjectId, deleteBodyMetric);

export default router;
