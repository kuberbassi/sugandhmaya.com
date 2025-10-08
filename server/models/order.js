const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        name: String,
        email: String,
        address: String,
        phone: String,
    },
    items: [{
        id: String,
        name: String,
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