import { BodyMetric } from '../../models/body-metric/body-metric.model.js';
import type {
  BodyMetricFilters,
  BodyMetricResponseDTO,
  CreateBodyMetricDTO,
  UpdateBodyMetricDTO,
} from './body-metric.types.js';
import type { BodyMetricRepository } from './body-metric.repository.js';

export class MongoBodyMetricRepository implements BodyMetricRepository {
  async getMetrics(
    filters: BodyMetricFilters
  ): Promise<BodyMetricResponseDTO[]> {
    const query: {
      date?: { $gte: Date | string; $lte: Date | string };
      type?: string;
    } = {};

    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    if (filters.type) {
      query.type = filters.type;
    }

    const results = await BodyMetric.find(query).sort({ date: -1 });
    return results.map((doc) => doc.toPublicJSON());
  }

  async getMetricById(id: string): Promise<BodyMetricResponseDTO | null> {
    const doc = await BodyMetric.findById(id);
    return doc ? doc.toPublicJSON() : null;
  }

  async updateMetricById(
    id: string,
    data: UpdateBodyMetricDTO
  ): Promise<BodyMetricResponseDTO | null> {
    const doc = await BodyMetric.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return doc ? doc.toPublicJSON() : null;
  }

  async createMetric(
    data: CreateBodyMetricDTO
  ): Promise<BodyMetricResponseDTO> {
    const doc = await BodyMetric.create(data);
    return doc.toPublicJSON();
  }

  async deleteMetricById(id: string): Promise<void> {
    await BodyMetric.findByIdAndDelete(id);
  }

  async getMetricsSummary(): Promise<unknown> {
    return BodyMetric.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latestValue: { $last: '$value' },
          latestDate: { $last: '$date' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async deleteMany(): Promise<void> {
    await BodyMetric.deleteMany({});
  }

  async insertMany(
    data: CreateBodyMetricDTO[]
  ): Promise<BodyMetricResponseDTO[]> {
    const docs = await BodyMetric.insertMany(data);
    return docs.map((doc) => doc.toPublicJSON());
  }
}
