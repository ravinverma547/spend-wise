const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const transporter = require('../config/mailTransport');
const { getOTPTemplate } = require('../utils/emailTemplates');

/**
 * Generate a 6-digit numeric OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Register user & send OTP
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Spam Prevention: Check if an OTP was sent recently (e.g., within 1 minute)
    const existingOTP = await OTP.findOne({ email: email.toLowerCase() });
    if (existingOTP && (Date.now() - existingOTP.lastSentAt) < 60000) {
      return res.status(429).json({ 
        success: false, 
        message: 'Please wait at least 60 seconds before requesting another OTP' 
      });
    }

    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save or Update OTP record
    if (existingOTP) {
      existingOTP.otp = otp;
      existingOTP.name = name;
      existingOTP.password = hashedPassword;
      existingOTP.lastSentAt = Date.now();
      await existingOTP.save();
    } else {
      await OTP.create({
        email: email.toLowerCase(),
        otp,
        name,
        password: hashedPassword,
        lastSentAt: Date.now()
      });
    }

    // Send Email
    const mailOptions = {
      from: `"Spend Wise" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verification Code for Spend Wise',
      html: getOTPTemplate(name, otp),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email. Please verify to complete registration.' 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    // Returning the actual error message to help the user debug SMTP settings
    res.status(500).json({ 
      success: false, 
      message: `Error sending OTP: ${error.message || 'Server error'}` 
    });
  }
};

/**
 * @desc    Verify OTP & Create User
 * @route   POST /api/v1/auth/verify
 * @access  Public
 */
const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Create User
    const user = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password, // already hashed
    });

    // Clean up OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    console.error('Verification Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'User already registered during verification' });
    }
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/v1/auth/resend
 * @access  Public
 */
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No registration session found. Please register again.' });
    }

    // Spam Prevention
    if ((Date.now() - otpRecord.lastSentAt) < 60000) {
      return res.status(429).json({ 
        success: false, 
        message: 'Please wait at least 60 seconds before resending OTP' 
      });
    }

    const otp = generateOTP();
    otpRecord.otp = otp;
    otpRecord.lastSentAt = Date.now();
    await otpRecord.save();

    // Send Email
    const mailOptions = {
      from: `"Spend Wise" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'New Verification Code - Spend Wise',
      html: getOTPTemplate(otpRecord.name, otp),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'New OTP sent to your email.' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error resending OTP: ${error.message || 'Server error'}` 
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/user
 * @access  Private
 */
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching user' });
  }
};

/**
 * @desc    Update monthly budget
 * @route   PUT /api/v1/auth/budget
 * @access  Private
 */
const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    
    if (monthlyBudget === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide a monthly budget' });
    }

    const user = await User.findByIdAndUpdate(
      req.user, 
      { monthlyBudget }, 
      { new: true }
    ).select('-password');

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Update Budget Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating budget' });
  }
};

module.exports = {
  register,
  verify,
  login,
  resendOtp,
  getUser,
  updateBudget
};
