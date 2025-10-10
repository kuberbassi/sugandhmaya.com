// server/models/product.js
const mongoose = require('mongoose');

// Define the variant schema first
const variantSchema = new mongoose.Schema({
  id: String,
  name: String,
  sticks: Number,
  price: Number,
  images: [String]
});

// Define the product schema using the variant schema
const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  scents: [String],
  variants: [variantSchema],
  description: String,
  featuredImage: String
});

const Product = mongoose.model('Product', productSchema);

// Change to CommonJS export
module.exports = Product;