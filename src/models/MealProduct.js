const mongoose = require('mongoose');

const mealProductSchema = new mongoose.Schema(
  {
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: [true, "Meal ID is required"],
      index: true,
    },
    productCode: {
      type: String,
      ref: "Product",
      required: [true, "Product code is required"],
      index: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.1, "Quantity must be greater than 0"],
    },
    unit: {
      type: String,
      default: "g",
      enum: ["g", "kg", "ml", "l", "pieces", "cups", "tbsp", "tsp"],
      trim: true,
    },
    // Nutrition values calculated by frontend and stored in BE
    nutrition: {
      calories: {
        type: Number,
        default: 0,
      },
      proteins: {
        type: Number,
        default: 0,
      },
      carbs: {
        type: Number,
        default: 0,
      },
      fat: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: "body_harmony_meal_products",
  }
);

// Static method to get products by meal
mealProductSchema.statics.getProductsByMeal = function (mealId) {
  return this.aggregate([
    {
      $match: { mealId: new mongoose.Types.ObjectId(mealId) },
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
    {
      $project: {
        mealId: 1,
        productCode: {
          name: "$productCode.name",
          code: "$productCode.code",
          nutriments: "$productCode.nutriments",
          brands: "$productCode.brands",
        },
        quantity: 1,
        unit: 1,
        nutrition: 1, // Include stored nutrition values
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: { createdAt: 1 },
    },
  ]);
};

// Static method to get products by date
mealProductSchema.statics.getProductsByDate = function (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $lookup: {
        from: "body_harmony_meals",
        localField: "mealId",
        foreignField: "_id",
        as: "meal",
      },
    },
    {
      $unwind: "$meal",
    },
    {
      $match: {
        "meal.date": {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $lookup: {
        from: "body_harmony_products_slim",
        localField: "productCode",
        foreignField: "code",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $sort: { "meal.time": 1, createdAt: 1 },
    },
  ]);
};

// Instance method to calculate nutritional values
mealProductSchema.methods.calculateNutrition = function () {
  const product = this.productCode;
  const quantity = this.quantity;

  if (!product || !product.nutriments) {
    return null;
  }

  const multiplier = quantity / 100; // Convert to per 100g basis

  return {
    calories: Math.round(
      (product.nutriments["energy-kcal_100g"] || 0) * multiplier
    ),
    proteins:
      Math.round((product.nutriments.proteins_100g || 0) * multiplier * 10) /
      10,
    carbs:
      Math.round(
        (product.nutriments.carbohydrates_100g || 0) * multiplier * 10
      ) / 10,
    fat: Math.round((product.nutriments.fat_100g || 0) * multiplier * 10) / 10,
    sugar:
      Math.round((product.nutriments.sugars_100g || 0) * multiplier * 10) / 10,
    salt:
      Math.round((product.nutriments.salt_100g || 0) * multiplier * 10) / 10,
  };
};

// Instance method to format data
mealProductSchema.methods.toPublicJSON = function() {
  const mealProduct = this.toObject();
  delete mealProduct.__v;
  return mealProduct;
};

module.exports = mongoose.model('MealProduct', mealProductSchema);

