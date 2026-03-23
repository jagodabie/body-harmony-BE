/**
 * @swagger
 * components:
 *   schemas:
 *     NutrientsPer100g:
 *       type: object
 *       properties:
 *         calories:
 *           type: integer
 *           description: Energy in kcal per 100g (rounded to nearest integer)
 *           example: 89
 *         proteins:
 *           type: integer
 *           description: Proteins in grams per 100g (rounded to nearest integer)
 *           example: 1
 *         carbs:
 *           type: integer
 *           description: Carbohydrates in grams per 100g (rounded to nearest integer)
 *           example: 23
 *         fat:
 *           type: integer
 *           description: Fat in grams per 100g (rounded to nearest integer)
 *           example: 0
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         code:
 *           type: string
 *           description: EAN barcode
 *           example: "5900259105265"
 *         name:
 *           type: string
 *           description: Product name
 *           example: "Mleko UHT 3.2%"
 *         brands:
 *           type: string
 *           description: Brand name(s)
 *           example: "Łaciate"
 *         countries_tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["en:poland"]
 *         nutriscore:
 *           type: string
 *           description: Nutri-Score rating (a–e)
 *           example: "b"
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *           example: ["en:milk"]
 *         lastModified:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         nutrientsPer100g:
 *           $ref: '#/components/schemas/NutrientsPer100g'
 */

export {};
