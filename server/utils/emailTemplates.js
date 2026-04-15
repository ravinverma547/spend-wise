/**
 * Generates a clean HTML email template for OTP verification
 * @param {string} name - User's name
 * @param {string} otp - 6-digit OTP
 * @returns {string} - HTML string
 */
const getOTPTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        .container {
          max-width: 500px;
          margin: 40px auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fdfdfd;
          border: 1px solid #e1e1e1;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .header {
          background: #3b82f6;
          padding: 30px;
          text-align: center;
          color: white;
        }
        .body {
          padding: 30px;
          color: #333;
          line-height: 1.6;
        }
        .otp-box {
          background: #f3f4f6;
          padding: 20px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #1e3a8a;
          margin: 20px 0;
          border-radius: 8px;
          border: 1px dashed #3b82f6;
        }
        .footer {
          padding: 20px;
          text-align: center;
          background: #f9fafb;
          color: #6b7280;
          font-size: 13px;
        }
      </style>
    </head>
    <body style="margin:0; padding:0; background:#f3f4f6;">
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size:24px;">Verification Code</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for choosing <strong>Spend Wise</strong>. Use the following OTP to complete your registration. This code is valid for <strong>5 minutes</strong>.</p>
          <div class="otp-box">${otp}</div>
          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          &copy; 2024 Spend Wise. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getOTPTemplate };
