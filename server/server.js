// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const otpGenerator = require('otp-generator');

const Product = require('./models/product');
const Order = require('./models/order');
const sendEmail = require('./utils/sendEmail');

const app = express();
const PORT = process.env.PORT || 5000;

// This is a temporary in-memory store for OTPs. For a production environment,
// you would use a more persistent store like Redis.
const otpStore = {};

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// --- API Routes ---

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// POST to generate and send an OTP
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
    });

    // Store the OTP with the email and set an expiration time (e.g., 5 minutes)
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    console.log(`Generated OTP for ${email}: ${otp}`);

    try {
        await sendEmail({
            to: email,
            subject: 'Your Sugandhmaya Order Verification Code',
            text: `Your one-time verification code is: ${otp}`,
            html: `<strong>Your one-time verification code is: ${otp}</strong><p>This code will expire in 5 minutes.</p>`
        });
        res.status(200).json({ message: 'OTP sent successfully to your email.' });
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        res.status(500).json({ message: 'Failed to send OTP email.' });
    }
});

// POST a new order (with OTP verification)
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, otp } = req.body;

        // --- 1. OTP Verification ---
        if (!otp) {
            return res.status(400).json({ message: 'Verification code is required.' });
        }
        const storedOtpData = otpStore[customer.email];
        if (!storedOtpData) {
            return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
        }
        if (Date.now() > storedOtpData.expires) {
            delete otpStore[customer.email]; // Clean up expired OTP
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        if (storedOtpData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }
        
        // OTP is valid, so we can delete it now
        delete otpStore[customer.email];

        // --- 2. Create the Order ---
        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ message: 'Missing customer data or items.' });
        }
        
        const productIds = items.map(item => item.productId);
        const productsFromDB = await Product.find({ 'id': { $in: productIds } });

        let total = 0;
        const orderItems = items.map(item => {
            const product = productsFromDB.find(p => p.id === item.productId);
            if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
            const variant = product.variants.find(v => v.size === item.size);
            if (!variant) throw new Error(`Variant for size ${item.size} not found for product ${item.productId}.`);
            
            total += variant.price * item.quantity;
            return {
                productId: item.productId,
                name: product.name, // The fix for the 500 error
                scent: item.scent,
                size: item.size,
                quantity: item.quantity,
                price: variant.price
            };
        });

        const newOrder = new Order({ customer, items: orderItems, total, orderDate: new Date() });
        await newOrder.save();
        
        // You can send a final receipt email here if you want
        // await sendEmail({ to: customer.email, subject: 'Your Sugandhmaya Order Confirmation', ... });

        res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder._id, total });

    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({ message: 'An internal error occurred while creating the order.' });
    }
});

// --- Fallback Route ---
// This sends index.html for any request that doesn't match a static file or API route
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});