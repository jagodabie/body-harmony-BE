import type { ProductResponseDTO, SearchProductsFilter } from './product.types.js';

export interface ProductRepository {
  getProductByEan(ean: string): Promise<ProductResponseDTO | null>;
  searchByName(filter: SearchProductsFilter): Promise<ProductResponseDTO[]>;
}
