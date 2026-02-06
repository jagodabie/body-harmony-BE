export type Nullable<T> = T | null;

/** Meal type – DB-agnostic domain type */
export type MealType =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACK'
  | 'SUPPER';

/** Body metric type – DB-agnostic domain type */
export type BodyMetricType =
  | 'weight'
  | 'measurement'
  | 'mood'
  | 'energy'
  | 'sleep'
  | 'exercise'
  | 'nutrition'
  | 'water';

/** Body metric unit – DB-agnostic domain type */
export type BodyMetricUnit = Nullable<
  | 'kg'
  | 'cm'
  | 'lbs'
  | 'inches'
  | 'hours'
  | 'minutes'
  | 'glasses'
  | 'calories'
  | 'liters'
>;