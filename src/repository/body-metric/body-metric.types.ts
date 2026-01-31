import type { BodyMetricType, BodyMetricUnit } from '../../types/index.js';

export interface BodyMetricFilters {
  type?: BodyMetricType;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface BodyMetricResponseDTO {
  id: string;
  type: BodyMetricType;
  value: string;
  unit: BodyMetricUnit;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateBodyMetricDTO {
  type?: BodyMetricType;
  value?: string;
  unit?: BodyMetricUnit;
  notes?: string;
  date?: Date | string;
}

export interface CreateBodyMetricDTO {
  type: BodyMetricType;
  value: string;
  unit?: BodyMetricUnit;
  notes?: string;
  date?: Date | string;
}
