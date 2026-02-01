const validateBodyMetricData = (req, res, next) => {
  const { type, value } = req.body;

  // Check required fields
  if (!type || !value) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        type: !type ? 'Type is required' : null,
        value: !value ? 'Value is required' : null,
      },
    });
  }

  // Check allowed types
  const allowedTypes = [
    'weight',
    'measurement',
    'mood',
    'energy',
    'sleep',
    'exercise',
    'nutrition',
    'water',
  ];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      error: 'Invalid type',
      message: `Type must be one of: ${allowedTypes.join(', ')}`,
      allowedTypes,
    });
  }

  // Check notes length
  if (req.body.notes && req.body.notes.length > 500) {
    return res.status(400).json({
      error: 'Notes too long',
      message: 'Notes cannot exceed 500 characters',
    });
  }

  // Check date format
  if (req.body.date) {
    const date = new Date(req.body.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be a valid ISO date string',
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
      message: 'ID must be a valid 24-character hexadecimal string',
    });
  }

  next();
};

/**
 * Validates EAN-8 or EAN-13 code format and checksum
 * EAN codes must be 8 or 13 digits with valid checksum digit
 */
const validateEAN = (req, res, next) => {
  const { ean } = req.params;

  // Check if EAN exists
  if (!ean) {
    return res.status(400).json({
      error: 'EAN code is required',
      message: 'Please provide an EAN code',
    });
  }

  // Remove any spaces or dashes
  const cleanEAN = ean.replace(/[\s-]/g, '');

  // Check if it's only digits
  if (!/^\d+$/.test(cleanEAN)) {
    return res.status(400).json({
      error: 'Invalid EAN format',
      message: 'EAN code must contain only digits',
    });
  }

  // Check length (EAN-8 or EAN-13)
  if (cleanEAN.length !== 8 && cleanEAN.length !== 13) {
    return res.status(400).json({
      error: 'Invalid EAN length',
      message: 'EAN code must be 8 or 13 digits long',
      received: cleanEAN.length,
    });
  }

  // Validate checksum
  if (!isValidEANChecksum(cleanEAN)) {
    return res.status(400).json({
      error: 'Invalid EAN checksum',
      message: 'The EAN code checksum is invalid. Please verify the code.',
    });
  }

  // Store cleaned EAN for use in route
  req.params.ean = cleanEAN;

  next();
};

/**
 * Calculates and validates EAN checksum
 * Algorithm works for both EAN-8 and EAN-13
 */
const isValidEANChecksum = (ean) => {
  const digits = ean.split('').map(Number);
  const checkDigit = digits.pop(); // Last digit is the check digit

  let sum = 0;

  // For EAN-13: multiply odd positions (from right) by 3, even by 1
  // For EAN-8: same algorithm
  digits.reverse().forEach((digit, index) => {
    sum += digit * (index % 2 === 0 ? 3 : 1);
  });

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === calculatedCheckDigit;
};

export { validateBodyMetricData, validateObjectId, validateEAN };
