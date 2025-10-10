// server.js
require('dotenv').config({ path: './server/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const otpGenerator = require('otp-generator');

// Correctly import the updated files that now use module.exports
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
        console.error("Failed to fetch products:", error);
        res.status(500).json({ message: 'Failed to fetch products.' });
    }
});

apiRouter.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    try {
        await sendOtpEmailWithResend({ to: email, otp: otp });
        res.status(200).json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
    }
});

apiRouter.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = otpStore[email];

    if (storedOtp && storedOtp.otp === otp && Date.now() < storedOtp.expires) {
        delete otpStore[email];
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});

apiRouter.post('/orders', async (req, res) => {
    try {
        const { customer, items } = req.body;
        
        const productIds = items.map(i => i.productId);
        const productsFromDB = await Product.find({ 'id': { $in: productIds } });

        let total = 0;
        const orderItems = items.map(item => {
            const product = productsFromDB.find(p => p.id === item.productId);
            if (!product) throw new Error(`Product not found.`);
            const variant = product.variants.find(v => v.name === item.size);
            if (!variant) throw new Error(`Variant not found.`);
            total += variant.price * item.quantity;
            return { ...item, name: product.name, price: variant.price };
        });

        const newOrder = new Order({ customer, items: orderItems, total });
        const savedOrder = await newOrder.save();

        await sendOrderConfirmationWithSendGrid(savedOrder);

        res.status(201).json({ success: true, message: 'Order placed successfully!', order: savedOrder });
    } catch (error) {
        console.error("Order placement failed:", error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
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