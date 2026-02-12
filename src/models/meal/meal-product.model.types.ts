import type { Model, Types } from 'mongoose';

/** Unit for meal product quantity */
export type MealProductUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'pieces'
  | 'cups'
  | 'tbsp'
  | 'tsp';

/** Nutrition values stored per meal product */
export interface MealProductNutrition {
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
}

/** Mongo-only: document fields (used by Mongoose schema) */
export interface MealProductFields {
  mealId: Types.ObjectId;
  productCode: string;
  quantity: number;
  unit: MealProductUnit;
  nutrition: MealProductNutrition;
  createdAt: Date;
  updatedAt: Date;
}

/** Mongo-only: instance methods */
export interface MealProductMethods {
  toPublicJSON(): MealProductPublicJSON;
}

/** Shape returned by toPublicJSON (with optional populated product data) */
export interface MealProductPublicJSON {
  _id: Types.ObjectId;
  mealId: Types.ObjectId;
  productCode: string | { name?: string; code?: string; nutriments?: unknown; brands?: string };
  quantity: number;
  unit: string;
  nutrition: MealProductNutrition;
  nutritionPer100g?: MealProductNutrition;
  createdAt: Date;
  updatedAt: Date;
}

export type MealProductModel = Model<
  MealProductFields,
  object,
  MealProductMethods
>;
