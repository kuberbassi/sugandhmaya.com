// server/models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        name: String,
        email: String,
        phone: String,
        address: String,
        // FIX: Added missing fields to save to the database
        state: String,
        country: String,
        pin: String,
    },
    items: [{
        productId: String,
        name: String,
        scent: String,
        size: String,
        quantity: Number,
        price: Number,
    }],
    total: Number,
    orderDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);