import { dailyNutritionRepository } from '../../repository/daily-nutrition/daily-nutrition.instance.js';
import type { DailyNutritionStatsDTO } from '../../repository/daily-nutrition/daily-nutrition.types.js';

const round1 = (n: number): number => Math.round(n * 10) / 10;

export const getDailyNutritionStats = async (
  days: number
): Promise<DailyNutritionStatsDTO> => {
  const endDate = new Date();
  endDate.setUTCHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  const dailyData = await dailyNutritionRepository.getDailyNutritionByRange(
    startDate,
    endDate
  );

  if (dailyData.length === 0) {
    return {
      period: `${days} days`,
      averageCalories: 0,
      averageProteins: 0,
      averageCarbs: 0,
      averageFat: 0,
      totalDays: 0,
      daysWithMeals: 0,
    };
  }

  const totals = dailyData.reduce(
    (acc, day) => ({
      calories: acc.calories + day.totalCalories,
      proteins: acc.proteins + day.totalProteins,
      carbs: acc.carbs + day.totalCarbs,
      fat: acc.fat + day.totalFat,
    }),
    { calories: 0, proteins: 0, carbs: 0, fat: 0 }
  );

  const daysWithMeals = dailyData.filter((day) => day.mealCount > 0).length;
  const count = dailyData.length;

  return {
    period: `${days} days`,
    averageCalories: Math.round(totals.calories / count),
    averageProteins: round1(totals.proteins / count),
    averageCarbs: round1(totals.carbs / count),
    averageFat: round1(totals.fat / count),
    totalDays: count,
    daysWithMeals,
  };
};
