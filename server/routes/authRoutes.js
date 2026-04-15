const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtpAndRegister, login, getUser, updateBudget } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/send-otp', sendOtp);           // Step 1: OTP bhejo
router.post('/register', verifyOtpAndRegister); // Step 2: OTP verify + register
router.post('/login', login);
router.get('/user', auth, getUser);
router.put('/budget', auth, updateBudget);

module.exports = router;
