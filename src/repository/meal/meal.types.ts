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

export interface MealProductNutrientsDTO {
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
}

export interface MealProductResponseDTO {
  id: string;
  mealId: string;
  productCode: string;
  name?: string;
  brands?: string;
  quantity: number;
  unit: string;
  nutrientsPerPortion: MealProductNutrientsDTO;
  nutrientsPer100g?: MealProductNutrientsDTO;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMealProductDTO {
  productCode: string;
  quantity: number;
  unit?: string;
}

export interface UpdateMealProductDTO {
  quantity?: number;
  unit?: string;
}
