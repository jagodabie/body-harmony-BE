const validateLogData = (req, res, next) => {
  const { type, value } = req.body;
  
  // Check required fields
  if (!type || !value) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        type: !type ? 'Type is required' : null,
        value: !value ? 'Value is required' : null
      }
    });
  }

  // Check allowed types
  const allowedTypes = ['weight', 'measurement', 'mood', 'energy', 'sleep', 'exercise', 'nutrition', 'water'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      error: 'Invalid type',
      message: `Type must be one of: ${allowedTypes.join(', ')}`,
      allowedTypes
    });
  }

  // Check notes length
  if (req.body.notes && req.body.notes.length > 500) {
    return res.status(400).json({
      error: 'Notes too long',
      message: 'Notes cannot exceed 500 characters'
    });
  }

  // Check date format
  if (req.body.date) {
    const date = new Date(req.body.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be a valid ISO date string'
      });
    }
  }

  next();
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  // Check if ID is a valid ObjectId (24 hex characters)
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'ID must be a valid 24-character hexadecimal string'
    });
  }

  next();
};

module.exports = {
  validateLogData,
  validateObjectId
}; 