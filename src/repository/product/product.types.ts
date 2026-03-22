export interface ProductResponseDTO {
  id: string;
  code: string;
  name: string;
  brands?: string;
  countries_tags?: string[];
  nutriscore?: string;
  allergens?: string[];
  lastModified?: Date;
  updatedAt?: Date;
  nutrientsPer100g: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fat?: number;
  };
}
