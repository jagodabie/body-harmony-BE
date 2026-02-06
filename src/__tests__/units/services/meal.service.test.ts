import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { MealFilters, MealResponseDTO } from '../../../repository/meal/meal.types.js';

const mockGetMeals = jest.fn() as jest.MockedFunction<
  (filters: MealFilters) => Promise<MealResponseDTO[]>
>;

jest.unstable_mockModule('../../../repository/meal/meal.instance.js', () => ({
  mealRepository: {
    getMeals: mockGetMeals,
  },
}));

const { getFilteredMeals } = await import(
  '../../../services/meal/meal.service.js'
);

describe('Meal Service – getFilteredMeals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call repository.getMeals and return its result', async () => {
    const filters: MealFilters = { mealType: 'BREAKFAST' };
    const expected: MealResponseDTO[] = [
      {
        id: 'm1',
        name: 'Oatmeal',
        mealType: 'BREAKFAST',
        date: new Date('2025-02-01'),
        createdAt: new Date(),
      },
    ];
    mockGetMeals.mockResolvedValue(expected);

    const result = await getFilteredMeals(filters);

    expect(mockGetMeals).toHaveBeenCalledTimes(1);
    expect(mockGetMeals).toHaveBeenCalledWith({
      mealType: 'BREAKFAST',
      startDate: undefined,
      endDate: undefined,
    });
    expect(result).toEqual(expected);
  });

  it('should convert string startDate and endDate to Date in filters', async () => {
    const filters: MealFilters = {
      startDate: '2025-02-01T00:00:00.000Z',
      endDate: '2025-02-06T23:59:59.999Z',
    };
    mockGetMeals.mockResolvedValue([]);

    await getFilteredMeals(filters);

    expect(mockGetMeals).toHaveBeenCalledWith({
      startDate: new Date('2025-02-01T00:00:00.000Z'),
      endDate: new Date('2025-02-06T23:59:59.999Z'),
    });
  });

  it('should pass Date startDate and endDate through unchanged', async () => {
    const start = new Date('2025-02-01');
    const end = new Date('2025-02-06');
    const filters: MealFilters = { startDate: start, endDate: end };
    mockGetMeals.mockResolvedValue([]);

    await getFilteredMeals(filters);

    expect(mockGetMeals).toHaveBeenCalledWith({
      startDate: start,
      endDate: end,
    });
  });

  it('should leave startDate and endDate undefined when not provided', async () => {
    const filters: MealFilters = { mealType: 'LUNCH' };
    mockGetMeals.mockResolvedValue([]);

    await getFilteredMeals(filters);

    expect(mockGetMeals).toHaveBeenCalledWith({
      mealType: 'LUNCH',
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('should normalize only startDate when endDate is missing', async () => {
    const filters: MealFilters = {
      startDate: '2025-02-01',
      mealType: 'DINNER',
    };
    mockGetMeals.mockResolvedValue([]);

    await getFilteredMeals(filters);

    expect(mockGetMeals).toHaveBeenCalledWith({
      mealType: 'DINNER',
      startDate: new Date('2025-02-01'),
      endDate: undefined,
    });
  });

  it('should normalize only endDate when startDate is missing', async () => {
    const filters: MealFilters = {
      endDate: '2025-02-06',
      mealType: 'SNACK',
    };
    mockGetMeals.mockResolvedValue([]);

    await getFilteredMeals(filters);

    expect(mockGetMeals).toHaveBeenCalledWith({
      mealType: 'SNACK',
      startDate: undefined,
      endDate: new Date('2025-02-06'),
    });
  });
});
