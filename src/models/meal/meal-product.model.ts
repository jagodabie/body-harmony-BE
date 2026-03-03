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
    nutrientsPerPortion: {
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
  const obj = this.toObject();
  const raw = obj as Record<string, unknown>;

  return {
    id: obj._id.toString(),
    mealId: raw.mealId as MealProductPublicJSON['mealId'],
    productCode: String(raw.productCode),
    quantity: raw.quantity as number,
    unit: raw.unit as string,
    nutrientsPerPortion: raw.nutrientsPerPortion as MealProductPublicJSON['nutrientsPerPortion'],
    createdAt: raw.createdAt as Date,
    updatedAt: raw.updatedAt as Date,
  };
};

export const MealProduct =
  (mongoose.models.MealProduct as MealProductModel) ||
  mongoose.model<MealProductFields, MealProductModel>(
    'MealProduct',
    mealProductSchema
  );
