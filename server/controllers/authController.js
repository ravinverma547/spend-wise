const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

// ─── STEP 1: OTP bhejo ───────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Saari fields zaroori hain.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Yeh email pehle se registered hai.' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Password hash karke temporarily store karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Purana OTP delete karo (agar tha)
    await OTP.deleteMany({ email });

    // Naya OTP save karo (5 min TTL)
    await OTP.create({ email, otp, name, password: hashedPassword });

    // Email bhejo
    await sendOTPEmail(email, otp, name);

    res.status(200).json({ message: `OTP bhej diya gaya: ${email}` });
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ message: 'Email bhejne mein dikkat aayi. Gmail config check karein.' });
  }
};

// ─── STEP 2: OTP verify karo aur register karo ───────────────────────────────
const verifyOtpAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email aur OTP zaroori hain.' });
    }

    // OTP record dhundo
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expire ho gaya ya exist nahi karta. Dobara try karein.' });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Galat OTP. Dobara check karein.' });
    }

    // Double-check user exist nahi karta
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ message: 'Yeh email pehle se registered hai.' });
    }

    // User banao (password already hashed hai)
    const user = new User({
      name: otpRecord.name,
      email,
      password: otpRecord.password,
    });

    // Password hook bypass karo (already hashed hai)
    await User.collection.insertOne({
      name: otpRecord.name,
      email,
      password: otpRecord.password,
      monthlyBudget: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // OTP record delete karo
    await OTP.deleteMany({ email });

    // Saved user dhundo for token
    const savedUser = await User.findOne({ email });
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        monthlyBudget: savedUser.monthlyBudget,
      },
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ya password galat hai.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ya password galat hai.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET USER ─────────────────────────────────────────────────────────────────
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Get User Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE BUDGET ────────────────────────────────────────────────────────────
const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    const user = await User.findByIdAndUpdate(req.user, { monthlyBudget }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Update Budget Error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendOtp, verifyOtpAndRegister, login, getUser, updateBudget };
