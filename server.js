// server.js
require('dotenv').config({ path: './server/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const otpGenerator = require('otp-generator');

const { sendOtpEmailWithResend, sendOrderConfirmationWithSendGrid } = require('./server/services/emailService');
const { getProducts, saveOrder, isCatalogConfigured, isOrderStorageConfigured } = require('./server/services/database');

const app = express();
const PORT = process.env.PORT || 5000;
const otpStore = {};
const productCache = { data: null, expiresAt: 0 };
const PRODUCT_CACHE_TTL = 5 * 60 * 1000;

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

// --- API ROUTES ---

apiRouter.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        database: isCatalogConfigured() ? 'connected' : 'unconfigured',
        productSource: 'supabase',
        ordering: isOrderStorageConfigured() ? 'connected' : 'unconfigured',
        email: {
            otp: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
            confirmation: Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL && process.env.COMPANY_EMAIL)
        }
    });
});

apiRouter.get('/products', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
        if (productCache.data && productCache.expiresAt > Date.now()) {
            return res.status(200).json(productCache.data);
        }

        const { products, source } = await getProducts();
        productCache.data = products;
        productCache.expiresAt = Date.now() + PRODUCT_CACHE_TTL;
        res.set('X-Product-Source', source);
        res.status(200).json(products);
    } catch (error) {
        console.error("Failed to fetch products from DB:", error.message);
        if (productCache.data) {
            res.set('X-Product-Source', 'cache-fallback');
            return res.status(200).json(productCache.data);
        }
        const fallbackCatalog = require('./server/data/catalog');
        res.set('X-Product-Source', 'catalog-fallback');
        res.status(200).json(fallbackCatalog);
    }
});

apiRouter.post('/send-otp', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'A valid email is required.' });
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
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
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

        if (!customer || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing order data.' });
        }

        const requiredCustomerFields = ['name', 'email', 'phone', 'country', 'state', 'address', 'pin'];
        if (requiredCustomerFields.some(field => !String(customer[field] || '').trim())) {
            return res.status(400).json({ success: false, message: 'Please complete all shipping information.' });
        }

        const productIds = cartItems.map(i => i.productId);
        const { products: catalogue } = await getProducts();
        const productsFromDB = catalogue.filter(product => productIds.includes(product.id));

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
            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                throw new Error(`Invalid Order: Invalid quantity for '${product.name}'.`);
            }
            total += variant.price * quantity;
            orderItems.push({
                productId: item.productId,
                name: product.name,
                scent: item.scent,
                size: item.size,
                quantity,
                price: variant.price
            });
        }

        const orderData = { customer, items: orderItems, total };
        const savedOrder = await saveOrder(orderData);

        try {
            await sendOrderConfirmationWithSendGrid(savedOrder);
        } catch (emailError) {
            console.error(`CRITICAL: Order ${savedOrder._id} was saved, but confirmation email failed to send.`, emailError);
        }

        res.status(201).json({ success: true, message: 'Order placed successfully!', order: savedOrder, storage: 'supabase' });

    } catch (error) {
        console.error("Order placement failed:", error.message);
        if (error.message.startsWith('Invalid Order:')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'An internal server error occurred while placing the order.' });
    }
});


app.use('/api', apiRouter);


// Serve static files from the React app
const clientPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientPath));

app.get('*', (req, res) => {
    if (path.extname(req.path).length > 0) {
        return res.status(404).send('Asset not found');
    }
    res.sendFile(path.join(clientPath, 'index.html'));
});


if (require.main === module) {
    app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
}

module.exports = app;
