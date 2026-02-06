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
}
