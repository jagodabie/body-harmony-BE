const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const MealProduct = require('../models/MealProduct');
const Product = require('../models/Product');
const DailyNutrition = require('../models/DailyNutrition');
const { MEAL_TYPES } = require("../config/mealTypes");

// GET /meals - Get all meals with optional date filter
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let meals;

    if (date) {
      meals = await Meal.getMealsByDate(new Date(date));
    } else if (startDate && endDate) {
      meals = await Meal.getMealsByDateRange(new Date(startDate), new Date(endDate));
    } else {
      meals = await Meal.find().sort({ date: -1, time: 1 }).limit(50);
    }

    res.json(meals.map(meal => meal.toPublicJSON()));
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /meals/with-products - Get all meals with their products
router.get('/with-products', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let meals;

    if (date) {
      meals = await Meal.getMealsByDate(new Date(date));
    } else if (startDate && endDate) {
      meals = await Meal.getMealsByDateRange(new Date(startDate), new Date(endDate));
    } else {
      meals = await Meal.find().sort({ date: -1, time: 1 }).limit(50);
    }

    // Get products for each meal
    const mealsWithProducts = await Promise.all(meals.map(async (meal) => {
      const products = await MealProduct.getProductsByMeal(meal._id);
      return {
        ...meal.toPublicJSON(),
        products: products // aggregation already returns plain objects
      };
    }));

    res.json(mealsWithProducts);
  } catch (error) {
    console.error('Error fetching meals with products:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /meals/by-date/:date/with-products - Get meals for specific date with products
router.get('/by-date/:date/with-products', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const meals = await Meal.getMealsByDate(date);

    // Get products for each meal
    const mealsWithProducts = await Promise.all(meals.map(async (meal) => {
      const products = await MealProduct.getProductsByMeal(meal._id);
      return {
        ...meal.toPublicJSON(),
        products: products // aggregation already returns plain objects
      };
    }));

    res.json({
      date: date.toISOString().split('T')[0],
      meals: mealsWithProducts
    });
  } catch (error) {
    console.error('Error fetching meals by date with products:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /meals/by-range/:startDate/:endDate/with-products - Get meals for date range with products
router.get('/by-range/:startDate/:endDate/with-products', async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    const meals = await Meal.getMealsByDateRange(startDate, endDate);

    // Get products for each meal
    const mealsWithProducts = await Promise.all(meals.map(async (meal) => {
      const products = await MealProduct.getProductsByMeal(meal._id);
      return {
        ...meal.toPublicJSON(),
        products: products // aggregation already returns plain objects
      };
    }));

    res.json({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      meals: mealsWithProducts
    });
  } catch (error) {
    console.error('Error fetching meals by date range with products:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /meals/:id - Get specific meal with products
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const products = await MealProduct.getProductsByMeal(req.params.id);
    
    res.json({
      ...meal.toPublicJSON(),
      products: products, // aggregation already returns plain objects
    });
  } catch (error) {
    console.error('Error fetching meal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// POST /meals - Create new meal
router.post('/', async (req, res) => {
  try {
    const { name, date, time, notes } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }

    const meal = new Meal({
      name,
      date: new Date(date),
      time,
      notes
    });

    await meal.save();

    // Recalculate daily nutrition
    await DailyNutrition.calculateDailyNutrition(meal.date);

    res.status(201).json(meal.toPublicJSON());
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// PUT /meals/:id - Update meal
router.put('/:id', async (req, res) => {
  try {
    const { name, date, time, notes } = req.body;

    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const oldDate = meal.date;

    meal.name = name || meal.name;
    meal.date = date ? new Date(date) : meal.date;
    meal.time = time !== undefined ? time : meal.time;
    meal.notes = notes !== undefined ? notes : meal.notes;

    await meal.save();

    // Recalculate daily nutrition for both old and new dates
    await DailyNutrition.calculateDailyNutrition(oldDate);
    if (date && new Date(date).toDateString() !== oldDate.toDateString()) {
      await DailyNutrition.calculateDailyNutrition(new Date(date));
    }

    res.json(meal.toPublicJSON());
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// DELETE /meals/:id - Delete meal
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const mealDate = meal.date;

    // Delete all products in this meal
    await MealProduct.deleteMany({ mealId: req.params.id });

    // Delete the meal
    await Meal.findByIdAndDelete(req.params.id);

    // Recalculate daily nutrition
    await DailyNutrition.calculateDailyNutrition(mealDate);

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// POST /meals/:id/products - Add product to meal
router.post("/:id/products", async (req, res) => {
  try {
    const { productCode, quantity, unit } = req.body;

    if (!productCode || !quantity) {
      return res
        .status(400)
        .json({ error: "Product code and quantity are required" });
    }

    // Check if meal exists
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Check if product exists
    const product = await Product.findOne({ code: productCode.toString() });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const mealProduct = new MealProduct({
      mealId: req.params.id,
      productCode: productCode.toString(),
      quantity,
      unit: unit || "g",
    });

    await mealProduct.save();

    // Recalculate daily nutrition
    await DailyNutrition.calculateDailyNutrition(meal.date);

    res.status(201).json(mealProduct.toPublicJSON());
  } catch (error) {
    console.error("Error adding product to meal:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// PUT /meals/:id/products/:productId - Update product in meal
router.put("/:id/products/:productId", async (req, res) => {
  try {
    const { quantity, unit } = req.body;

    const mealProduct = await MealProduct.findOne({
      mealId: req.params.id,
      _id: req.params.productId,
    });

    if (!mealProduct) {
      return res.status(404).json({ error: "Product not found in meal" });
    }

    if (quantity !== undefined) mealProduct.quantity = quantity;
    if (unit !== undefined) mealProduct.unit = unit;

    await mealProduct.save();

    // Get meal to recalculate daily nutrition
    const meal = await Meal.findById(req.params.id);
    if (meal) {
      await DailyNutrition.calculateDailyNutrition(meal.date);
    }

    res.json(mealProduct.toPublicJSON());
  } catch (error) {
    console.error("Error updating product in meal:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// DELETE /meals/:id/products/:productId - Remove product from meal
router.delete("/:id/products/:productId", async (req, res) => {
  try {
    const mealProduct = await MealProduct.findOneAndDelete({
      mealId: req.params.id,
      _id: req.params.productId,
    });

    if (!mealProduct) {
      return res.status(404).json({ error: "Product not found in meal" });
    }

    // Get meal to recalculate daily nutrition
    const meal = await Meal.findById(req.params.id);
    if (meal) {
      await DailyNutrition.calculateDailyNutrition(meal.date);
    }

    res.json({ message: "Product removed from meal successfully" });
  } catch (error) {
    console.error("Error removing product from meal:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// POST /meals/add-product - Dodaj produkt do posiłku (utwórz posiłek jeśli nie istnieje)
router.post("/add-product", async (req, res) => {
  try {
    const {
      mealType, // "BREAKFAST", "LUNCH", "DINNER"
      date,
      time,
      productCode,
      quantity,
      unit,
      notes,
    } = req.body;

    // Walidacja wymaganych pól
    if (!mealType || !date || !productCode || !quantity) {
      return res.status(400).json({
        error: "mealType, date, productCode and quantity are required",
      });
    }

    // Walidacja typu posiłku
    if (!Object.values(MEAL_TYPES).includes(mealType)) {
      return res.status(400).json({
        error: "Invalid meal type",
        validTypes: Object.values(MEAL_TYPES),
      });
    }

    // Sprawdź czy posiłek już istnieje
    let meal = await Meal.findOne({
      mealType: mealType,
      date: new Date(date),
    });

    // Jeśli nie istnieje - utwórz go
    if (!meal) {
      meal = new Meal({
        name: mealType, // Backend używa angielskich nazw
        mealType: mealType,
        date: new Date(date),
        time: time || null,
        notes: notes || null,
      });
      await meal.save();
    }

    // Sprawdź czy produkt istnieje
    const product = await Product.findOne({ code: productCode.toString() });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Dodaj produkt do posiłku
    const mealProduct = new MealProduct({
      mealId: meal._id,
      productCode: productCode.toString(),
      quantity,
      unit: unit || "g",
    });

    await mealProduct.save();

    // Przelicz dzienną wartość odżywczą
    await DailyNutrition.calculateDailyNutrition(meal.date);

    res.status(201).json({
      meal: meal.toPublicJSON(),
      mealProduct: mealProduct.toPublicJSON(),
    });
  } catch (error) {
    console.error("Error adding product to meal:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

module.exports = router;

