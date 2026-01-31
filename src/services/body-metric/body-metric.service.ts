import type {
  BodyMetricFilters,
  CreateBodyMetricDTO,
  UpdateBodyMetricDTO,
  BodyMetricResponseDTO,
} from '../../repository/body-metric/body-metric.types.js';
import { bodyMetricRepository } from '../../repository/body-metric/body-metric.instance.js';

export const getFilteredBodyMetrics = async (
  filters: BodyMetricFilters
): Promise<BodyMetricResponseDTO[]> => {
  const normalizedFilters: BodyMetricFilters = {
    ...filters,
    startDate: filters.startDate
      ? typeof filters.startDate === 'string'
        ? new Date(filters.startDate)
        : filters.startDate
      : undefined,
    endDate: filters.endDate
      ? typeof filters.endDate === 'string'
        ? new Date(filters.endDate)
        : filters.endDate
      : undefined,
  };
  return bodyMetricRepository.getMetrics(normalizedFilters);
};

export const getBodyMetricById = async (
  id: string
): Promise<BodyMetricResponseDTO | null> => {
  return bodyMetricRepository.getMetricById(id);
};

export const createNewBodyMetric = async (
  bodyMetricData: CreateBodyMetricDTO
): Promise<BodyMetricResponseDTO> => {
  const dataToSave: CreateBodyMetricDTO = {
    ...bodyMetricData,
    date: bodyMetricData.date ? new Date(bodyMetricData.date) : undefined,
  };
  return bodyMetricRepository.createMetric(dataToSave);
};

export const updateBodyMetric = async (
  id: string,
  updateData: UpdateBodyMetricDTO
): Promise<BodyMetricResponseDTO | null> => {
  const dataToUpdate: UpdateBodyMetricDTO = {
    ...updateData,
    date: updateData.date ? new Date(updateData.date) : undefined,
  };
  return bodyMetricRepository.updateMetricById(id, dataToUpdate);
};

export const deleteBodyMetric = async (id: string): Promise<void> => {
  return bodyMetricRepository.deleteMetricById(id);
};

export const getStatsSummary = async () => {
  return bodyMetricRepository.getMetricsSummary();
};
