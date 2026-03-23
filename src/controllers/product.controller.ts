import type { Request, Response } from 'express';
import * as productService from '../services/product/product.service.js';

export const getProductByEan = async (req: Request, res: Response) => {
  try {
    const ean = req.params.ean as string;
    const product = await productService.getProductByEan(ean);
    if (!product) {
      return res.status(404).json({ error: 'Product not found for EAN: ' + ean });
    }
    res.json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const q = req.query.q;
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const limitRaw = req.query.limit;
    const limit = limitRaw ? parseInt(limitRaw as string, 10) : undefined;

    const products = await productService.searchProducts(q.trim(), limit);
    res.json(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: 'Server error', message });
  }
};
