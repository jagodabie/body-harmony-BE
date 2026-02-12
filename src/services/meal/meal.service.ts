import type {
  MealFilters,
  CreateMealDTO,
  UpdateMealDTO,
  MealResponseDTO,
  MealProductResponseDTO,
  CreateMealProductDTO,
  UpdateMealProductDTO,
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
  console.log('mealData =====>', mealData);

  const newMeal = await mealRepository.createMeal(mealData);
  console.log('newMeal =====>', newMeal);
  if(newMeal.id) {
    await mealRepository.addProductToMeal(newMeal.id, mealData.products);
  }
  return newMeal;
};

export const updateMeal = async (
  id: string,
  updateData: UpdateMealDTO
): Promise<MealResponseDTO | null> => {
  return mealRepository.updateMealById(id, updateData);
};

export const deleteMeal = async (id: string): Promise<void> => {
  await mealRepository.deleteProductsByMealId(id);
  await mealRepository.deleteMealById(id);
};

export const getProductsByMeal = async (
  mealId: string
): Promise<MealProductResponseDTO[]> => {
  return mealRepository.getProductsByMeal(mealId);
};

export const getProductsByDate = async (
  date: Date
): Promise<MealProductResponseDTO[]> => {
  return mealRepository.getProductsByDate(date);
};

export const addProductToMeal = async (
  mealId: string,
  data: CreateMealProductDTO
): Promise<MealProductResponseDTO> => {
  const meal = await mealRepository.getMealById(mealId);
  if (!meal) {
    throw new Error('Meal not found');
  }
  return mealRepository.addProductToMeal(mealId, data);
};

export const updateMealProduct = async (
  mealId: string,
  productId: string,
  data: UpdateMealProductDTO
): Promise<MealProductResponseDTO | null> => {
  return mealRepository.updateMealProduct(mealId, productId, data);
};

export const deleteMealProduct = async (
  mealId: string,
  productId: string
): Promise<boolean> => {
  return mealRepository.deleteMealProduct(mealId, productId);
};

export const getMealsByDateWithProducts = async (
  date: Date
): Promise<Array<MealResponseDTO & { products: MealProductResponseDTO[] }>> => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const meals = await mealRepository.getMeals({
    startDate: startOfDay,
    endDate: endOfDay,
  });

  const mealsWithProducts = await Promise.all(
    meals.map(async (meal) => {
      const products = await mealRepository.getProductsByMeal(meal.id);
      return { ...meal, products };
    })
  );

  return mealsWithProducts;
};
