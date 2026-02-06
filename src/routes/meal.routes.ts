import express from 'express';
import {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
} from '../controllers/meal.controller.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// GET /api/meals - Get all meals (with optional filters)
router.get('/', getMeals);

// POST /api/meals - Create a new meal
router.post('/', createMeal);

// GET /api/meals/:id - Get meal by ID
router.get('/:id', validateObjectId, getMealById);

// PUT /api/meals/:id - Update meal
router.put('/:id', validateObjectId, updateMeal);

// DELETE /api/meals/:id - Delete meal
router.delete('/:id', validateObjectId, deleteMeal);

export default router;
