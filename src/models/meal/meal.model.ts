import mongoose from 'mongoose';
import type { MealFields, MealMethods, MealModel } from './meal.model.types.js';
import { MEAL_TYPES } from '../../config/mealTypes.js';

const mealSchema = new mongoose.Schema<MealFields, MealModel, MealMethods>(
  {
    name: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
      maxlength: [100, 'Meal name cannot exceed 100 characters'],
    },
    mealType: {
      type: String,
      enum: Object.values(MEAL_TYPES),
      required: [true, 'Meal type is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    time: {
      type: String,
      trim: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Time must be in HH:MM format',
      ],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'body_harmony_meals',
  }
);

// Middleware - updates updatedAt before each save
mealSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

mealSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    name: obj.name,
    mealType: obj.mealType,
    date: obj.date,
    time: obj.time,
    notes: obj.notes,
    createdAt: obj.createdAt,
  };
};

export const Meal =
  (mongoose.models.Meal as MealModel) ||
  mongoose.model<MealFields, MealModel>('Meal', mealSchema);