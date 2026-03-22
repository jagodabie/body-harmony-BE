import type { ProductResponseDTO } from './product.types.js';

export interface ProductRepository {
  getProductByEan(ean: string): Promise<ProductResponseDTO | null>;
}
