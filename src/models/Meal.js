const mongoose = require('mongoose');
const { MEAL_TYPES } = require('../config/mealTypes');

const mealSchema = new mongoose.Schema(
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

// Static method to get meals by date
mealSchema.statics.getMealsByDate = function (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).sort({ time: 1 }); // Sort by time ascending
};

// Static method to get meals by date range
mealSchema.statics.getMealsByDateRange = function (startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1, time: 1 });
};

mealSchema.statics.MEAL_TYPES = MEAL_TYPES;

// Instance method to format data
mealSchema.methods.toPublicJSON = function () {
  const meal = this.toObject();
  delete meal.__v;
  return meal;
};

module.exports = mongoose.model('Meal', mealSchema);
