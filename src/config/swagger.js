const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Body Harmony API',
      version: '1.0.0',
      description: 'Backend API for Body Harmony health and wellness tracking application',
      contact: {
        name: 'Body Harmony Team',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Meal: {
          type: 'object',
          required: ['name', 'mealType', 'date'],
          properties: {
            _id: {
              type: 'string',
              description: 'Meal ID',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Meal name',
              example: 'BREAKFAST',
              maxLength: 100,
            },
            mealType: {
              type: 'string',
              enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'SUPPER'],
              description: 'Type of meal',
              example: 'BREAKFAST',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date of the meal',
              example: '2025-11-24T00:00:00.000Z',
            },
            time: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Time in HH:MM format',
              example: '10:00',
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
              maxLength: 500,
              example: 'Good breakfast',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        MealProduct: {
          type: 'object',
          required: ['mealId', 'productCode', 'quantity'],
          properties: {
            _id: {
              type: 'string',
              description: 'MealProduct ID',
            },
            mealId: {
              type: 'string',
              description: 'Meal ID',
            },
            productCode: {
              type: 'string',
              description: 'Product EAN code',
              example: '5901234567890',
            },
            quantity: {
              type: 'number',
              description: 'Quantity',
              minimum: 0.1,
              example: 100,
            },
            unit: {
              type: 'string',
              enum: ['g', 'kg', 'ml', 'l', 'pieces', 'cups', 'tbsp', 'tsp'],
              default: 'g',
              description: 'Unit of measurement',
              example: 'g',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Product EAN code',
              example: '5901234567890',
            },
            name: {
              type: 'string',
              description: 'Product name',
            },
            brands: {
              type: 'string',
              description: 'Product brands',
            },
            nutriments: {
              type: 'object',
              properties: {
                'energy-kcal_100g': { type: 'number' },
                proteins_100g: { type: 'number' },
                fat_100g: { type: 'number' },
                'saturated-fat_100g': { type: 'number' },
                carbohydrates_100g: { type: 'number' },
                sugars_100g: { type: 'number' },
                salt_100g: { type: 'number' },
              },
            },
          },
        },
        Log: {
          type: 'object',
          required: ['type', 'value'],
          properties: {
            _id: {
              type: 'string',
              description: 'Log ID',
            },
            type: {
              type: 'string',
              enum: ['weight', 'measurement', 'mood', 'energy', 'sleep', 'exercise', 'nutrition', 'water'],
              description: 'Type of log',
            },
            value: {
              type: 'number',
              description: 'Log value',
            },
            unit: {
              type: 'string',
              description: 'Unit of measurement',
            },
            notes: {
              type: 'string',
              maxLength: 500,
            },
            date: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        DailyNutrition: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
            },
            totalCalories: {
              type: 'number',
            },
            totalProteins: {
              type: 'number',
            },
            totalCarbs: {
              type: 'number',
            },
            totalFat: {
              type: 'number',
            },
            totalSugar: {
              type: 'number',
            },
            totalSalt: {
              type: 'number',
            },
            mealCount: {
              type: 'number',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/index.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

