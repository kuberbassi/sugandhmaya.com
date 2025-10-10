// server/models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        name: String,
        email: String,
        address: String,
        phone: String,
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

// Change to CommonJS export
module.exports = mongoose.model('Order', orderSchema);