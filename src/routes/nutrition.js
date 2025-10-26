const express = require('express');
const router = express.Router();
const DailyNutrition = require('../models/DailyNutrition');
const Meal = require('../models/Meal');
const MealProduct = require('../models/MealProduct');

// GET /nutrition/daily/:date - Get daily nutrition summary
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
        meals: []
      });
    }

    res.json(dailyNutrition.toPublicJSON());
  } catch (error) {
    console.error('Error fetching daily nutrition:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /nutrition/range - Get nutrition for date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const nutrition = await DailyNutrition.getNutritionByDateRange(
      new Date(startDate), 
      new Date(endDate)
    );

    res.json(nutrition.map(n => n.toPublicJSON()));
  } catch (error) {
    console.error('Error fetching nutrition range:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /nutrition/daily/:date/detailed - Get detailed daily nutrition with meals and products
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
      totalSalt: 0
    };

    const mealsWithProducts = await Promise.all(meals.map(async (meal) => {
      const products = await MealProduct.getProductsByMeal(meal._id);
      
      let mealTotals = {
        calories: 0,
        proteins: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
        salt: 0
      };

      const productsWithNutrition = products.map(mp => {
        const nutrition = mp.calculateNutrition();
        if (nutrition) {
          mealTotals.calories += nutrition.calories;
          mealTotals.proteins += nutrition.proteins;
          mealTotals.carbs += nutrition.carbs;
          mealTotals.fat += nutrition.fat;
          mealTotals.sugar += nutrition.sugar;
          mealTotals.salt += nutrition.salt;
        }

        return {
          ...mp.toPublicJSON(),
          nutrition: nutrition || {}
        };
      });

      // Round meal totals
      Object.keys(mealTotals).forEach(key => {
        mealTotals[key] = Math.round(mealTotals[key] * 10) / 10;
      });

      // Add to overall totals
      Object.keys(totals).forEach(key => {
        totals[key] += mealTotals[key.replace('total', '').toLowerCase()];
      });

      return {
        ...meal.toPublicJSON(),
        products: productsWithNutrition,
        totals: mealTotals
      };
    }));

    // Round overall totals
    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] * 10) / 10;
    });

    res.json({
      date: date.toISOString().split('T')[0],
      meals: mealsWithProducts,
      totals
    });
  } catch (error) {
    console.error('Error fetching detailed daily nutrition:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// POST /nutrition/daily/:date/recalculate - Recalculate daily nutrition
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

// GET /nutrition/stats - Get nutrition statistics
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const nutrition = await DailyNutrition.getNutritionByDateRange(startDate, endDate);
    
    if (nutrition.length === 0) {
      return res.json({
        period: `${days} days`,
        averageCalories: 0,
        averageProteins: 0,
        averageCarbs: 0,
        averageFat: 0,
        totalDays: 0,
        daysWithMeals: 0
      });
    }

    const totals = nutrition.reduce((acc, day) => ({
      calories: acc.calories + day.totalCalories,
      proteins: acc.proteins + day.totalProteins,
      carbs: acc.carbs + day.totalCarbs,
      fat: acc.fat + day.totalFat
    }), { calories: 0, proteins: 0, carbs: 0, fat: 0 });

    const daysWithMeals = nutrition.filter(day => day.mealCount > 0).length;

    res.json({
      period: `${days} days`,
      averageCalories: Math.round(totals.calories / nutrition.length),
      averageProteins: Math.round(totals.proteins / nutrition.length * 10) / 10,
      averageCarbs: Math.round(totals.carbs / nutrition.length * 10) / 10,
      averageFat: Math.round(totals.fat / nutrition.length * 10) / 10,
      totalDays: nutrition.length,
      daysWithMeals
    });
  } catch (error) {
    console.error('Error fetching nutrition stats:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;

