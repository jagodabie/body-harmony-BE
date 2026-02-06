import type {
  MealFilters,
  MealResponseDTO,
  CreateMealDTO,
  UpdateMealDTO,
} from './meal.types.js';

export interface MealRepository {
  getMeals(filters: MealFilters): Promise<MealResponseDTO[]>;
  getMealById(id: string): Promise<MealResponseDTO | null>;
  createMeal(data: CreateMealDTO): Promise<MealResponseDTO>;
  updateMealById(
    id: string,
    data: UpdateMealDTO
  ): Promise<MealResponseDTO | null>;
  deleteMealById(id: string): Promise<void>;
  deleteMany(): Promise<void>;
  insertMany(data: CreateMealDTO[]): Promise<MealResponseDTO[]>;
}
