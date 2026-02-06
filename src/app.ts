import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import errorHandler from './middleware/errorHandler.js';
import productsRoutes from './routes/products.js';
import mealsRoutes from './routes/meals.js';
import nutritionRoutes from './routes/nutrition.js';
import bodyMetricRoutes from './routes/body-metric.routes.js';
import mealRoutes from './routes/meal.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Body Harmony API Documentation',
  })
);

// API Documentation JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Home page with API info
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Body Harmony API</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 800px;
          width: 100%;
          padding: 60px 40px;
          text-align: center;
        }
        h1 {
          color: #333;
          font-size: 3em;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle {
          color: #666;
          font-size: 1.2em;
          margin-bottom: 40px;
        }
        .links {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 40px;
        }
        .link {
          display: inline-block;
          padding: 18px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-size: 1.1em;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .link:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .link.secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          box-shadow: none;
        }
        .link.secondary:hover {
          background: #f8f9ff;
        }
        .info {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid #eee;
        }
        .info h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.5em;
        }
        .endpoints {
          text-align: left;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        .endpoint {
          padding: 15px;
          background: #f8f9ff;
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }
        .endpoint-method {
          font-weight: bold;
          color: #667eea;
          margin-bottom: 5px;
        }
        .endpoint-path {
          color: #666;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .status {
          display: inline-block;
          padding: 8px 16px;
          background: #10b981;
          color: white;
          border-radius: 20px;
          font-size: 0.9em;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🍎 Body Harmony API</h1>
        <p class="subtitle">Backend API for health and wellness tracking application</p>
        
        <div class="status">✓ API is running</div>
        
        <div class="links">
          <a href="/api-docs" class="link">📚 Open Swagger Documentation</a>
          <a href="/api-docs.json" class="link secondary">📄 Download JSON Specification</a>
        </div>
        
        <div class="info">
          <h2>Available Endpoints</h2>
          <div class="endpoints">
            <div class="endpoint">
              <div class="endpoint-method">GET /health</div>
              <div class="endpoint-path">Health check</div>
            </div>
            <div class="endpoint">
              <div class="endpoint-method">GET /meals</div>
              <div class="endpoint-path">Meals list</div>
            </div>
            <div class="endpoint">
              <div class="endpoint-method">GET /products/:ean</div>
              <div class="endpoint-path">Product by EAN</div>
            </div>
            <div class="endpoint">
              <div class="endpoint-method">GET /nutrition/daily/:date</div>
              <div class="endpoint-path">Daily nutrition</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Routes
app.use('/products', productsRoutes);
app.use('/meals', mealsRoutes);
app.use('/nutrition', nutritionRoutes);

// NEW EP ROUTES
app.use('/api/body-metrics', bodyMetricRoutes);
app.use('/api/meals', mealRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware (must be at the end)
app.use(errorHandler);

export default app;
