import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brands: { type: String },
    countries_tags: [{ type: String }],
    nutriscore: { type: String, default: 'unknown' },
    allergens: [{ type: String }],
    lastModified: { type: Date },
    updatedAt: { type: Date, default: Date.now, index: true },
    nutriments: {
      'energy-kcal_100g': { type: Number },
      proteins_100g: { type: Number },
      fat_100g: { type: Number },
      'saturated-fat_100g': { type: Number },
      carbohydrates_100g: { type: Number },
      sugars_100g: { type: Number },
      salt_100g: { type: Number },
    },
  },
  {
    versionKey: false,
    minimize: false,
    collection: 'body_harmony_products_slim',
  }
);
productSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    code: obj.code,
    name: obj.name,
    brands: obj.brands,
    countries_tags: obj.countries_tags,
    nutriscore: obj.nutriscore,
    allergens: obj.allergens,
    lastModified: obj.lastModified,
    updatedAt: obj.updatedAt,
    // TODO: i see that in my source liquids are also given in g so for now we will use g for all units
    nutrientsPer100g: {
      calories: obj.nutriments['energy-kcal_100g'],
      proteins: obj.nutriments.proteins_100g,
      carbs: obj.nutriments.carbohydrates_100g,
      fat: obj.nutriments.fat_100g,
    },
  };
};

productSchema.set('readOnly', true);

export default mongoose.model('Product', productSchema);
