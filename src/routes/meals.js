const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const MealProduct = require('../models/MealProduct');
const Product = require('../models/Product');
const DailyNutrition = require('../models/DailyNutrition');
const { MEAL_TYPES } = require("../config/mealTypes");

/**
 * @swagger
 * /meals:
 *   get:
 *     summary: Get all meals with their products and nutrition
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter meals by specific date
 *         example: "2025-11-24"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter
 *     responses:
 *       200:
 *         description: List of meals with products and nutrition
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Meal'
 *                   - type: object
 *                     properties:
 *                       products:
 *                         type: array
 *                         items:
 *                           allOf:
 *                             - $ref: '#/components/schemas/MealProduct'
 *                             - type: object
 *                               properties:
 *                                 nutrition:
 *                                   type: object
 *                                   properties:
 *                                     calories:
 *                                       type: number
 *                                     proteins:
 *                                       type: number
 *                                     carbs:
 *                                       type: number
 *                                     fat:
 *                                       type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let meals;

    if (date) {
      meals = await Meal.getMealsByDate(new Date(date));
    } else if (startDate && endDate) {
      meals = await Meal.getMealsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      meals = await Meal.find().sort({ date: -1, time: 1 }).limit(50);
    }

    // Get products with stored nutrition for each meal
    const mealsWithProducts = await Promise.all(
      meals.map(async (meal) => {
        const products = await MealProduct.getProductsByMeal(meal._id);

        // Products already have nutrition from aggregation
        return {
          ...meal.toPublicJSON(),
          products: products, // Already includes nutrition field
        };
      })
    );

    res.json(mealsWithProducts);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /meals/with-products:
 *   get:
 *     summary: Get all meals with their products
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter meals by specific date
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter
 *     responses:
 *       200:
 *         description: List of meals with products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Meal'
 *                   - type: object
 *                     properties:
 *                       products:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/MealProduct'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /meals/by-date/{date}/with-products:
 *   get:
 *     summary: Get meals for a specific date with products
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: "2025-11-24"
 *     responses:
 *       200:
 *         description: Meals for the date with products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                 meals:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Meal'
 *                       - type: object
 *                         properties:
 *                           products:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/MealProduct'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /meals/by-range/{startDate}/{endDate}/with-products:
 *   get:
 *     summary: Get meals for a date range with products
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *         example: "2025-11-01"
 *       - in: path
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *         example: "2025-11-30"
 *     responses:
 *       200:
 *         description: Meals for the date range with products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 meals:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Meal'
 *                       - type: object
 *                         properties:
 *                           products:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/MealProduct'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /meals/{id}:
 *   get:
 *     summary: Get a specific meal with its products
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     responses:
 *       200:
 *         description: Meal with products
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Meal'
 *                 - type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MealProduct'
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /meals:
 *   post:
 *     summary: Create a new meal with products and nutrition
 *     tags: [Meals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *               - mealType
 *               - products
 *             properties:
 *               name:
 *                 type: string
 *                 example: "BREAKFAST"
 *                 maxLength: 100
 *               mealType:
 *                 type: string
 *                 enum: [BREAKFAST, LUNCH, DINNER, SNACK, SUPPER]
 *                 example: "BREAKFAST"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-24T00:00:00.000Z"
 *               time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "10:00"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Good breakfast"
 *               products:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of products with nutrition calculated by frontend
 *                 items:
 *                   type: object
 *                   required:
 *                     - productCode
 *                     - quantity
 *                     - nutrition
 *                   properties:
 *                     productCode:
 *                       type: string
 *                       description: Product EAN code
 *                       example: "5901234567890"
 *                     quantity:
 *                       type: number
 *                       minimum: 0.1
 *                       example: 100
 *                     unit:
 *                       type: string
 *                       enum: [g, kg, ml, l, pieces, cups, tbsp, tsp]
 *                       default: g
 *                       example: "g"
 *                     nutrition:
 *                       type: object
 *                       required:
 *                         - calories
 *                         - proteins
 *                         - carbs
 *                         - fat
 *                       properties:
 *                         calories:
 *                           type: number
 *                           example: 250
 *                         proteins:
 *                           type: number
 *                           example: 10.5
 *                         carbs:
 *                           type: number
 *                           example: 30.2
 *                         fat:
 *                           type: number
 *                           example: 5.1
 *     responses:
 *       201:
 *         description: Meal created successfully with products and nutrition
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Meal'
 *                 - type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/MealProduct'
 *                           - type: object
 *                             properties:
 *                               nutrition:
 *                                 type: object
 *                                 properties:
 *                                   calories:
 *                                     type: number
 *                                     example: 250
 *                                   proteins:
 *                                     type: number
 *                                     example: 10.5
 *                                   carbs:
 *                                     type: number
 *                                     example: 30.2
 *                                   fat:
 *                                     type: number
 *                                     example: 5.1
 *             examples:
 *               success:
 *                 summary: Meal with products
 *                 value:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   name: "BREAKFAST"
 *                   mealType: "BREAKFAST"
 *                   date: "2025-11-24T00:00:00.000Z"
 *                   time: "10:00"
 *                   notes: "Good breakfast"
 *                   createdAt: "2025-11-30T12:37:10.075Z"
 *                   updatedAt: "2025-11-30T12:37:10.075Z"
 *                   products:
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       mealId: "507f1f77bcf86cd799439011"
 *                       productCode:
 *                         name: "Product Name"
 *                         code: "5901234567890"
 *                         nutriments: {}
 *                         brands: "Brand Name"
 *                       quantity: 100
 *                       unit: "g"
 *                       nutrition:
 *                         calories: 250
 *                         proteins: 10.5
 *                         carbs: 30.2
 *                         fat: 5.1
 *                       createdAt: "2025-11-30T12:37:10.075Z"
 *                       updatedAt: "2025-11-30T12:37:10.075Z"
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { name, date, time, notes, mealType, products } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: "Name and date are required" });
    }

    if (!mealType) {
      return res.status(400).json({ error: "Meal type is required" });
    }

    // Validate meal type
    if (!Object.values(MEAL_TYPES).includes(mealType)) {
      return res.status(400).json({
        error: "Invalid meal type",
        validTypes: Object.values(MEAL_TYPES),
      });
    }

    // Validate products - always required
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error:
          "Products array is required and must contain at least one product",
      });
    }

    // Create meal
    const meal = new Meal({
      name,
      mealType,
      date: new Date(date),
      time,
      notes,
    });

    await meal.save();

    // Add products to the meal
    const addedProducts = [];
    for (const productData of products) {
      const { productCode, quantity, unit, nutrition } = productData;

      if (!productCode || !quantity) {
        return res.status(400).json({
          error: "Each product must have productCode and quantity",
        });
      }

      // Validate nutrition values (required from frontend)
      if (!nutrition || typeof nutrition !== "object") {
        return res.status(400).json({
          error:
            "Each product must have nutrition object with calories, proteins, carbs, fat",
        });
      }

      // Check if product exists
      const product = await Product.findOne({ code: productCode.toString() });
      if (!product) {
        return res.status(404).json({
          error: `Product not found: ${productCode}`,
        });
      }

      const mealProduct = new MealProduct({
        mealId: meal._id,
        productCode: productCode.toString(),
        quantity,
        unit: unit || "g",
        nutrition: {
          calories: nutrition.calories || 0,
          proteins: nutrition.proteins || 0,
          carbs: nutrition.carbs || 0,
          fat: nutrition.fat || 0,
        },
      });

      await mealProduct.save();
      addedProducts.push(mealProduct.toPublicJSON());
    }

    // Recalculate daily nutrition
    await DailyNutrition.calculateDailyNutrition(meal.date);

    // Return meal with products
    const response = {
      ...meal.toPublicJSON(),
      products: addedProducts,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /meals/{id}:
 *   put:
 *     summary: Update a meal
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               mealType:
 *                 type: string
 *                 enum: [BREAKFAST, LUNCH, DINNER, SNACK, SUPPER]
 *               date:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Meal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meal'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, date, time, notes, mealType } = req.body;

    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    // Validate meal type if provided
    if (mealType && !Object.values(MEAL_TYPES).includes(mealType)) {
      return res.status(400).json({
        error: 'Invalid meal type',
        validTypes: Object.values(MEAL_TYPES),
      });
    }

    const oldDate = meal.date;

    meal.name = name || meal.name;
    meal.mealType = mealType || meal.mealType;
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

/**
 * @swagger
 * /meals/{id}:
 *   delete:
 *     summary: Delete a meal and all its products
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Meal deleted successfully"
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /meals/{id}/products:
 *   post:
 *     summary: Add a product to an existing meal
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productCode
 *               - quantity
 *               - nutrition
 *             properties:
 *               productCode:
 *                 type: string
 *                 description: Product EAN code
 *                 example: "5901234567890"
 *               quantity:
 *                 type: number
 *                 minimum: 0.1
 *                 description: Quantity of the product
 *                 example: 100
 *               unit:
 *                 type: string
 *                 enum: [g, kg, ml, l, pieces, cups, tbsp, tsp]
 *                 default: g
 *                 example: "g"
 *               nutrition:
 *                 type: object
 *                 required:
 *                   - calories
 *                   - proteins
 *                   - carbs
 *                   - fat
 *                 properties:
 *                   calories:
 *                     type: number
 *                     example: 250
 *                   proteins:
 *                     type: number
 *                     example: 10.5
 *                   carbs:
 *                     type: number
 *                     example: 30.2
 *                   fat:
 *                     type: number
 *                     example: 5.1
 *     responses:
 *       201:
 *         description: Product added to meal successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealProduct'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Meal or product not found
 *       500:
 *         description: Server error
 */
