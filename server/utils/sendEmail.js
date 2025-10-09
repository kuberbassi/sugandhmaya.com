// server/utils/sendEmail.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * A generic function that sends emails via SendGrid.
 */
const sendEmail = async (options) => {
  const msg = {
    to: options.to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: options.subject,
    html: options.html,
  };
  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('❌ Error sending email via SendGrid:', error.response?.body || error);
    throw new Error('Failed to send email.');
  }
};

/**
 * Creates and sends a branded HTML email for OTP verification.
 */
const sendOtpEmail = async ({ to, otp }) => {
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
                          <p style="font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 700; color: #E5A44E; letter-spacing: 10px; margin: 0; padding: 15px; background-color: #F8F4EE; border-radius: 8px;">
                              ${otp}
                          </p>
                      </div>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;

    await sendEmail({
        to: to,
        subject: 'Your Sugandhmaya Verification Code',
        html: emailHtml
    });
};


/**
 * Creates and sends a branded HTML email for order confirmations.
 */
const sendOrderConfirmationEmail = async (order) => {
    const itemsHtml = order.items.map(item => `...`).join(''); // This logic is already correct
    const emailHtml = `...`; // This logic is also correct from before
    
    await sendEmail({
        to: order.customer.email,
        subject: `Your Sugandhmaya Order Confirmation (#${order._id.toString().slice(-6)})`,
        html: emailHtml, // Your beautiful order confirmation template
    });
};

module.exports = { sendOtpEmail, sendOrderConfirmationEmail };