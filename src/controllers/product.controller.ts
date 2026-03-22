import type { Request, Response } from 'express';
import * as productService from '../services/product/product.service.js';

export const getProductByEan = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductByEan(req.params.ean);
    if (!product) {
      return res
        .status(404)
        .json({ error: 'Product not found for EAN: ' + req.params.ean });
    }
    res.json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};