router.post("/:id/products", async (req, res) => {
  try {
    const { productCode, quantity, unit, nutrition } = req.body;

    if (!productCode || !quantity) {
      return res
        .status(400)
        .json({ error: "Product code and quantity are required" });
    }

    // Validate nutrition values (required from frontend)
    if (!nutrition || typeof nutrition !== "object") {
      return res.status(400).json({
        error:
          "Nutrition object is required with calories, proteins, carbs, fat",
      });
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
      nutrition: {
        calories: nutrition.calories || 0,
        proteins: nutrition.proteins || 0,
        carbs: nutrition.carbs || 0,
        fat: nutrition.fat || 0,
      },
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

/**
 * @swagger
 * /meals/{id}/products/{productId}:
 *   put:
 *     summary: Update a product in a meal
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MealProduct ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 0.1
 *                 example: 150
 *               unit:
 *                 type: string
 *                 enum: [g, kg, ml, l, pieces, cups, tbsp, tsp]
 *                 example: "g"
 *               nutrition:
 *                 type: object
 *                 properties:
 *                   calories:
 *                     type: number
 *                   proteins:
 *                     type: number
 *                   carbs:
 *                     type: number
 *                   fat:
 *                     type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealProduct'
 *       404:
 *         description: Product not found in meal
 *       500:
 *         description: Server error
 */
router.put("/:id/products/:productId", async (req, res) => {
  try {
    const { quantity, unit, nutrition } = req.body;

    const mealProduct = await MealProduct.findOne({
      mealId: req.params.id,
      _id: req.params.productId,
    });

    if (!mealProduct) {
      return res.status(404).json({ error: "Product not found in meal" });
    }

    if (quantity !== undefined) mealProduct.quantity = quantity;
    if (unit !== undefined) mealProduct.unit = unit;
    if (nutrition !== undefined) {
      mealProduct.nutrition = {
        calories: nutrition.calories || 0,
        proteins: nutrition.proteins || 0,
        carbs: nutrition.carbs || 0,
        fat: nutrition.fat || 0,
      };
    }

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

/**
 * @swagger
 * /meals/{id}/products/{productId}:
 *   delete:
 *     summary: Remove a product from a meal
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MealProduct ID
 *     responses:
 *       200:
 *         description: Product removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product removed from meal successfully"
 *       404:
 *         description: Product not found in meal
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /meals/add-product:
 *   post:
 *     summary: Add product to meal (creates meal if it doesn't exist)
 *     description: This endpoint automatically creates a meal if one doesn't exist for the given mealType and date
 *     tags: [Meals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealType
 *               - date
 *               - productCode
 *               - quantity
 *               - nutrition
 *             properties:
 *               mealType:
 *                 type: string
 *                 enum: [BREAKFAST, LUNCH, DINNER, SNACK, SUPPER]
 *                 example: "BREAKFAST"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-24T00:00:00.000Z"
 *               time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "10:00"
 *               productCode:
 *                 type: string
 *                 description: Product EAN code
 *                 example: "5901234567890"
 *               quantity:
 *                 type: number
 *                 minimum: 0.1
 *                 example: 100
 *               unit:
 *                 type: string
 *                 enum: [g, kg, ml, l, pieces, cups, tbsp, tsp]
 *                 default: g
 *                 example: "g"
 *               nutrition:
 *                 type: object
 *                 required:
 *                   - calories
 *                   - proteins
 *                   - carbs
 *                   - fat
 *                 properties:
 *                   calories:
 *                     type: number
 *                     example: 250
 *                   proteins:
 *                     type: number
 *                     example: 10.5
 *                   carbs:
 *                     type: number
 *                     example: 30.2
 *                   fat:
 *                     type: number
 *                     example: 5.1
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Good breakfast"
 *     responses:
 *       201:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meal:
 *                   $ref: '#/components/schemas/Meal'
 *                 mealProduct:
 *                   $ref: '#/components/schemas/MealProduct'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post("/add-product", async (req, res) => {
  try {
    const {
      mealType, // "BREAKFAST", "LUNCH", "DINNER"
      date,
      time,
      productCode,
      quantity,
      unit,
      nutrition,
      notes,
    } = req.body;

    // Walidacja wymaganych pól
    if (!mealType || !date || !productCode || !quantity) {
      return res.status(400).json({
        error: "mealType, date, productCode and quantity are required",
      });
    }

    // Validate nutrition values (required from frontend)
    if (!nutrition || typeof nutrition !== "object") {
      return res.status(400).json({
        error:
          "Nutrition object is required with calories, proteins, carbs, fat",
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
      nutrition: {
        calories: nutrition.calories || 0,
        proteins: nutrition.proteins || 0,
        carbs: nutrition.carbs || 0,
        fat: nutrition.fat || 0,
      },
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

