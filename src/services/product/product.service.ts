import { productRepository } from '../../repository/product/product.instance.js';
import type { ProductResponseDTO } from '../../repository/product/product.types.js';

export const getProductByEan = async (
  ean: string
): Promise<ProductResponseDTO | null> => {
  return productRepository.getProductByEan(ean);
};
