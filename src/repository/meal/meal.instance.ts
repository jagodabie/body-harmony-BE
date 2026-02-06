import type { MealRepository } from './meal.repository.js';
import { MongoMealRepository } from './meal.mongo.repository.js';

export const mealRepository: MealRepository = new MongoMealRepository();
