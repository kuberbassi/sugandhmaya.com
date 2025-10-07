// server/models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // URL to the main image
    thumbnails: [String] // Array of URLs to thumbnail images
});

module.exports = mongoose.model('Product', productSchema);