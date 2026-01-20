const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: [
        'weight',
        'measurement',
        'mood',
        'energy',
        'sleep',
        'exercise',
        'nutrition',
        'water',
      ],
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Value is required'],
      trim: true,
    },
    unit: {
      type: String,
      enum: [
        'kg',
        'cm',
        'lbs',
        'inches',
        'hours',
        'minutes',
        'glasses',
        'calories',
        'liters',
        null,
      ],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed after creation
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: 'body_harmony_logs', // Collection name in MongoDB
  }
);

// Middleware - updates updatedAt before each save
logSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get logs from date range
logSchema.statics.getLogsByDateRange = function (startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

// Instance method to format data
logSchema.methods.toPublicJSON = function () {
  const log = this.toObject();
  delete log.__v; // Remove document version
  return log;
};

module.exports = mongoose.model('Log', logSchema);
