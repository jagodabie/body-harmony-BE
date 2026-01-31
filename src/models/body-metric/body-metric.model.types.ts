import type { Model } from 'mongoose';
import type { BodyMetricType, BodyMetricUnit } from '../../types/index.js';

/** Mongo-only: document fields (used by Mongoose schema) */
export interface BodyMetricFields {
  type: BodyMetricType;
  value: string;
  unit: BodyMetricUnit;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Mongo-only: instance methods */
export interface BodyMetricMethods {
  toPublicJSON(): {
    id: string;
    type: BodyMetricType;
    value: string;
    unit: BodyMetricUnit;
    notes?: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}

export type BodyMetricModel = Model<
  BodyMetricFields,
  object,
  BodyMetricMethods
>;
