import { Product } from '../../models/product/product.model.js';
import type { ProductRepository } from './product.repository.js';
import type { ProductResponseDTO } from './product.types.js';

export class MongoProductRepository implements ProductRepository {
  async getProductByEan(ean: string): Promise<ProductResponseDTO | null> {
    let doc = await Product.findOne({ code: ean });

    if (!doc) {
      const eanNumber = parseInt(ean);
      if (!isNaN(eanNumber)) {
        doc = await Product.findOne({ code: eanNumber });
      }
    }

    if (!doc) return null;

    return {
      id: doc._id.toString(),
      code: doc.code,
      name: doc.name,
      brands: doc.brands,
      countries_tags: doc.countries_tags,
      nutriscore: doc.nutriscore,
      allergens: doc.allergens,
      lastModified: doc.lastModified,
      updatedAt: doc.updatedAt,
      nutrientsPer100g: {
        calories: doc.nutriments['energy-kcal_100g'],
        proteins: doc.nutriments.proteins_100g,
        carbs: doc.nutriments.carbohydrates_100g,
        fat: doc.nutriments.fat_100g,
      },
    };
  }
}
