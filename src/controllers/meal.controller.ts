import type { Request, Response } from 'express';
import * as mealService from '../services/meal/meal.service.js';
import type { MealType } from '../types/index.js';
import type {
  CreateMealProductDTO,
  UpdateMealProductDTO,
} from '../repository/meal/meal.types.js';

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
    const products = await mealService.getProductsByMeal(mealId);
    res.json({ ...meal, products });
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

export const getMealProducts = async (req: Request, res: Response) => {
  try {
    const mealId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const meal = await mealService.getMealById(mealId);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    const products = await mealService.getProductsByMeal(mealId);
    res.json(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const addMealProduct = async (req: Request, res: Response) => {
  try {
    const mealId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const body = req.body as CreateMealProductDTO;
    if (!body.productCode || body.quantity == null) {
      return res.status(400).json({
        error: 'Product code and quantity are required',
      });
    }
    if (!body.nutrition || typeof body.nutrition !== 'object') {
      return res.status(400).json({
        error:
          'Nutrition object is required with calories, proteins, carbs, fat',
      });
    }
    const product = await mealService.addProductToMeal(mealId, {
      productCode: body.productCode,
      quantity: body.quantity,
      unit: body.unit,
      nutrition: body.nutrition,
    });
    res.status(201).json(product);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Meal not found') {
        return res.status(404).json({ error: 'Meal not found' });
      }
      if (error.message.startsWith('Product not found:')) {
        return res.status(404).json({ error: error.message });
      }
    }
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const updateMealProduct = async (req: Request, res: Response) => {
  try {
    const mealId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;
    const body = req.body as UpdateMealProductDTO;

    const product = await mealService.updateMealProduct(
      mealId,
      productId,
      body
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found in meal' });
    }
    res.json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const removeMealProduct = async (req: Request, res: Response) => {
  try {
    const mealId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;

    const deleted = await mealService.deleteMealProduct(mealId, productId);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found in meal' });
    }
    res.json({ message: 'Product removed from meal successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const getMealsByDateWithProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const dateParam = req.params.date;
    const dateStr =
      typeof dateParam === 'string'
        ? dateParam
        : Array.isArray(dateParam)
          ? dateParam[0]
          : undefined;
    if (dateStr == null) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const meals = await mealService.getMealsByDateWithProducts(
      new Date(dateStr)
    );
    res.json(meals);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};