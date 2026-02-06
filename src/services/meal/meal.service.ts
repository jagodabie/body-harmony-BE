import type {
  MealFilters,
  CreateMealDTO,
  UpdateMealDTO,
  MealResponseDTO,
} from '../../repository/meal/meal.types.js';
import { mealRepository } from '../../repository/meal/meal.instance.js';

export const getFilteredMeals = async (
  filters: MealFilters
): Promise<MealResponseDTO[]> => {
  const normalizedFilters: MealFilters = {
    ...filters,
    startDate: filters.startDate
      ? typeof filters.startDate === 'string'
        ? new Date(filters.startDate)
        : filters.startDate
      : undefined,
    endDate: filters.endDate
      ? typeof filters.endDate === 'string'
        ? new Date(filters.endDate)
        : filters.endDate
      : undefined,
  };
  return mealRepository.getMeals(normalizedFilters);
};

export const getMealById = async (
  id: string
): Promise<MealResponseDTO | null> => {
  return mealRepository.getMealById(id);
};

export const createNewMeal = async (
  mealData: CreateMealDTO
): Promise<MealResponseDTO> => {
  return mealRepository.createMeal(mealData);
};

export const updateMeal = async (
  id: string,
  updateData: UpdateMealDTO
): Promise<MealResponseDTO | null> => {
  return mealRepository.updateMealById(id, updateData);
};

export const deleteMeal = async (id: string): Promise<void> => {
  return mealRepository.deleteMealById(id);
};
