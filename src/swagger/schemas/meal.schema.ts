/**
 * @swagger
 * components:
 *   schemas:
 *     MealType:
 *       type: string
 *       enum: [BREAKFAST, LUNCH, DINNER, SNACK, SUPPER]
 *       description: Type of meal
 *
 *     Meal:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Meal name
 *           maxLength: 100
 *           example: "Morning oatmeal"
 *         mealType:
 *           $ref: '#/components/schemas/MealType'
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the meal
 *           example: "2025-01-15"
 *         time:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Time of the meal (HH:MM format)
 *           example: "08:30"
 *         notes:
 *           type: string
 *           description: Additional notes
 *           maxLength: 500
 *           example: "Light breakfast before workout"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateMealRequest:
 *       type: object
 *       required:
 *         - name
 *         - mealType
 *         - date
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: "Morning oatmeal"
 *         mealType:
 *           $ref: '#/components/schemas/MealType'
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-01-15"
 *         time:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: "08:30"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           example: "Light breakfast before workout"
 *
 *     UpdateMealRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: "Updated meal name"
 *         mealType:
 *           $ref: '#/components/schemas/MealType'
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-01-15"
 *         time:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: "12:00"
 *         notes:
 *           type: string
 *           maxLength: 500
 */

export {};
