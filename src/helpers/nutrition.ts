import type { MealProductNutrientsDTO } from '../repository/meal/meal.types.js';

const round1 = (n: number): number => Math.round(n * 10) / 10;

export function calculateNutrientsPerPortion(
  nutrientsPer100g: MealProductNutrientsDTO,
  quantityInGrams: number
): MealProductNutrientsDTO {
  const factor = quantityInGrams / 100;
  return {
    calories: round1(nutrientsPer100g.calories * factor),
    proteins: round1(nutrientsPer100g.proteins * factor),
    carbs: round1(nutrientsPer100g.carbs * factor),
    fat: round1(nutrientsPer100g.fat * factor),
  };
}

export function extractNutrientsPer100g(
  nutriments: Record<string, number | undefined>
): MealProductNutrientsDTO {
  return {
    calories: nutriments['energy-kcal_100g'] ?? 0,
    proteins: nutriments['proteins_100g'] ?? 0,
    carbs: nutriments['carbohydrates_100g'] ?? 0,
    fat: nutriments['fat_100g'] ?? 0,
  };
}

export function calculateMealMacros(
  products: Array<{ nutrientsPerPortion?: MealProductNutrientsDTO }>
): MealProductNutrientsDTO {
  const totals: MealProductNutrientsDTO = {
    calories: 0,
    proteins: 0,
    carbs: 0,
    fat: 0,
  };

  for (const product of products) {
    if (product.nutrientsPerPortion) {
      totals.calories += product.nutrientsPerPortion.calories || 0;
      totals.proteins += product.nutrientsPerPortion.proteins || 0;
      totals.carbs += product.nutrientsPerPortion.carbs || 0;
      totals.fat += product.nutrientsPerPortion.fat || 0;
    }
  }

  totals.calories = round1(totals.calories);
  totals.proteins = round1(totals.proteins);
  totals.carbs = round1(totals.carbs);
  totals.fat = round1(totals.fat);

  return totals;
}
