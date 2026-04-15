const express = require('express');
const router = express.Router();
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getAnalytics,
  getInsights
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.use(auth); // Protect all expense routes

router.post('/', addExpense);
router.get('/', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.get('/analytics', getAnalytics);
router.get('/insights', getInsights);

module.exports = router;
