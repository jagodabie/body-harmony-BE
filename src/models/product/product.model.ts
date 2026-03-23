import mongoose from 'mongoose';
import type { ProductFields, ProductModel } from './product.model.types.js';

const productSchema = new mongoose.Schema<ProductFields, ProductModel>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brands: { type: String },
    countries_tags: [{ type: String }],
    nutriscore: { type: String, default: 'unknown' },
    allergens: [{ type: String }],
    lastModified: { type: Date },
    updatedAt: { type: Date, default: Date.now, index: true },
    nutriments: {
      'energy-kcal_100g': { type: Number },
      proteins_100g: { type: Number },
      fat_100g: { type: Number },
      'saturated-fat_100g': { type: Number },
      carbohydrates_100g: { type: Number },
      sugars_100g: { type: Number },
      salt_100g: { type: Number },
    },
  },
  {
    versionKey: false,
    minimize: false,
    collection: 'body_harmony_products_slim',
  }
);

productSchema.index({ name: 1 });

export const Product =
  (mongoose.models.Product as ProductModel) ||
  mongoose.model<ProductFields, ProductModel>('Product', productSchema);
