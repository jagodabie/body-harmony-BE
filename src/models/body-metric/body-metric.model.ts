import mongoose from 'mongoose';
import type {
  BodyMetricFields,
  BodyMetricModel,
  BodyMetricMethods,
} from './body-metric.model.types.js';

const bodyMetricSchema = new mongoose.Schema<
  BodyMetricFields,
  BodyMetricModel,
  BodyMetricMethods
>(
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
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'body_harmony_logs',
  }
);

bodyMetricSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    type: obj.type,
    value: obj.value,
    unit: obj.unit,
    notes: obj.notes,
    date: obj.date,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

export const BodyMetric =
  (mongoose.models.BodyMetric as BodyMetricModel) ||
  mongoose.model<BodyMetricFields, BodyMetricModel>(
    'BodyMetric',
    bodyMetricSchema
  );
