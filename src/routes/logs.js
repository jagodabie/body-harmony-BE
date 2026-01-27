import express from 'express';
const router = express.Router();
import Log from '../models/Logs.js';
import {
  validateLogData,
  validateObjectId,
} from '../middleware/validation.js';

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get all logs with optional filters
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [weight, measurement, mood, energy, sleep, exercise, nutrition, water]
 *         description: Filter by log type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for date range filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for date range filter
 *     responses:
 *       200:
 *         description: List of logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Log'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const logs = await Log.find(query).sort({ date: -1 });
    res.json(logs.map((log) => log.toPublicJSON()));
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /logs/{id}:
 *   get:
 *     summary: Get a specific log by ID
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Log ID (24-character hexadecimal string)
 *     responses:
 *       200:
 *         description: Log found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Log not found
 *       500:
 *         description: Server error
 */
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json(log.toPublicJSON());
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /logs:
 *   post:
 *     summary: Create a new log entry
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - value
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [weight, measurement, mood, energy, sleep, exercise, nutrition, water]
 *                 example: "weight"
 *               value:
 *                 type: number
 *                 example: 75.5
 *               unit:
 *                 type: string
 *                 example: "kg"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', validateLogData, async (req, res) => {
  try {
    const { type, value, unit, notes, date } = req.body;

    const newLog = new Log({
      type,
      value,
      unit,
      notes,
      date: date ? new Date(date) : undefined,
    });

    await newLog.save();
    res.status(201).json(newLog.toPublicJSON());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /logs/{id}:
 *   put:
 *     summary: Update a log entry
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - value
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [weight, measurement, mood, energy, sleep, exercise, nutrition, water]
 *               value:
 *                 type: number
 *               unit:
 *                 type: string
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Log updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Log not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateObjectId, validateLogData, async (req, res) => {
  try {
    const { type, value, unit, notes, date } = req.body;

    const updatedLog = await Log.findByIdAndUpdate(
      req.params.id,
      {
        type,
        value,
        unit,
        notes,
        date: date ? new Date(date) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedLog) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json(updatedLog.toPublicJSON());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /logs/{id}:
 *   delete:
 *     summary: Delete a log entry
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Log ID
 *     responses:
 *       200:
 *         description: Log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Log deleted successfully"
 *                 log:
 *                   $ref: '#/components/schemas/Log'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Log not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const deletedLog = await Log.findByIdAndDelete(req.params.id);
    if (!deletedLog) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json({
      message: 'Log deleted successfully',
      log: deletedLog.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

/**
 * @swagger
 * /logs/stats/summary:
 *   get:
 *     summary: Get statistics summary for all log types
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Statistics summary
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Log type
 *                   count:
 *                     type: number
 *                     description: Number of logs of this type
 *                   latestValue:
 *                     type: number
 *                     description: Latest value for this type
 *                   latestDate:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Log.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latestValue: { $last: '$value' },
          latestDate: { $last: '$date' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

export default router;
