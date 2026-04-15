const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Updated env var name as per request
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mail Server Connection Error:', error);
  } else {
    console.log('✅ Mail Server is ready to send messages');
  }
});

module.exports = transporter;
