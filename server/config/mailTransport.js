const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS || process.env.GMAIL_APP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  family: 4, // Force IPv4 to avoid ENETUNREACH on IPv6
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
