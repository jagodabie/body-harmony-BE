import type { BodyMetricRepository } from './body-metric.repository.js';
import { MongoBodyMetricRepository } from './body-metric.mongo.repository.js';

export const bodyMetricRepository: BodyMetricRepository =
  new MongoBodyMetricRepository();
