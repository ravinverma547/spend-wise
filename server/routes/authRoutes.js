const express = require('express');
const router = express.Router();
const { 
  register, 
  verify, 
  login, 
  resendOtp,
  getUser,
  updateBudget
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// All routes are prefixed with /api/v1/auth in server.js
router.post('/register', register);
router.post('/verify', verify);
router.post('/login', login);
router.post('/resend', resendOtp);

// Protected routes
router.get('/user', auth, getUser);
router.put('/budget', auth, updateBudget);

module.exports = router;
