// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const otpGenerator = require('otp-generator');

const { sendOtpEmail, sendOrderConfirmationEmail } = require('./utils/sendEmail');
const Product = require('./models/product');
const Order = require('./models/order');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected.'))
    .catch(err => { console.error('❌ MongoDB Connection Failed:', err.message); process.exit(1); });

const app = express();
const PORT = process.env.PORT || 5000;
const otpStore = {};

app.use(cors());
app.use(express.json());
const apiRouter = express.Router();

// Get Products (No changes needed)
apiRouter.get('/products', async (req, res) => { /* ... */ });

// Send OTP (Updated to use the new branded email function)
apiRouter.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    try {
        await sendOtpEmail({ to: email, otp: otp });
        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP email.' });
    }
});

// Place Order (Updated to send the final confirmation email)
apiRouter.post('/orders', async (req, res) => {
    try {
        const { customer, items, otp } = req.body;
        if (!otp || otpStore[customer.email]?.otp !== otp || Date.now() > otpStore[customer.email]?.expires) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }
        delete otpStore[customer.email];

        const productsFromDB = await Product.find({ 'id': { $in: items.map(i => i.productId) } });
        let total = 0;
        const orderItems = items.map(item => {
            const product = productsFromDB.find(p => p.id === item.productId);
            const variant = product.variants.find(v => v.size === item.size);
            total += variant.price * item.quantity;
            return { ...item, name: product.name, price: variant.price };
        });

        const newOrder = new Order({ customer, items: orderItems, total });
        const savedOrder = await newOrder.save();
        
        // --- THIS IS THE FINAL FIX ---
        // It now sends the beautiful, branded order confirmation email
        await sendOrderConfirmationEmail(savedOrder);
        
        res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, total: savedOrder.total });
    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({ message: 'An internal error occurred.' });
    }
});

app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, '../client')));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});