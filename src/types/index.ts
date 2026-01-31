export type Nullable<T> = T | null;

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