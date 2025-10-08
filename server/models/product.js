const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true }, // e.g., "40 Sticks"
  price: { type: Number, required: true },
  image: { type: String, required: true }, // Main image for this variant
  thumbnails: [String]
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  scents: [String], // Array of available scents like ["Rose", "Orchid"]
  variants: [variantSchema]
});

module.exports = mongoose.model('Product', productSchema);