/**
 * @swagger
 * components:
 *   schemas:
 *     DailyNutritionStats:
 *       type: object
 *       description: Aggregated nutrition statistics for a given period
 *       properties:
 *         period:
 *           type: string
 *           description: The period the stats cover
 *           example: "30 days"
 *         averageCalories:
 *           type: number
 *           description: Average calories per day (rounded to nearest integer)
 *           example: 2100
 *         averageProteins:
 *           type: number
 *           description: Average proteins per day in grams (rounded to 1 decimal)
 *           example: 85.3
 *         averageCarbs:
 *           type: number
 *           description: Average carbohydrates per day in grams (rounded to 1 decimal)
 *           example: 240.7
 *         averageFat:
 *           type: number
 *           description: Average fat per day in grams (rounded to 1 decimal)
 *           example: 72.1
 *         totalDays:
 *           type: integer
 *           description: Number of days with any data in the period
 *           example: 28
 *         daysWithMeals:
 *           type: integer
 *           description: Number of days that had at least one meal logged
 *           example: 25
 */

export {};
