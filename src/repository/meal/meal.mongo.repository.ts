import mongoose from 'mongoose';
import { Meal } from '../../models/meal/meal.model.js';
import { MealProduct } from '../../models/meal/meal-product.model.js';
import Product from '../../models/Product.js';
import type {
  MealFilters,
  MealResponseDTO,
  CreateMealDTO,
  UpdateMealDTO,
  MealProductResponseDTO,
  CreateMealProductDTO,
  UpdateMealProductDTO,
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

  async getProductsByMeal(mealId: string): Promise<MealProductResponseDTO[]> {
    const results = await MealProduct.aggregate([
      { $match: { mealId: new mongoose.Types.ObjectId(mealId) } },
      {
        $lookup: {
          from: 'body_harmony_products_slim',
          localField: 'productCode',
          foreignField: 'code',
          as: 'productCode',
        },
      },
      {
        $unwind: {
          path: '$productCode',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          mealId: 1,
          productCode: {
            name: '$productCode.name',
            code: '$productCode.code',
            nutriments: '$productCode.nutriments',
            brands: '$productCode.brands',
          },
          quantity: 1,
          unit: 1,
          nutrition: 1,
          nutritionPer100g: {
            calories: { $ifNull: ['$productCode.nutriments.energy-kcal_100g', 0] },
            proteins: { $ifNull: ['$productCode.nutriments.proteins_100g', 0] },
            carbs: { $ifNull: ['$productCode.nutriments.carbohydrates_100g', 0] },
            fat: { $ifNull: ['$productCode.nutriments.fat_100g', 0] },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: 1 } },
    ]);
    return results as MealProductResponseDTO[];
  }

  async getProductsByDate(date: Date): Promise<MealProductResponseDTO[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results = await MealProduct.aggregate([
      {
        $lookup: {
          from: 'body_harmony_meals',
          localField: 'mealId',
          foreignField: '_id',
          as: 'meal',
        },
      },
      { $unwind: '$meal' },
      {
        $match: {
          'meal.date': { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: 'body_harmony_products_slim',
          localField: 'productCode',
          foreignField: 'code',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          mealId: 1,
          productCode: 1,
          quantity: 1,
          unit: 1,
          nutrition: 1,
          nutritionPer100g: {
            calories: { $ifNull: ['$product.nutriments.energy-kcal_100g', 0] },
            proteins: { $ifNull: ['$product.nutriments.proteins_100g', 0] },
            carbs: { $ifNull: ['$product.nutriments.carbohydrates_100g', 0] },
            fat: { $ifNull: ['$product.nutriments.fat_100g', 0] },
          },
          meal: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { 'meal.time': 1, createdAt: 1 } },
    ]);
    return results as MealProductResponseDTO[];
  }

  async addProductToMeal(
    mealId: string,
    data: CreateMealProductDTO
  ): Promise<MealProductResponseDTO> {
    const product = await Product.findOne({ code: data.productCode.toString() });
    if (!product) {
      throw new Error(`Product not found: ${data.productCode}`);
    }

    const doc = await MealProduct.create({
      mealId,
      productCode: data.productCode.toString(),
      quantity: data.quantity,
      unit: data.unit ?? 'g',
      nutrition: data.nutrition,
    });

    (doc as { productCode: unknown }).productCode = product;
    return doc.toPublicJSON() as MealProductResponseDTO;
  }

  async updateMealProduct(
    mealId: string,
    productId: string,
    data: UpdateMealProductDTO
  ): Promise<MealProductResponseDTO | null> {
    const doc = await MealProduct.findOne({
      mealId,
      _id: productId,
    });

    if (!doc) return null;

    if (data.quantity !== undefined) doc.quantity = data.quantity;
    if (data.unit !== undefined)
      doc.unit = data.unit as (typeof doc)['unit'];
    if (data.nutrition !== undefined) doc.nutrition = data.nutrition;

    await doc.save();

    const product = await Product.findOne({ code: doc.productCode });
    if (product) {
      (doc as { productCode: unknown }).productCode = product;
    }
    return doc.toPublicJSON() as MealProductResponseDTO;
  }

  async deleteMealProduct(
    mealId: string,
    productId: string
  ): Promise<boolean> {
    const result = await MealProduct.findOneAndDelete({
      mealId,
      _id: productId,
    });
    return result != null;
  }

  async deleteProductsByMealId(mealId: string): Promise<void> {
    await MealProduct.deleteMany({ mealId });
  }
}
