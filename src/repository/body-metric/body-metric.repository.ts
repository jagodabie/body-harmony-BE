import type {
  BodyMetricFilters,
  BodyMetricResponseDTO,
  CreateBodyMetricDTO,
  UpdateBodyMetricDTO,
} from './body-metric.types.js';

export interface BodyMetricRepository {
  getMetrics(filters: BodyMetricFilters): Promise<BodyMetricResponseDTO[]>;
  getMetricById(id: string): Promise<BodyMetricResponseDTO | null>;
  createMetric(data: CreateBodyMetricDTO): Promise<BodyMetricResponseDTO>;
  updateMetricById(
    id: string,
    data: UpdateBodyMetricDTO
  ): Promise<BodyMetricResponseDTO | null>;
  deleteMetricById(id: string): Promise<void>;
  getMetricsSummary(): Promise<unknown>;
  deleteMany(): Promise<void>;
  insertMany(
    data: CreateBodyMetricDTO[]
  ): Promise<BodyMetricResponseDTO[]>;
}
