import { MealProduct } from '../../models/meal/meal-product.model.js';
import type { DailyNutritionRepository } from './daily-nutrition.repository.js';
import type { DailyNutritionDTO } from './daily-nutrition.types.js';

export class MongoDailyNutritionRepository implements DailyNutritionRepository {
  async getDailyNutritionByRange(
    startDate: Date,
    endDate: Date
  ): Promise<DailyNutritionDTO[]> {
    const results = await MealProduct.aggregate([
      {
        $lookup: {
          from: 'body_harmony_meals',
          localField: 'mealId',
          foreignField: '_id',
          as: '_meal',
        },
      },
      { $unwind: '$_meal' },
      {
        $match: {
          '_meal.date': { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$_meal.date' },
          },
          totalCalories: { $sum: '$nutrientsPerPortion.calories' },
          totalProteins: { $sum: '$nutrientsPerPortion.proteins' },
          totalCarbs: { $sum: '$nutrientsPerPortion.carbs' },
          totalFat: { $sum: '$nutrientsPerPortion.fat' },
          mealIds: { $addToSet: '$mealId' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalCalories: { $round: ['$totalCalories', 1] },
          totalProteins: { $round: ['$totalProteins', 1] },
          totalCarbs: { $round: ['$totalCarbs', 1] },
          totalFat: { $round: ['$totalFat', 1] },
          mealCount: { $size: '$mealIds' },
        },
      },
      { $sort: { date: -1 } },
    ]);

    return results as DailyNutritionDTO[];
  }
}
