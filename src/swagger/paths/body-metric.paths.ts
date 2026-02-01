/**
 * @swagger
 * tags:
 *   - name: Body Metrics
 *     description: Body metrics management endpoints
 */

/**
 * @swagger
 * /api/body-metrics:
 *   get:
 *     summary: Get all body metrics
 *     description: Retrieve a list of body metrics with optional filtering by type and date range
 *     tags: [Body Metrics]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/BodyMetricType'
 *         description: Filter by metric type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (YYYY-MM-DD)
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (YYYY-MM-DD)
 *         example: "2025-12-31"
 *     responses:
 *       200:
 *         description: List of body metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BodyMetric'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/body-metrics:
 *   post:
 *     summary: Create a new body metric
 *     description: Create a new body metric entry
 *     tags: [Body Metrics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBodyMetricRequest'
 *     responses:
 *       201:
 *         description: Body metric created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BodyMetric'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/body-metrics/stats/summary:
 *   get:
 *     summary: Get body metrics statistics summary
 *     description: Retrieve aggregated statistics for all body metrics
 *     tags: [Body Metrics]
 *     responses:
 *       200:
 *         description: Statistics summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsSummary'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/body-metrics/{id}:
 *   get:
 *     summary: Get body metric by ID
 *     description: Retrieve a single body metric by its ID
 *     tags: [Body Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Body metric ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Body metric found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BodyMetric'
 *       404:
 *         description: Body metric not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/body-metrics/{id}:
 *   put:
 *     summary: Update body metric
 *     description: Update an existing body metric by its ID
 *     tags: [Body Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Body metric ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBodyMetricRequest'
 *     responses:
 *       200:
 *         description: Body metric updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BodyMetric'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Body metric not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/body-metrics/{id}:
 *   delete:
 *     summary: Delete body metric
 *     description: Delete a body metric by its ID
 *     tags: [Body Metrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Body metric ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Body metric deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Body metric deleted successfully"
 *                 bodyMetric:
 *                   $ref: '#/components/schemas/BodyMetric'
 *       404:
 *         description: Body metric not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export {};
