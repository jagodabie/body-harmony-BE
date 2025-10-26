const mongoose = require('mongoose');

const dailyNutritionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Date is required"],
      unique: true,
      index: true
    },
    totalCalories: {
      type: Number,
      default: 0,
      min: [0, "Calories cannot be negative"]
    },
    totalProteins: {
      type: Number,
      default: 0,
      min: [0, "Proteins cannot be negative"]
    },
    totalCarbs: {
      type: Number,
      default: 0,
      min: [0, "Carbs cannot be negative"]
    },
    totalFat: {
      type: Number,
      default: 0,
      min: [0, "Fat cannot be negative"]
    },
    totalSugar: {
      type: Number,
      default: 0,
      min: [0, "Sugar cannot be negative"]
    },
    totalSalt: {
      type: Number,
      default: 0,
      min: [0, "Salt cannot be negative"]
    },
    meals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    }],
    mealCount: {
      type: Number,
      default: 0,
      min: [0, "Meal count cannot be negative"]
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "body_harmony_daily_nutrition"
  }
);

// Middleware - updates updatedAt before each save
dailyNutritionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get nutrition by date
dailyNutritionSchema.statics.getNutritionByDate = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('meals');
};

// Static method to get nutrition by date range
dailyNutritionSchema.statics.getNutritionByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 }).populate('meals');
};

// Static method to calculate daily nutrition from meals
dailyNutritionSchema.statics.calculateDailyNutrition = async function(date) {
  const MealProduct = mongoose.model("MealProduct");
  const Meal = mongoose.model("Meal");

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

  // Get all meal products for the date using aggregation
  const mealProducts = await MealProduct.aggregate([
    {
      $match: {
        mealId: { $in: meals.map((meal) => meal._id) },
      },
    },
    {
      $lookup: {
        from: "body_harmony_products_slim",
        localField: "productCode",
        foreignField: "code",
        as: "productCode",
      },
    },
    {
      $unwind: "$productCode",
    },
  ]);

  // Calculate totals
  let totals = {
    totalCalories: 0,
    totalProteins: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalSugar: 0,
    totalSalt: 0,
  };

  mealProducts.forEach((mealProduct) => {
    // Calculate nutrition manually since mealProduct is from aggregation
    const product = mealProduct.productCode;
    const quantity = mealProduct.quantity;

    if (product && product.nutriments) {
      const multiplier = quantity / 100; // Convert to per 100g basis

      totals.totalCalories += Math.round(
        (product.nutriments["energy-kcal_100g"] || 0) * multiplier
      );
      totals.totalProteins +=
        Math.round((product.nutriments.proteins_100g || 0) * multiplier * 10) /
        10;
      totals.totalCarbs +=
        Math.round(
          (product.nutriments.carbohydrates_100g || 0) * multiplier * 10
        ) / 10;
      totals.totalFat +=
        Math.round((product.nutriments.fat_100g || 0) * multiplier * 10) / 10;
      totals.totalSugar +=
        Math.round((product.nutriments.sugars_100g || 0) * multiplier * 10) /
        10;
      totals.totalSalt +=
        Math.round((product.nutriments.salt_100g || 0) * multiplier * 10) / 10;
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
dailyNutritionSchema.methods.toPublicJSON = function() {
  const nutrition = this.toObject();
  delete nutrition.__v;
  return nutrition;
};

module.exports = mongoose.model('DailyNutrition', dailyNutritionSchema);

