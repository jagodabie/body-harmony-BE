export interface DailyNutritionDTO {
  date: string;
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

export interface DailyNutritionStatsDTO {
  period: string;
  averageCalories: number;
  averageProteins: number;
  averageCarbs: number;
  averageFat: number;
  totalDays: number;
  daysWithMeals: number;
}
