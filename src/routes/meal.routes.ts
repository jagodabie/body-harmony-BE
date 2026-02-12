import express from 'express';
import {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealProducts,
  addMealProduct,
  updateMealProduct,
  removeMealProduct,
  getMealsByDateWithProducts,
} from '../controllers/meal.controller.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// GET /api/meals - Get all meals (with optional filters)
router.get('/', getMeals);

// POST /api/meals - Create a new meal
router.post('/', createMeal);

// By-date must be before /:id so "by-date" is not treated as id
router.get('/by-date/:date/with-products', getMealsByDateWithProducts);

// Meal products (must be before /:id to avoid "products" as id)
router.get('/:id/products', validateObjectId, getMealProducts);
router.post('/:id/products', validateObjectId, addMealProduct);
router.put('/:id/products/:productId', validateObjectId, updateMealProduct);
router.delete('/:id/products/:productId', validateObjectId, removeMealProduct);

// GET /api/meals/:id - Get meal by ID (with products)
router.get('/:id', validateObjectId, getMealById);

// PUT /api/meals/:id - Update meal
router.put('/:id', validateObjectId, updateMeal);

// DELETE /api/meals/:id - Delete meal (and its products)
router.delete('/:id', validateObjectId, deleteMeal);

// GET /api/meals/by-date/:date/with-products - Get meals by date with products
router.get(
  '/by-date/:date/with-products',
  validateObjectId,
  getMealsByDateWithProducts
);

export default router;
