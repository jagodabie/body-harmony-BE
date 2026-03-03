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

export interface MealProductNutrients {
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
  nutrientsPerPortion: MealProductNutrients;
  createdAt: Date;
  updatedAt: Date;
}

/** Mongo-only: instance methods */
export interface MealProductMethods {
  toPublicJSON(): MealProductPublicJSON;
}

/** Shape returned by toPublicJSON */
export interface MealProductPublicJSON {
  id: string;
  mealId: Types.ObjectId;
  productCode: string;
  quantity: number;
  unit: string;
  nutrientsPerPortion: MealProductNutrients;
  createdAt: Date;
  updatedAt: Date;
}

export type MealProductModel = Model<
  MealProductFields,
  object,
  MealProductMethods
>;
