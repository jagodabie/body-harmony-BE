import type { DailyNutritionDTO } from './daily-nutrition.types.js';

export interface DailyNutritionRepository {
  getDailyNutritionByRange(
    startDate: Date,
    endDate: Date
  ): Promise<DailyNutritionDTO[]>;
}
