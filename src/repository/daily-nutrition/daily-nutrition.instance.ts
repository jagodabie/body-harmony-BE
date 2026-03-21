import type { DailyNutritionRepository } from './daily-nutrition.repository.js';
import { MongoDailyNutritionRepository } from './daily-nutrition.mongo.repository.js';

export const dailyNutritionRepository: DailyNutritionRepository =
  new MongoDailyNutritionRepository();
