const express = require('express');
const router = express.Router();
const Log = require('../models/Logs');
const { validateLogData, validateObjectId } = require('../middleware/validation');

// GET /logs - Get all logs
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
        $lte: new Date(endDate)
      };
    }
    
    const logs = await Log.find(query).sort({ date: -1 });
    res.json(logs.map(log => log.toPublicJSON()));
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /logs/:id - Get specific log
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

// POST /logs - Create new log
router.post('/', validateLogData, async (req, res) => {
  try {
    const { type, value, unit, notes, date } = req.body;
    
    const newLog = new Log({
      type,
      value,
      unit,
      notes,
      date: date ? new Date(date) : undefined
    });
    
    await newLog.save();
    res.status(201).json(newLog.toPublicJSON());
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// PUT /logs/:id - Update log
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
        date: date ? new Date(date) : undefined
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
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// DELETE /logs/:id - Delete log
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const deletedLog = await Log.findByIdAndDelete(req.params.id);
    if (!deletedLog) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json({ message: 'Log deleted successfully', log: deletedLog.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /logs/stats/summary - Statistics summary
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Log.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latestValue: { $last: '$value' },
          latestDate: { $last: '$date' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;