import type {
  MealFilters,
  CreateMealDTO,
  UpdateMealDTO,
  MealResponseDTO,
  MealProductResponseDTO,
  CreateMealProductDTO,
  UpdateMealProductDTO,
  DailyMealsSummaryDTO,
} from '../../repository/meal/meal.types.js';
import { mealRepository } from '../../repository/meal/meal.instance.js';
import { calculateMealMacros, roundNutrients } from '../../helpers/nutrition.js';

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
  const date = new Date(mealData.date);
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existing = await mealRepository.getMeals({
    startDate: startOfDay,
    endDate: endOfDay,
    mealType: mealData.mealType,
  });

  if (existing.length > 0) {
    throw new Error('MEAL_ALREADY_EXISTS');
  }

  const newMeal = await mealRepository.createMeal(mealData);

  if (mealData.products && mealData.products.length > 0) {
    await Promise.all(
      mealData.products.map((product) =>
        mealRepository.addProductToMeal(newMeal.id, product)
      )
    );

    const mealWithProducts = await mealRepository.getMealById(newMeal.id);
    if (mealWithProducts) {
      return mealWithProducts;
    }
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
): Promise<DailyMealsSummaryDTO> => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const meals = await mealRepository.getMeals({
    startDate: startOfDay,
    endDate: endOfDay,
  });

  const mealsWithMacros = await Promise.all(
    meals.map(async (meal) => {
      const products = await mealRepository.getProductsByMeal(meal.id);
      const roundedProducts = products.map((p) => ({
        ...p,
        nutrientsPer100g: p.nutrientsPer100g && roundNutrients(p.nutrientsPer100g),
      }));
      const macros = calculateMealMacros(
        roundedProducts.map((product) => product.nutrientsPerPortion)
      );
      return { ...meal, macros, products: roundedProducts };
    })
  );
  const dailyTotals = calculateMealMacros(
    mealsWithMacros.map((meal) => meal.macros)
  );

  return {
    date: date.toISOString().split('T')[0],
    meals: mealsWithMacros,
    dailyTotals,
  };
};
