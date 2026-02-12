import type {
  MealFilters,
  MealResponseDTO,
  CreateMealDTO,
  UpdateMealDTO,
  MealProductResponseDTO,
  CreateMealProductDTO,
  UpdateMealProductDTO,
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
  getProductsByDate(date: Date): Promise<MealProductResponseDTO[]>;
  getProductsByMeal(mealId: string): Promise<MealProductResponseDTO[]>;
  addProductToMeal(
    mealId: string,
    data: CreateMealProductDTO
  ): Promise<MealProductResponseDTO>;
  updateMealProduct(
    mealId: string,
    productId: string,
    data: UpdateMealProductDTO
  ): Promise<MealProductResponseDTO | null>;
  deleteMealProduct(mealId: string, productId: string): Promise<boolean>;
  deleteProductsByMealId(mealId: string): Promise<void>;
}
