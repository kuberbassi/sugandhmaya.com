// server/utils/sendEmail.js
require('dotenv').config({ path: './server/.env' });
const { Resend } = require('resend');
const sgMail = require('@sendgrid/mail');

const resend = new Resend(process.env.RESEND_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends the OTP email using RESEND.
 */
const sendOtpEmailWithResend = async ({ to, otp }) => {
    // This template is kept simple and functional for its purpose.
    const emailHtml = `
      <!DOCTYPE html><html><head><style> @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;700&display=swap'); </style></head><body style="margin: 0; padding: 0; background-color: #F8F4EE; font-family: 'Inter', sans-serif;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; border-spacing: 0;"><tr><td align="center" style="padding: 20px 0;"><h1 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #2C2A29; margin: 0;">SUGANDHMAYA</h1></td></tr><tr><td bgcolor="#ffffff" style="padding: 40px 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);"><h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #2C2A29; margin: 0 0 20px;">Your Verification Code</h2><p style="font-size: 16px; color: #3D352E; line-height: 1.6;">Please use the following code to complete your order. This code will expire in 5 minutes.</p><div style="margin: 30px 0; text-align: center;"><p style="font-size: 36px; font-weight: 700; color: #E5A44E; letter-spacing: 10px; padding: 15px; background-color: #F8F4EE; border-radius: 8px;">${otp}</p></div></td></tr></table></body></html>`;
    try {
        await resend.emails.send({
            // FIX: Added brand name to sender
            from: `Sugandhmaya Verification <${process.env.RESEND_FROM_EMAIL}>`, to: to,
            subject: 'Your Sugandhmaya Verification Code', html: emailHtml,
        });
        console.log(`✅ OTP Email sent successfully to ${to} via Resend.`);
    } catch (error) {
        console.error('❌ Error sending OTP email via Resend:', error);
        throw new Error('Failed to send OTP email via Resend.');
    }
};

/**
 * Sends the Order Confirmation email using SENDGRID to both customer and company.
 */
const sendOrderConfirmationWithSendGrid = async (order) => {
    const orderId = order._id.toString().slice(-6).toUpperCase();
    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 15px 10px; vertical-align: top;"><p style="margin: 0; font-weight: bold; color: #2C2A29;">${item.name}</p><p style="margin: 5px 0 0; font-size: 14px; color: #555;">${item.size} / ${item.scent}</p></td><td style="padding: 15px 10px; text-align: right; vertical-align: top;"><p style="margin: 0; font-weight: bold; color: #2C2A29;">₹${(item.quantity * item.price).toFixed(2)}</p><p style="margin: 5px 0 0; font-size: 14px; color: #555;">(${item.quantity} x ₹${item.price.toFixed(2)})</p></td></tr>
    `).join('');

    // --- BEAUTIFUL TEMPLATE FOR CUSTOMER ---
    const emailHtmlForCustomer = `
    <!DOCTYPE html><html><head><style> @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;700&display=swap'); </style></head><body style="margin: 0; padding: 0; background-color: #F8F4EE; font-family: 'DM Sans', sans-serif;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; border-spacing: 0;">
    <tr><td align="center" style="padding: 20px 0;">
        <img src="https://i.ibb.co/L98TcnB/Sugandhmaya-icon.png" alt="Sugandhmaya Logo" width="60" style="display: block;">
    </td></tr>
    <tr><td bgcolor="#ffffff" style="padding: 40px 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.07);">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; color: #2C2A29; margin: 0 0 10px;">Thank You for Your Order!</h1>
        <p style="font-size: 16px; color: #3D352E; line-height: 1.6;">Hi ${order.customer.name}, we've received your order <strong>#${orderId}</strong> and are getting it ready for you.</p>
        <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; margin-bottom: 20px;">Order Summary</h2>
        <table width="100%" cellspacing="0" cellpadding="0">${itemsHtml}</table>
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px; border-top: 2px solid #2C2A29;">
            <tr><td style="padding: 20px 0; font-weight: bold; font-size: 18px; color: #2C2A29;">Total</td><td style="padding: 20px 0; font-family: 'Playfair Display', serif; font-weight: bold; font-size: 22px; text-align: right; color: #E5A44E;">₹${order.total.toFixed(2)}</td></tr>
        </table>
    </td></tr>
    <tr><td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888;">
        <p style="margin: 0;"><strong>Visit Us:</strong> G-57, West End Mall, Janak Puri, New Delhi - 110058</p>
        <p style="margin: 8px 0;"><strong>Call Us:</strong> +91 9971055746</p>
        <p style="margin: 0;"><strong>Email Us:</strong> <a href="mailto:ops@indiaonroaming.com" style="color: #E5A44E; text-decoration: none; font-weight: bold;">ops@indiaonroaming.com</a></p>
    </td></tr>
    </table></body></html>`;

    // --- BEAUTIFUL DETAILED TEMPLATE FOR COMPANY ---
    const emailHtmlForCompany = `
    <!DOCTYPE html><html><head><style> @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;700&display=swap'); </style></head><body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'DM Sans', sans-serif;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; border-spacing: 0;">
    <tr><td align="center" style="padding: 20px 0;">
        <img src="https://i.ibb.co/L98TcnB/Sugandhmaya-icon.png" alt="Sugandhmaya Logo" width="60" style="display: block;">
    </td></tr>
    <tr><td bgcolor="#ffffff" style="padding: 40px 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.07);">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; color: #2C2A29; margin: 0 0 25px;">New Order to Fulfill</h1>
        <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; color: #2C2A29; margin: 0 0 15px; display: flex; align-items: center;"><span style="font-size: 28px; margin-right: 12px;">👤</span>Shipping Details</h2>
        <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 16px; line-height: 1.8; border-radius: 8px; background-color: #F8F4EE; padding: 20px;">
            <tr><td style="padding: 5px 10px; color: #555; width: 100px;">Name:</td><td style="font-weight: bold; color: #2C2A29;">${order.customer.name}</td></tr>
            <tr><td style="padding: 5px 10px; color: #555;">Email:</td><td><a href="mailto:${order.customer.email}" style="color: #E5A44E;">${order.customer.email}</a></td></tr>
            <tr><td style="padding: 5px 10px; color: #555;">Phone:</td><td><a href="tel:${order.customer.phone}" style="color: #E5A44E;">${order.customer.phone}</a></td></tr>
            <tr><td style="padding: 5px 10px; color: #555; vertical-align: top;">Address:</td><td>${order.customer.address},<br>${order.customer.state}, ${order.customer.country} - ${order.customer.pin}</td></tr>
        </table>
        <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; margin-bottom: 20px;">Order Summary (#${orderId})</h2>
        <table width="100%" cellspacing="0" cellpadding="0">${itemsHtml}</table>
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 20px; border-top: 2px solid #2C2A29;">
            <tr><td style="padding: 20px 0; font-weight: bold; font-size: 18px; color: #2C2A29;">Total</td><td style="padding: 20px 0; font-family: 'Playfair Display', serif; font-weight: bold; font-size: 22px; text-align: right; color: #E5A44E;">₹${order.total.toFixed(2)}</td></tr>
        </table>
    </td></tr></table></body></html>`;

    // Prepare emails for SendGrid
    const customerEmail = {
        to: order.customer.email,
        // FIX: Added brand name to sender
        from: `Sugandhmaya <${process.env.SENDGRID_FROM_EMAIL}>`,
        // FIX: Better email subject
        subject: `✨ Your Sugandhmaya Order #${orderId} is Confirmed!`,
        html: emailHtmlForCustomer,
    };

    const companyEmail = {
        to: process.env.COMPANY_EMAIL,
        // FIX: Added brand name to sender
        from: `Sugandhmaya - New Order <${process.env.SENDGRID_FROM_EMAIL}>`,
        // FIX: Better email subject
        subject: `✅ New Order Notification: #${orderId} (${order.customer.name})`,
        html: emailHtmlForCompany,
    };

    try {
        await sgMail.send([customerEmail, companyEmail]);
        console.log(`✅ Order Confirmation sent to customer (${customerEmail.to}) and company (${companyEmail.to}).`);
    } catch (error) {
        console.error('❌ Error sending order confirmation via SendGrid:', error.response?.body || error);
        throw new Error('Failed to send order confirmation via SendGrid.');
    }
};

module.exports = {
    sendOtpEmailWithResend,
    sendOrderConfirmationWithSendGrid,
};