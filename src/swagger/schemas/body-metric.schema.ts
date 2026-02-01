/**
 * @swagger
 * components:
 *   schemas:
 *     BodyMetricType:
 *       type: string
 *       enum: [weight, measurement, mood, energy, sleep, exercise, nutrition, water]
 *       description: Type of body metric
 *
 *     BodyMetricUnit:
 *       type: string
 *       enum: [kg, cm, lbs, inches, hours, minutes, glasses, calories, liters]
 *       nullable: true
 *       description: Unit of measurement
 *
 *     BodyMetric:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         type:
 *           $ref: '#/components/schemas/BodyMetricType'
 *         value:
 *           type: string
 *           description: Measurement value
 *           example: "75.5"
 *         unit:
 *           $ref: '#/components/schemas/BodyMetricUnit'
 *         notes:
 *           type: string
 *           description: Additional notes
 *           maxLength: 500
 *           example: "Morning measurement"
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the measurement
 *           example: "2025-01-15T08:00:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateBodyMetricRequest:
 *       type: object
 *       required:
 *         - type
 *         - value
 *       properties:
 *         type:
 *           $ref: '#/components/schemas/BodyMetricType'
 *         value:
 *           type: string
 *           description: Measurement value
 *           example: "75.5"
 *         unit:
 *           $ref: '#/components/schemas/BodyMetricUnit'
 *         notes:
 *           type: string
 *           maxLength: 500
 *           example: "Morning measurement"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T08:00:00.000Z"
 *
 *     UpdateBodyMetricRequest:
 *       type: object
 *       properties:
 *         type:
 *           $ref: '#/components/schemas/BodyMetricType'
 *         value:
 *           type: string
 *           example: "76.0"
 *         unit:
 *           $ref: '#/components/schemas/BodyMetricUnit'
 *         notes:
 *           type: string
 *           maxLength: 500
 *         date:
 *           type: string
 *           format: date-time
 *
 *     StatsSummary:
 *       type: object
 *       description: Statistics summary for body metrics
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error type
 *         message:
 *           type: string
 *           description: Detailed error message
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Validation error"
 *         details:
 *           type: array
 *           items:
 *             type: string
 *           description: List of validation error messages
 */

export {};
