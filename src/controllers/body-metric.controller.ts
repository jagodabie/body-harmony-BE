import type { Request, Response } from 'express';
import * as bodyMetricService from '../services/body-metric/body-metric.service.js';
import type { BodyMetricType } from '../types/index.js';

export const getBodyMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type } = req.query;
    const bodyMetrics = await bodyMetricService.getFilteredBodyMetrics({
      type: type as BodyMetricType | undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(bodyMetrics);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const getBodyMetricById = async (req: Request, res: Response) => {
  try {
    const bodyMetricId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const bodyMetric = await bodyMetricService.getBodyMetricById(bodyMetricId);
    if (!bodyMetric) {
      return res.status(404).json({ error: 'Body metric not found' });
    }
    res.json(bodyMetric);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const createBodyMetric = async (req: Request, res: Response) => {
  try {
    const newBodyMetric = await bodyMetricService.createNewBodyMetric(
      req.body as Parameters<typeof bodyMetricService.createNewBodyMetric>[0]
    );
    res.status(201).json(newBodyMetric);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ValidationError'
    ) {
      const err = error as { errors?: Record<string, { message?: string }> };
      return res.status(400).json({
        error: 'Validation error',
        details: err.errors
          ? Object.values(err.errors).map((e) => e?.message ?? '')
          : [],
      });
    }
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const updateBodyMetric = async (req: Request, res: Response) => {
  try {
    const bodyMetricId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const updatedBodyMetric = await bodyMetricService.updateBodyMetric(
      bodyMetricId,
      req.body as Parameters<typeof bodyMetricService.updateBodyMetric>[1]
    );
    if (!updatedBodyMetric) {
      return res.status(404).json({ error: 'Body metric not found' });
    }
    res.json(updatedBodyMetric);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ValidationError'
    ) {
      const err = error as { errors?: Record<string, { message?: string }> };
      return res.status(400).json({
        error: 'Validation error',
        details: err.errors
          ? Object.values(err.errors).map((e) => e?.message ?? '')
          : [],
      });
    }
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const deleteBodyMetric = async (req: Request, res: Response) => {
  try {
    const bodyMetricId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const existing = await bodyMetricService.getBodyMetricById(bodyMetricId);
    if (!existing) {
      return res.status(404).json({ error: 'Body metric not found' });
    }
    await bodyMetricService.deleteBodyMetric(bodyMetricId);
    res.json({
      message: 'Body metric deleted successfully',
      bodyMetric: existing,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const getStatsSummary = async (req: Request, res: Response) => {
  try {
    const stats = await bodyMetricService.getStatsSummary();
    res.json(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};
