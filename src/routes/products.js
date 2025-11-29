const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require("mongoose");
const { validateEAN } = require("../middleware/validation");

// GET /products/debug/db - Debug database connection
router.get("/debug/db", async (req, res) => {
  try {
    const dbInfo = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      databaseName: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      modelCollectionName: Product.collection.name,
      modelDbName: Product.db.name,
      collections: (
        await mongoose.connection.db.listCollections().toArray()
      ).map((c) => c.name),
      productsCount: await Product.countDocuments(),
      sampleProduct: await Product.findOne(),
    };
    res.json(dbInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products/{ean}:
 *   get:
 *     summary: Get product by EAN code
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: ean
 *         required: true
 *         schema:
 *           type: string
 *         description: Product EAN code (8 or 13 digits with valid checksum)
 *         example: "5901234567890"
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid EAN format
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/:ean", validateEAN, async (req, res) => {
  try {
    // Try to search as string
    let product = await Product.findOne({ code: req.params.ean });

    if (!product) {
      // Try as number
      const eanNumber = parseInt(req.params.ean);
      if (!isNaN(eanNumber)) {
        product = await Product.findOne({ code: eanNumber });
      }
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

module.exports = router;
