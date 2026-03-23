/**
 * @swagger
 * tags:
 *   - name: Daily Nutrition
 *     description: Daily nutrition statistics endpoints
 */

/**
 * @swagger
 * /api/daily-nutrition/stats:
 *   get:
 *     summary: Get daily nutrition statistics
 *     description: >
 *       Returns aggregated nutrition averages (calories, proteins, carbs, fat)
 *       for the specified number of past days. Defaults to the last 30 days.
 *       Only days that have meal data are included in the averages.
 *     tags: [Daily Nutrition]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 30
 *         description: Number of past days to include in the statistics (minimum 1, default 30)
 *         example: 7
 *     responses:
 *       200:
 *         description: Daily nutrition statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyNutritionStats'
 *             example:
 *               period: "7 days"
 *               averageCalories: 2100
 *               averageProteins: 85.3
 *               averageCarbs: 240.7
 *               averageFat: 72.1
 *               totalDays: 6
 *               daysWithMeals: 5
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export {};
