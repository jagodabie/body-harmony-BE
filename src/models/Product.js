const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brands: { type: String },
    countries_tags: [{ type: String }],
    nutriscore: { type: String, default: "unknown" },
    allergens: [{ type: String }],
    lastModified: { type: Date },
    updatedAt: { type: Date, default: Date.now, index: true },
    nutriments: {
      "energy-kcal_100g": { type: Number },
      proteins_100g: { type: Number },
      fat_100g: { type: Number },
      "saturated-fat_100g": { type: Number },
      carbohydrates_100g: { type: Number },
      sugars_100g: { type: Number },
      salt_100g: { type: Number },
    },
  },
  {
    versionKey: false,
    minimize: false,
    collection: "body_harmony_products_slim",
  }
);

productSchema.set("readOnly", true);

module.exports = mongoose.model("Product", productSchema);