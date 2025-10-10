// server/utils/sendEmail.js

// This import loads all environment variables from the .env file.
import 'dotenv/config'; 

// Now import the required libraries using ES Module syntax.
import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';

const resend = new Resend(process.env.RESEND_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends the OTP email using RESEND with the correct brand template.
 */
const sendOtpEmailWithResend = async ({ to, otp }) => {
  const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <style> @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;700&display=swap'); </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8F4EE;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; border-spacing: 0;">
              <tr>
                  <td align="center" style="padding: 20px 0;">
                      <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #2C2A29; margin: 0;">SUGANDHMAYA</h1>
                  </td>
              </tr>
              <tr>
                  <td bgcolor="#ffffff" style="padding: 40px 30px; border-radius: 8px;">
                      <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #2C2A29; margin: 0 0 20px;">Your Verification Code</h2>
                      <p style="font-family: 'Inter', sans-serif; font-size: 16px; color: #3D352E; line-height: 1.6;">
                          Please use the following code to complete your order. This code will expire in 5 minutes.
                      </p>
                      <div style="margin: 30px 0; text-align: center;">
                          <p style="font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 700; color: #E5A44E; letter-spacing: 10px; padding: 15px; background-color: #F8F4EE; border-radius: 8px;">
                              ${otp}
                          </p>
                      </div>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: to,
      subject: 'Your Sugandhmaya Verification Code',
      html: emailHtml,
    });
    console.log(`✅ OTP Email sent successfully to ${to} via Resend.`);
  } catch (error) {
    console.error('❌ Error sending OTP email via Resend:', error);
    throw new Error('Failed to send OTP email via Resend.');
  }
};

/**
 * Sends the Order Confirmation email using SENDGRID.
 */
const sendOrderConfirmationWithSendGrid = async (order) => {
    const itemsHtml = order.items.map(item =>
        `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.scent} / ${item.size}) x ${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    ).join('');

    const emailHtml = `
      <body style="font-family: Arial, sans-serif; margin: 20px; color: #3D352E;">
        <h2 style="font-family: 'Playfair Display', serif; color: #2C2A29;">Thank you for your order, ${order.customer.name}!</h2>
        <p>Your order #${order._id.toString().slice(-6)} has been placed successfully.</p>
        <table width="100%" style="border-collapse: collapse; margin-top: 20px;">
          ${itemsHtml}
          <tr style="border-top: 2px solid #000; font-weight: bold;">
            <td style="padding: 10px;">Total</td>
            <td style="padding: 10px; text-align: right;">₹${order.total.toFixed(2)}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;"><strong>Shipping to:</strong><br>${order.customer.address}</p>
      </body>
    `;
    
    const msg = {
        to: order.customer.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `Your Sugandhmaya Order Confirmation (#${order._id.toString().slice(-6)})`,
        html: emailHtml,
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Order Confirmation sent to ${order.customer.email} via SendGrid.`);
    } catch (error) {
        console.error('❌ Error sending order confirmation via SendGrid:', error.response?.body || error);
        throw new Error('Failed to send order confirmation via SendGrid.');
    }
};

// Change to ES Module named exports
export {
  sendOtpEmailWithResend,
  sendOrderConfirmationWithSendGrid,
};