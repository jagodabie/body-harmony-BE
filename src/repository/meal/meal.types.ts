import type { MealType } from '../../types/index.js';

export interface MealFilters {
  mealType?: MealType;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface MealResponseDTO {
  [x: string]: any;
  id: string;
  name: string;
  mealType: MealType;
  date: Date;
  time?: string;
  notes?: string;
  createdAt: Date;
  products?: MealProductResponseDTO[];
}

export interface UpdateMealDTO {
  name?: string;
  mealType?: MealType;
  date?: Date | string;
  time?: string;
  notes?: string;
}

export interface CreateMealDTO {
  name: string;
  mealType: MealType;
  date: Date | string;
  time?: string;
  notes?: string;
  products?: CreateMealProductDTO[];
}

// --- Meal product DTOs (used by repository/service) ---

export interface MealProductNutritionDTO {
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
}

/** Product code in response: string (EAN) or populated product snippet */
export type MealProductProductCodeDTO =
  | string
  | {
      name?: string;
      code?: string;
      nutriments?: Record<string, unknown>;
      brands?: string;
    };

export interface MealProductResponseDTO {
  _id: unknown;
  mealId: unknown;
  productCode: MealProductProductCodeDTO;
  quantity: number;
  unit: string;
  nutrition: MealProductNutritionDTO;
  nutritionPer100g?: MealProductNutritionDTO;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMealProductDTO {
  mealId: string;
  productCode: string;
  quantity: number;
  unit?: string;
  nutrition: MealProductNutritionDTO;
}

export interface UpdateMealProductDTO {
  quantity?: number;
  unit?: string;
  nutrition?: MealProductNutritionDTO;
}
