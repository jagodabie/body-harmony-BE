import { describe, it, expect } from '@jest/globals';
import {
  calculateNutrientsPerPortion,
  extractNutrientsPer100g,
  calculateMealMacros,
} from '../../../helpers/nutrition.js';
import type { MealProductNutrientsDTO } from '../../../repository/meal/meal.types.js';

describe('calculateNutrientsPerPortion', () => {
  const per100g: MealProductNutrientsDTO = {
    calories: 250,
    proteins: 10,
    carbs: 30,
    fat: 8,
  };

  it('should return exact values for 100g', () => {
    expect(calculateNutrientsPerPortion(per100g, 100)).toEqual(per100g);
  });

  it('should scale down for 50g', () => {
    expect(calculateNutrientsPerPortion(per100g, 50)).toEqual({
      calories: 125,
      proteins: 5,
      carbs: 15,
      fat: 4,
    });
  });

  it('should scale up for 200g', () => {
    expect(calculateNutrientsPerPortion(per100g, 200)).toEqual({
      calories: 500,
      proteins: 20,
      carbs: 60,
      fat: 16,
    });
  });

  it('should round to whole numbers', () => {
    const nutrients: MealProductNutrientsDTO = {
      calories: 123,
      proteins: 7.7,
      carbs: 14.3,
      fat: 5.9,
    };

    const result = calculateNutrientsPerPortion(nutrients, 33);

    expect(result).toEqual({
      calories: 41,
      proteins: 3,
      carbs: 5,
      fat: 2,
    });
  });

  it('should return zeros for 0g', () => {
    expect(calculateNutrientsPerPortion(per100g, 0)).toEqual({
      calories: 0,
      proteins: 0,
      carbs: 0,
      fat: 0,
    });
  });
});

describe('extractNutrientsPer100g', () => {
  it('should extract all four nutrient fields', () => {
    const nutriments = {
      'energy-kcal_100g': 350,
      proteins_100g: 12,
      carbohydrates_100g: 45,
      fat_100g: 15,
    };

    expect(extractNutrientsPer100g(nutriments)).toEqual({
      calories: 350,
      proteins: 12,
      carbs: 45,
      fat: 15,
    });
  });

  it('should default missing fields to 0', () => {
    expect(extractNutrientsPer100g({})).toEqual({
      calories: 0,
      proteins: 0,
      carbs: 0,
      fat: 0,
    });
  });

  it('should default undefined values to 0', () => {
    const nutriments: Record<string, number | undefined> = {
      'energy-kcal_100g': undefined,
      proteins_100g: 5,
      carbohydrates_100g: undefined,
      fat_100g: 3,
    };

    expect(extractNutrientsPer100g(nutriments)).toEqual({
      calories: 0,
      proteins: 5,
      carbs: 0,
      fat: 3,
    });
  });

  it('should handle partial data', () => {
    const nutriments = { 'energy-kcal_100g': 100, fat_100g: 5 };

    expect(extractNutrientsPer100g(nutriments)).toEqual({
      calories: 100,
      proteins: 0,
      carbs: 0,
      fat: 5,
    });
  });
});

describe('calculateMealMacros', () => {
  it('should sum nutrients from multiple products', () => {
    console.log('calculateMealMacros');
    const productsNutrientsPerPortion: MealProductNutrientsDTO[] = [
      {
        calories: 200,
        proteins: 10,
        carbs: 25,
        fat: 8,
      },
      {
        calories: 150,
        proteins: 5,
        carbs: 20,
        fat: 6,
      },
    ];

    expect(calculateMealMacros(productsNutrientsPerPortion)).toEqual({
      calories: 350,
      proteins: 15,
      carbs: 45,
      fat: 14,
    });
  });

  it('should return zeros for empty product list', () => {
    expect(calculateMealMacros([])).toEqual({
      calories: 0,
      proteins: 0,
      carbs: 0,
      fat: 0,
    });
  });

  it('should skip products without nutrientsPerPortion', () => {
    const productsNutrientsPerPortion: MealProductNutrientsDTO[] = [
      { calories: 100, proteins: 5, carbs: 10, fat: 3 } ,
      { calories: 0, proteins: 0, carbs: 0, fat: 0 } ,
      { calories: 50, proteins: 2, carbs: 8, fat: 1 } ,
    ];

    expect(calculateMealMacros(productsNutrientsPerPortion)).toEqual({
      calories: 150,
      proteins: 7,
      carbs: 18,
      fat: 4,
    });
  });

  it('should round totals to whole numbers', () => {
    const productsNutrientsPerPortion: MealProductNutrientsDTO[] = [
      {
        calories: 100.33,
        proteins: 5.27,
        carbs: 10.14,
        fat: 3.88,
      },
      {
        calories: 50.29,
        proteins: 2.36,
        carbs: 8.19,
        fat: 1.45,
      },
    ];

    expect(calculateMealMacros(productsNutrientsPerPortion)).toEqual({
      calories: 151,
      proteins: 8,
      carbs: 18,
      fat: 5,
    });
  });

  it('should treat falsy nutrient values as 0', () => {
    const productsNutrientsPerPortion: MealProductNutrientsDTO[] = [
      {
        calories: 0,
        proteins: 0,
        carbs: 0,
        fat: 0,
      },
    ];

    expect(calculateMealMacros(productsNutrientsPerPortion)).toEqual({
      calories: 0,
      proteins: 0,
      carbs: 0,
      fat: 0,
    });
  });
});
