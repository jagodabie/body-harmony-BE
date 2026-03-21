import express from 'express';
import { getDailyNutritionStats } from '../controllers/daily-nutrition.controller.js';

const router = express.Router();

router.get('/stats', getDailyNutritionStats);

export default router;
