const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require("mongoose");

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

// GET /products/:ean - Get product by EAN code
router.get("/:ean", async (req, res) => {
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
