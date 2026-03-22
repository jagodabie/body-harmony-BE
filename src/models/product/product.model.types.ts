import type { Model } from 'mongoose';

export interface ProductNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  fat_100g?: number;
  'saturated-fat_100g'?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  salt_100g?: number;
}

export interface ProductFields {
  code: string;
  name: string;
  brands?: string;
  countries_tags?: string[];
  nutriscore?: string;
  allergens?: string[];
  lastModified?: Date;
  updatedAt?: Date;
  nutriments: ProductNutriments;
}

export type ProductModel = Model<ProductFields>;
