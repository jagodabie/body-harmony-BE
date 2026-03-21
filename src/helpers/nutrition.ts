import type { MealProductNutrientsDTO } from '../repository/meal/meal.types.js';

const round = (n: number): number => Math.round(n);

export function calculateNutrientsPerPortion(
  nutrientsPer100g: MealProductNutrientsDTO,
  quantityInGrams: number
): MealProductNutrientsDTO {
  const portionRatio = quantityInGrams / 100;
  return {
    calories: round(nutrientsPer100g.calories * portionRatio),
    proteins: round(nutrientsPer100g.proteins * portionRatio),
    carbs: round(nutrientsPer100g.carbs * portionRatio),
    fat: round(nutrientsPer100g.fat * portionRatio),
  };
}

export function extractNutrientsPer100g(
  nutriments: Record<string, number | undefined>
): MealProductNutrientsDTO {
  return {
    calories: round(nutriments['energy-kcal_100g'] ?? 0),
    proteins: round(nutriments['proteins_100g'] ?? 0),
    carbs: round(nutriments['carbohydrates_100g'] ?? 0),
    fat: round(nutriments['fat_100g'] ?? 0),
  };
}

export function roundNutrients(
  nutrients: MealProductNutrientsDTO
): MealProductNutrientsDTO {
  return {
    calories: round(nutrients.calories),
    proteins: round(nutrients.proteins),
    carbs: round(nutrients.carbs),
    fat: round(nutrients.fat),
  };
}

export function calculateMealMacros(
  nutrientsPerPortion: MealProductNutrientsDTO[]
): MealProductNutrientsDTO {
  const totals: MealProductNutrientsDTO = {
    calories: 0,
    proteins: 0,
    carbs: 0,
    fat: 0,
  };

  for (const nutrient of nutrientsPerPortion) {
    totals.calories += nutrient.calories || 0;
    totals.proteins += nutrient.proteins || 0;
    totals.carbs += nutrient.carbs || 0;
    totals.fat += nutrient.fat || 0;
  }

  return {
    calories: round(totals.calories),
    proteins: round(totals.proteins),
    carbs: round(totals.carbs),
    fat: round(totals.fat),
  };
}
