import express from 'express';
import { getProductByEan } from '../controllers/product.controller.js';
import { validateEAN } from '../middleware/validation.js';

const router = express.Router();

router.get('/:ean', validateEAN, getProductByEan);

export default router;
