// server/utils/sendEmail.js
const sgMail = require('@sendgrid/mail');

// Set the API key from your .env file
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  const msg = {
    to: options.to,
    from: process.env.SENDGRID_FROM_EMAIL, // Use the verified email from .env
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('❌ Error sending email via SendGrid:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    // Re-throw the error to be caught by the calling function
    throw new Error('Failed to send email.');
  }
};

module.exports = sendEmail;