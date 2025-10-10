// server.js
require('dotenv').config({ path: './server/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const otpGenerator = require('otp-generator');

// Correctly import the new specific functions
const { sendOtpEmailWithResend, sendOrderConfirmationWithSendGrid } = require('./server/utils/sendEmail');
const Product = require('./server/models/product');
const Order = require('./server/models/order');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected.'))
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    });

const app = express();
const PORT = process.env.PORT || 5000;
const otpStore = {};

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products.' });
    }
});

apiRouter.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    try {
        // Call the Resend function for OTP
        await sendOtpEmailWithResend({ to: email, otp: otp });
        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP email.' });
    }
});

apiRouter.post('/orders', async (req, res) => {
    try {
        const { customer, items, otp } = req.body;
        if (!otp || !otpStore[customer.email] || otpStore[customer.email].otp !== otp || Date.now() > otpStore[customer.email].expires) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }
        delete otpStore[customer.email];

        const productIds = items.map(i => i.productId);
        const productsFromDB = await Product.find({ 'id': { $in: productIds } });

        let total = 0;
        const orderItems = items.map(item => {
            const product = productsFromDB.find(p => p.id === item.productId);
            if (!product) throw new Error(`Product not found.`);
            const variant = product.variants.find(v => v.size === item.size);
            if (!variant) throw new Error(`Variant not found.`);
            total += variant.price * item.quantity;
            return { ...item, name: product.name, price: variant.price };
        });

        const newOrder = new Order({ customer, items: orderItems, total });
        const savedOrder = await newOrder.save();
        
        // Call the SendGrid function for the order receipt
        await sendOrderConfirmationWithSendGrid(savedOrder);
        
        res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, total: savedOrder.total });
    } catch (error) {
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

app.use('/api', apiRouter);

const clientPath = path.join(__dirname, 'client');
app.use(express.static(clientPath));

app.get('/', (req, res) => res.sendFile(path.join(clientPath, 'index.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(clientPath, 'shop.html')));
app.get('/product', (req, res) => res.sendFile(path.join(clientPath, 'product.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(clientPath, 'checkout.html')));
app.get('/confirmation', (req, res) => res.sendFile(path.join(clientPath, 'confirmation.html')));
app.get('/privacy-policy', (req, res) => res.sendFile(path.join(clientPath, 'privacy-policy.html')));

app.listen(PORT, () => {
    console.log(`🚀 Server is running and serving your website on http://localhost:${PORT}`);
});