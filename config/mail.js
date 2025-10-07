const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set your SendGrid API key
sgMail.setApiKey(process.env.Mail_API_KEY);

const sendMail = async (to, subject, htmlMessage) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_USER, // Must be verified in SendGrid
      subject,
      html: htmlMessage,
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.response?.body || error.message);
    return false;
  }
};

module.exports = { sendMail };
