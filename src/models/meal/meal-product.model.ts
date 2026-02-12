import mongoose from 'mongoose';
import type {
  MealProductFields,
  MealProductMethods,
  MealProductModel,
  MealProductPublicJSON,
} from './meal-product.model.types.js';

const mealProductSchema = new mongoose.Schema<
  MealProductFields,
  MealProductModel,
  MealProductMethods
>(
  {
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      required: [true, 'Meal ID is required'],
      index: true,
    },
    productCode: {
      type: String,
      ref: 'Product',
      required: [true, 'Product code is required'],
      index: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      default: 'g',
      enum: ['g', 'kg', 'ml', 'l', 'pieces', 'cups', 'tbsp', 'tsp'],
      trim: true,
    },
    nutrition: {
      calories: { type: Number, default: 0 },
      proteins: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'body_harmony_meal_products',
  }
);

mealProductSchema.methods.toPublicJSON = function (): MealProductPublicJSON {
  const mealProduct = this.toObject() as MealProductPublicJSON;
  delete (mealProduct as unknown as Record<string, unknown>).__v;

  const productCode = this.productCode as
    | string
    | { nutriments?: Record<string, unknown> }
    | undefined;
  if (
    productCode &&
    typeof productCode === 'object' &&
    productCode.nutriments
  ) {
    const nut = productCode.nutriments as Record<string, number | undefined>;
    mealProduct.nutritionPer100g = {
      calories: nut['energy-kcal_100g'] ?? 0,
      proteins: nut.proteins_100g ?? 0,
      carbs: nut.carbohydrates_100g ?? 0,
      fat: nut.fat_100g ?? 0,
    };
  }

  return mealProduct;
};

export const MealProduct =
  (mongoose.models.MealProduct as MealProductModel) ||
  mongoose.model<MealProductFields, MealProductModel>(
    'MealProduct',
    mealProductSchema
  );
