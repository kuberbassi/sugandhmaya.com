// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/product');
const Order = require('./models/order'); // <-- IMPORT THE NEW ORDER MODEL
const sgMail = require('@sendgrid/mail'); // <-- IMPORT SENDGRID

// --- CONFIGURE SENDGRID ---
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Make sure your .env has SENDGRID_API_KEY=...

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static('../client/images'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.log("MongoDB connection error:", err));

// --- API ENDPOINT TO GET ALL PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
});

// --- NEW: API ENDPOINT TO HANDLE NEW ORDERS ---
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, total } = req.body;

        // 1. Save the order to your database
        const newOrder = new Order({ customer, items, total });
        await newOrder.save();
        console.log('Order saved to database.');

        // 2. Send the confirmation email to the customer
        const customerMsg = {
            to: customer.email,
            from: {
                name: 'Sugandhmaya',
                email: 'orders@sugandhmaya.com' // Use an email from your verified domain
            },
            subject: `Order Confirmed: Your Sugandhmaya Receipt #${newOrder._id}`,
            html: createCustomerEmailHtml(newOrder)
        };
        await sgMail.send(customerMsg);
        console.log(`Customer receipt sent to ${customer.email}`);

        // 3. Send the notification email to your company
        const companyMsg = {
            to: 'iortechnology2017@gmail.com', // <-- IMPORTANT: CHANGE THIS to your actual email
            from: {
                name: 'Sugandhmaya Website',
                email: 'noreply@sugandhmaya.com' // Use an email from your verified domain
            },
            subject: `New Order Received! #${newOrder._id}`,
            html: createCompanyEmailHtml(newOrder)
        };
        await sgMail.send(companyMsg);
        console.log('Company notification sent.');

        // 4. Send a success response back to the frontend
        res.status(200).json({ message: 'Order placed successfully!', orderId: newOrder._id });

    } catch (error) {
        console.error('Error processing order:', error);
        // If there's an error with SendGrid, check for more details
        if (error.response) {
            console.error(error.response.body);
        }
        res.status(500).json({ message: 'Failed to process order.' });
    }
});

// --- NEW: Helper function to generate customer email HTML ---
function createCustomerEmailHtml(order) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (x${item.quantity})</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://i.imgur.com/your-logo-image-url.png" alt="Sugandhmaya Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h2>Thank you for your order, ${order.customer.name}!</h2>
                <p>Your order #${order._id} has been confirmed. We'll notify you once it ships.</p>
                <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${itemsHtml}
                </table>
                <p style="text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px;">
                    Total: ₹${order.total.toFixed(2)}
                </p>
                <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Shipping to:</h3>
                <p>
                    ${order.customer.name}<br>
                    ${order.customer.address}<br>
                    ${order.customer.phone}
                </p>
                <hr>
                <p style="font-size: 0.8em; color: #777; text-align: center;">
                    If you have any questions, reply to this email or contact us at contact@sugandhmaya.com.
                </p>
            </div>
        </div>
    `;
}

// --- NEW: Helper function to generate company notification HTML ---
function createCompanyEmailHtml(order) {
    const itemsHtml = order.items.map(item => `<li>${item.name} (x${item.quantity}) - ₹${item.price} each</li>`).join('');
    return `
        <div style="font-family: Arial, sans-serif;">
            <h2>New Order Received! #${order._id}</h2>
            <p><strong>Customer:</strong> ${order.customer.name}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Address:</strong><br>${order.customer.address.replace(/\n/g, '<br>')}</p>
            <h3>Items:</h3>
            <ul>${itemsHtml}</ul>
            <hr>
            <h3>Total: ₹${order.total.toFixed(2)}</h3>
        </div>
    `;
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));