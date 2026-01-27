import mongoose from 'mongoose';

const dailyNutritionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      unique: true,
      index: true,
    },
    totalCalories: {
      type: Number,
      default: 0,
      min: [0, 'Calories cannot be negative'],
    },
    totalProteins: {
      type: Number,
      default: 0,
      min: [0, 'Proteins cannot be negative'],
    },
    totalCarbs: {
      type: Number,
      default: 0,
      min: [0, 'Carbs cannot be negative'],
    },
    totalFat: {
      type: Number,
      default: 0,
      min: [0, 'Fat cannot be negative'],
    },
    totalSugar: {
      type: Number,
      default: 0,
      min: [0, 'Sugar cannot be negative'],
    },
    totalSalt: {
      type: Number,
      default: 0,
      min: [0, 'Salt cannot be negative'],
    },
    meals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
      },
    ],
    mealCount: {
      type: Number,
      default: 0,
      min: [0, 'Meal count cannot be negative'],
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
    collection: 'body_harmony_daily_nutrition',
  }
);

// Middleware - updates updatedAt before each save
dailyNutritionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get nutrition by date
dailyNutritionSchema.statics.getNutritionByDate = function (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate('meals');
};

// Static method to get nutrition by date range
dailyNutritionSchema.statics.getNutritionByDateRange = function (
  startDate,
  endDate
) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: -1 })
    .populate('meals');
};

// Static method to calculate daily nutrition from meals
dailyNutritionSchema.statics.calculateDailyNutrition = async function (date) {
  const MealProduct = mongoose.model('MealProduct');
  const Meal = mongoose.model('Meal');

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all meals for the date
  const meals = await Meal.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  // Get all meal products for the date - use stored nutrition values
  const mealProducts = await MealProduct.find({
    mealId: { $in: meals.map((meal) => meal._id) },
  });

  // Calculate totals using stored nutrition values
  let totals = {
    totalCalories: 0,
    totalProteins: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalSugar: 0,
    totalSalt: 0,
  };

  mealProducts.forEach((mealProduct) => {
    // Use stored nutrition values (calculated by frontend)
    if (mealProduct.nutrition) {
      totals.totalCalories += mealProduct.nutrition.calories || 0;
      totals.totalProteins += mealProduct.nutrition.proteins || 0;
      totals.totalCarbs += mealProduct.nutrition.carbs || 0;
      totals.totalFat += mealProduct.nutrition.fat || 0;
      // Note: sugar and salt are not stored, so we keep them at 0 or calculate if needed
    }
  });

  // Round values
  Object.keys(totals).forEach((key) => {
    totals[key] = Math.round(totals[key] * 10) / 10;
  });

  // Create or update daily nutrition record
  const dailyNutrition = await this.findOneAndUpdate(
    { date: startOfDay },
    {
      ...totals,
      meals: meals.map((meal) => meal._id),
      mealCount: meals.length,
    },
    { upsert: true, new: true }
  );

  return dailyNutrition;
};

// Instance method to format data
dailyNutritionSchema.methods.toPublicJSON = function () {
  const nutrition = this.toObject();
  delete nutrition.__v;
  return nutrition;
};

export default mongoose.model('DailyNutrition', dailyNutritionSchema);
