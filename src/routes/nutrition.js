const express = require('express');
const router = express.Router();
const DailyNutrition = require('../models/DailyNutrition');
const Meal = require('../models/Meal');
const MealProduct = require('../models/MealProduct');

/**
 * @swagger
 * /nutrition/daily/{date}:
 *   get:
 *     summary: Get daily nutrition summary
 *     tags: [Nutrition]
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
 *         description: Daily nutrition summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyNutrition'
 *       500:
 *         description: Server error
 */
router.get('/daily/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);

    // Get or calculate daily nutrition
    let dailyNutrition = await DailyNutrition.getNutritionByDate(date);

    if (!dailyNutrition) {
      // Calculate if doesn't exist
      dailyNutrition = await DailyNutrition.calculateDailyNutrition(date);
    }

    if (!dailyNutrition) {
      return res.json({
        date: date.toISOString().split('T')[0],
        totalCalories: 0,
        totalProteins: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalSugar: 0,
        totalSalt: 0,
        mealCount: 0,
        meals: [],
      });
    }

    res.json(dailyNutrition.toPublicJSON());
  } catch (error) {
    console.error('Error fetching daily nutrition:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /nutrition/range:
 *   get:
 *     summary: Get nutrition summary for a date range
 *     tags: [Nutrition]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *         example: "2025-11-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *         example: "2025-11-30"
 *     responses:
 *       200:
 *         description: Nutrition data for date range
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DailyNutrition'
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Start date and end date are required' });
    }

    const nutrition = await DailyNutrition.getNutritionByDateRange(
      new Date(startDate),
      new Date(endDate)
    );

    res.json(nutrition.map((n) => n.toPublicJSON()));
  } catch (error) {
    console.error('Error fetching nutrition range:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /nutrition/daily/{date}/detailed:
 *   get:
 *     summary: Get detailed daily nutrition with meals and products
 *     description: Returns detailed nutrition breakdown including all meals, products, and calculated nutrition values
 *     tags: [Nutrition]
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
 *         description: Detailed nutrition data
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       mealType:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       time:
 *                         type: string
 *                       products:
 *                         type: array
 *                       totals:
 *                         type: object
 *                         properties:
 *                           calories:
 *                             type: number
 *                           proteins:
 *                             type: number
 *                           carbs:
 *                             type: number
 *                           fat:
 *                             type: number
 *                           sugar:
 *                             type: number
 *                           salt:
 *                             type: number
 *                 totals:
 *                   type: object
 *                   properties:
 *                     totalCalories:
 *                       type: number
 *                     totalProteins:
 *                       type: number
 *                     totalCarbs:
 *                       type: number
 *                     totalFat:
 *                       type: number
 *                     totalSugar:
 *                       type: number
 *                     totalSalt:
 *                       type: number
 *       500:
 *         description: Server error
 */
router.get('/daily/:date/detailed', async (req, res) => {
  try {
    const date = new Date(req.params.date);

    // Get meals for the date
    const meals = await Meal.getMealsByDate(date);

    // Get all products for the date
    const mealProducts = await MealProduct.getProductsByDate(date);

    // Calculate totals
    let totals = {
      totalCalories: 0,
      totalProteins: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalSugar: 0,
      totalSalt: 0,
    };

    const mealsWithProducts = await Promise.all(
      meals.map(async (meal) => {
        const products = await MealProduct.getProductsByMeal(meal._id);

        let mealTotals = {
          calories: 0,
          proteins: 0,
          carbs: 0,
          fat: 0,
          sugar: 0,
          salt: 0,
        };

        const productsWithNutrition = products.map((mp) => {
          // Calculate nutrition manually since mp is from aggregation
          const product = mp.productCode;
          const quantity = mp.quantity;
          let nutrition = null;

          if (product && product.nutriments) {
            const multiplier = quantity / 100; // Convert to per 100g basis

            nutrition = {
              calories: Math.round(
                (product.nutriments['energy-kcal_100g'] || 0) * multiplier
              ),
              proteins:
                Math.round(
                  (product.nutriments.proteins_100g || 0) * multiplier * 10
                ) / 10,
              carbs:
                Math.round(
                  (product.nutriments.carbohydrates_100g || 0) * multiplier * 10
                ) / 10,
              fat:
                Math.round(
                  (product.nutriments.fat_100g || 0) * multiplier * 10
                ) / 10,
              sugar:
                Math.round(
                  (product.nutriments.sugars_100g || 0) * multiplier * 10
                ) / 10,
              salt:
                Math.round(
                  (product.nutriments.salt_100g || 0) * multiplier * 10
                ) / 10,
            };

            if (nutrition) {
              mealTotals.calories += nutrition.calories;
              mealTotals.proteins += nutrition.proteins;
              mealTotals.carbs += nutrition.carbs;
              mealTotals.fat += nutrition.fat;
              mealTotals.sugar += nutrition.sugar;
              mealTotals.salt += nutrition.salt;
            }
          }

          return {
            ...mp, // mp is already a plain object from aggregation
            nutrition: nutrition || {},
          };
        });

        // Round meal totals
        Object.keys(mealTotals).forEach((key) => {
          mealTotals[key] = Math.round(mealTotals[key] * 10) / 10;
        });

        // Add to overall totals
        Object.keys(totals).forEach((key) => {
          totals[key] += mealTotals[key.replace('total', '').toLowerCase()];
        });

        return {
          ...meal.toPublicJSON(),
          products: productsWithNutrition,
          totals: mealTotals,
        };
      })
    );

    // Round overall totals
    Object.keys(totals).forEach((key) => {
      totals[key] = Math.round(totals[key] * 10) / 10;
    });

    res.json({
      date: date.toISOString().split('T')[0],
      meals: mealsWithProducts,
      totals,
    });
  } catch (error) {
    console.error('Error fetching detailed daily nutrition:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /nutrition/daily/{date}/recalculate:
 *   post:
 *     summary: Recalculate daily nutrition for a specific date
 *     description: Forces recalculation of daily nutrition values based on all meals and products for the date
 *     tags: [Nutrition]
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
 *         description: Daily nutrition recalculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyNutrition'
 *       500:
 *         description: Server error
 */
router.post('/daily/:date/recalculate', async (req, res) => {
  try {
    const date = new Date(req.params.date);

    const dailyNutrition = await DailyNutrition.calculateDailyNutrition(date);

    res.json(dailyNutrition.toPublicJSON());
  } catch (error) {
    console.error('Error recalculating daily nutrition:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /nutrition/stats:
 *   get:
 *     summary: Get nutrition statistics for a period
 *     description: Returns average nutrition values for the specified number of days
 *     tags: [Nutrition]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to calculate statistics for
 *         example: 30
 *     responses:
 *       200:
 *         description: Nutrition statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   example: "30 days"
 *                 averageCalories:
 *                   type: number
 *                   description: Average calories per day
 *                 averageProteins:
 *                   type: number
 *                   description: Average proteins per day (g)
 *                 averageCarbs:
 *                   type: number
 *                   description: Average carbohydrates per day (g)
 *                 averageFat:
 *                   type: number
 *                   description: Average fat per day (g)
 *                 totalDays:
 *                   type: number
 *                   description: Total number of days in the period
 *                 daysWithMeals:
 *                   type: number
 *                   description: Number of days that have meals
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const nutrition = await DailyNutrition.getNutritionByDateRange(
      startDate,
      endDate
    );

    if (nutrition.length === 0) {
      return res.json({
        period: `${days} days`,
        averageCalories: 0,
        averageProteins: 0,
        averageCarbs: 0,
        averageFat: 0,
        totalDays: 0,
        daysWithMeals: 0,
      });
    }

    const totals = nutrition.reduce(
      (acc, day) => ({
        calories: acc.calories + day.totalCalories,
        proteins: acc.proteins + day.totalProteins,
        carbs: acc.carbs + day.totalCarbs,
        fat: acc.fat + day.totalFat,
      }),
      { calories: 0, proteins: 0, carbs: 0, fat: 0 }
    );

    const daysWithMeals = nutrition.filter((day) => day.mealCount > 0).length;

    res.json({
      period: `${days} days`,
      averageCalories: Math.round(totals.calories / nutrition.length),
      averageProteins:
        Math.round((totals.proteins / nutrition.length) * 10) / 10,
      averageCarbs: Math.round((totals.carbs / nutrition.length) * 10) / 10,
      averageFat: Math.round((totals.fat / nutrition.length) * 10) / 10,
      totalDays: nutrition.length,
      daysWithMeals,
    });
  } catch (error) {
    console.error('Error fetching nutrition stats:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
