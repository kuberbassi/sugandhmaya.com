// server.js
require('dotenv').config({ path: './server/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const otpGenerator = require('otp-generator');

const connectDB = require('./server/db');
const { sendOtpEmailWithResend, sendOrderConfirmationWithSendGrid } = require('./server/utils/sendEmail');
const Product = require('./server/models/product');
const Order = require('./server/models/order');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const otpStore = {};

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

// --- API ROUTES ---

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
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    try {
        await sendOtpEmailWithResend({ to: email, otp: otp });
        res.status(200).json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
    }
});

apiRouter.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const storedOtpData = otpStore[email];
    if (storedOtpData && storedOtpData.otp === otp && Date.now() < storedOtpData.expires) {
        delete otpStore[email];
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});

apiRouter.post('/orders', async (req, res) => {
    try {
        const { customer, items: cartItems } = req.body;

        if (!customer || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing order data.' });
        }
        
        const productIds = cartItems.map(i => i.productId);
        const productsFromDB = await Product.find({ 'id': { $in: productIds } });

        let total = 0;
        const orderItems = [];

        for (const item of cartItems) {
            const product = productsFromDB.find(p => p.id === item.productId);
            if (!product) {
                throw new Error(`Invalid Order: Product '${item.productName}' is not available.`);
            }
            const variant = product.variants.find(v => v.name === item.size);
            if (!variant) {
                throw new Error(`Invalid Order: The selected size '${item.size}' for '${product.name}' is not available.`);
            }
            total += variant.price * item.quantity;
            orderItems.push({
                productId: item.productId,
                name: product.name,
                scent: item.scent,
                size: item.size,
                quantity: item.quantity,
                price: variant.price
            });
        }

        const newOrder = new Order({ customer, items: orderItems, total });
        const savedOrder = await newOrder.save();

        // **MODIFICATION START**
        // The order is saved. Now, TRY to send the email, but don't fail the whole request if this step fails.
        try {
            await sendOrderConfirmationWithSendGrid(savedOrder);
        } catch (emailError) {
            // Log the error for your own records, but don't stop the process.
            console.error(`CRITICAL: Order ${savedOrder._id} was saved, but confirmation email failed to send.`, emailError);
        }
        // **MODIFICATION END**

        // Send the successful response to the client regardless of email status.
        res.status(201).json({ success: true, message: 'Order placed successfully!', order: savedOrder });

    } catch (error) {
        console.error("Order placement failed:", error.message);
        if (error.message.startsWith('Invalid Order:')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'An internal server error occurred while placing the order.' });
    }
});


app.use('/api', apiRouter);

const clientPath = path.join(__dirname, 'client');
app.use(express.static(clientPath));

app.get('*', (req, res) => {
    const filePath = path.join(clientPath, req.path);
    if (path.extname(req.path).length > 0) {
        res.sendFile(filePath);
    } else {
        res.sendFile(path.join(clientPath, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});