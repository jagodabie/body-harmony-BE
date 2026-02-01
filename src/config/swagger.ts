import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Body Harmony API',
      version: '1.0.0',
      description:
        'Backend API for Body Harmony health and wellness tracking application',
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
        // Schemas are defined in ./src/swagger/schemas/*.ts
      },
      securitySchemes: {
        // Add authentication schemes when needed
      },
    },
    tags: [
      // Tags are defined in ./src/swagger/paths/*.ts
    ],
  },
  apis: [
    './src/swagger/schemas/*.ts',
    './src/swagger/paths/*.ts',
    './src/routes/*.js', // Legacy JS routes (meals, nutrition, products)
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
