import type { Model } from 'mongoose';
import type { MealType } from '../../types/index.js';

/** Mongo-only: document fields (used by Mongoose schema) */
export interface MealFields {
  name: string;
  mealType: MealType;
  date: Date;
  time?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Mongo-only: instance methods */
export interface MealMethods {
  toPublicJSON(): {
    id: string;
    name: string;
    mealType: MealType;
    date: Date;
    time?: string;
    notes?: string;
    createdAt: Date;
  };
}

export type MealModel = Model<MealFields, object, MealMethods>;
