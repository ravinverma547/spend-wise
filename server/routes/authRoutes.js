const express = require('express');
const router = express.Router();
const { register, login, getUser, updateBudget } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser);
router.put('/budget', auth, updateBudget);

module.exports = router;
