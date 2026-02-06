import type { Request, Response } from 'express';
import * as mealService from '../services/meal/meal.service.js';
import type { MealType } from '../types/index.js';

export const getMeals = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, mealType } = req.query;
    const meals = await mealService.getFilteredMeals({
      mealType: mealType as MealType | undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(meals);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const getMealById = async (req: Request, res: Response) => {
  try {
    const mealId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const meal = await mealService.getMealById(mealId);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    res.json(meal);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const createMeal = async (req: Request, res: Response) => {
  try {
    const newMeal = await mealService.createNewMeal(
      req.body as Parameters<typeof mealService.createNewMeal>[0]
    );
    res.status(201).json(newMeal);
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

export const updateMeal = async (req: Request, res: Response) => {
  try {
    const mealId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const updatedMeal = await mealService.updateMeal(
      mealId,
      req.body as Parameters<typeof mealService.updateMeal>[1]
    );
    if (!updatedMeal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    res.json(updatedMeal);
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

export const deleteMeal = async (req: Request, res: Response) => {
  try {
    const mealId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const existing = await mealService.getMealById(mealId);
    if (!existing) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    await mealService.deleteMeal(mealId);
    res.json({
      message: 'Meal deleted successfully',
      meal: existing,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};
