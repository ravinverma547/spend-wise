const nodemailer = require('nodemailer');

// Gmail SMTP transporter - explicit config for nodemailer v8 compatibility
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,  // SSL
  auth: {
    user: process.env.GMAIL_USER,       // Your Gmail: yourname@gmail.com
    pass: process.env.GMAIL_APP_PASS,   // Gmail App Password (16-char, no spaces)
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Startup pe config verify karo
transporter.verify((error) => {
  if (error) {
    console.error('❌ Gmail SMTP Config Error:', error.message);
  } else {
    console.log('✅ Gmail SMTP ready - emails bhej sakte hain!');
  }
});

/**
 * 6-digit OTP generate karta hai
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * OTP email bhejta hai
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} name - User ka naam
 */
const sendOTPEmail = async (toEmail, otp, name) => {
  const mailOptions = {
    from: `"SpendWise 💰" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Your SpendWise Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background:#060714; font-family: 'Arial', sans-serif;">
        <div style="max-width:520px; margin:40px auto; padding:0 16px;">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#7c3aed,#ec4899); border-radius:16px 16px 0 0; padding:32px; text-align:center;">
            <div style="font-size:2.5rem;">💰</div>
            <h1 style="color:white; margin:8px 0 4px; font-size:1.6rem; font-weight:800; letter-spacing:-0.03em;">SpendWise</h1>
            <p style="color:rgba(255,255,255,0.8); margin:0; font-size:0.9rem;">Financial Tracker</p>
          </div>
          
          <!-- Body -->
          <div style="background:#0f0f28; border:1px solid rgba(124,58,237,0.3); border-top:none; border-radius:0 0 16px 16px; padding:32px;">
            <h2 style="color:#f0f0ff; margin:0 0 8px; font-size:1.3rem;">Hello, ${name}! 👋</h2>
            <p style="color:#8888bb; margin:0 0 28px; font-size:0.95rem; line-height:1.6;">
              Aapka SpendWise verification code yahan hai. Yeh code sirf <strong style="color:#a78bfa;">5 minutes</strong> ke liye valid hai.
            </p>
            
            <!-- OTP Box -->
            <div style="background:rgba(124,58,237,0.1); border:2px dashed rgba(124,58,237,0.4); border-radius:12px; padding:24px; text-align:center; margin-bottom:28px;">
              <p style="color:#8888bb; margin:0 0 8px; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Your OTP Code</p>
              <div style="font-size:2.8rem; font-weight:900; letter-spacing:0.2em; color:#a78bfa; font-family:monospace;">${otp}</div>
            </div>
            
            <!-- Warning -->
            <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:8px; padding:12px 16px; margin-bottom:24px;">
              <p style="color:#fca5a5; margin:0; font-size:0.82rem;">⚠️ Yeh OTP kisi ke saath share mat karein. SpendWise team kabhi OTP nahi maangti.</p>
            </div>
            
            <p style="color:#8888bb; margin:0; font-size:0.82rem; text-align:center;">
              Agar aapne register nahi kiya toh is email ko ignore karein.
            </p>
          </div>
          
          <!-- Footer -->
          <p style="text-align:center; color:rgba(136,136,187,0.5); font-size:0.75rem; margin-top:20px;">
            © 2025 SpendWise. Sab rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };
