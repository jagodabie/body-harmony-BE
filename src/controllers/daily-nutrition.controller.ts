import type { Request, Response } from 'express';
import * as dailyNutritionService from '../services/daily-nutrition/daily-nutrition.service.js';

const DEFAULT_STATS_DAYS = 30;

export const getDailyNutritionStats = async (req: Request, res: Response) => {
  try {
    const daysParam = req.query.days;
    const days =
      typeof daysParam === 'string' && !Number.isNaN(Number(daysParam))
        ? Math.max(1, parseInt(daysParam, 10))
        : DEFAULT_STATS_DAYS;

    const stats = await dailyNutritionService.getDailyNutritionStats(days);
    res.json(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};
