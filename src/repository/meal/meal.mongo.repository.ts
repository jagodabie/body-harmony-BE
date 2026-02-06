import  { Meal } from '../../models/meal/meal.model.js';
import type {
  MealFilters,
  MealResponseDTO,
  CreateMealDTO,
  UpdateMealDTO,
} from './meal.types.js';
import type { MealRepository } from './meal.repository.js';

export class MongoMealRepository implements MealRepository {
  async getMeals(filters: MealFilters): Promise<MealResponseDTO[]> {
    const query: {
      date?: { $gte: Date | string; $lte: Date | string };
      mealType?: string;
    } = {};

    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    if (filters.mealType) {
      query.mealType = filters.mealType;
    }

    const results = await Meal.find(query).sort({ date: -1, time: 1 });
    return results.map((doc) => doc.toPublicJSON());
  }

  async getMealById(id: string): Promise<MealResponseDTO | null> {
    const doc = await Meal.findById(id);
    return doc ? doc.toPublicJSON() : null;
  }

  async updateMealById(
    id: string,
    data: UpdateMealDTO
  ): Promise<MealResponseDTO | null> {
    const doc = await Meal.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return doc ? doc.toPublicJSON() : null;
  }

  async createMeal(data: CreateMealDTO): Promise<MealResponseDTO> {
    const doc = await Meal.create(data);
    return doc.toPublicJSON();
  }

  async deleteMealById(id: string): Promise<void> {
    await Meal.findByIdAndDelete(id);
  }

  async deleteMany(): Promise<void> {
    await Meal.deleteMany({});
  }

  async insertMany(data: CreateMealDTO[]): Promise<MealResponseDTO[]> {
    const docs = await Meal.insertMany(data);
    return docs.map((doc) => doc.toPublicJSON());
  }
}
