const Expense = require('../models/Expense');
const User = require('../models/User');

const addExpense = async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;
    const newExpense = new Expense({
      user: req.user,
      amount,
      category,
      date,
      description,
    });
    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, search } = req.query;
    let query = { user: req.user };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user });

    // Total Spending
    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category-wise data
    const categoryData = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Monthly data for bar graph (last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        amount: 0
      });
    }

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const monthYear = {
        month: expDate.toLocaleString('default', { month: 'short' }),
        year: expDate.getFullYear()
      };
      const monthObj = last6Months.find(m => m.month === monthYear.month && m.year === monthYear.year);
      if (monthObj) {
        monthObj.amount += exp.amount;
      }
    });

    // Smart Insights Logic
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const lastMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      let lm = currentMonth - 1;
      let ly = currentYear;
      if (lm < 0) { lm = 11; ly--; }
      return d.getMonth() === lm && d.getFullYear() === ly;
    });

    const currentTotal = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);

    const insights = [];
    if (lastTotal > 0) {
      const diff = ((currentTotal - lastTotal) / lastTotal) * 100;
      if (diff > 0) {
        insights.push(`You spent ${diff.toFixed(1)}% more than last month.`);
      } else {
        insights.push(`Great! You spent ${Math.abs(diff).toFixed(1)}% less than last month.`);
      }
    }

    // Category with most spending
    const topCategory = Object.keys(categoryData).reduce((a, b) => categoryData[a] > categoryData[b] ? a : b, 'N/A');
    if (topCategory !== 'N/A') {
      insights.push(`Most of your money is going to ${topCategory}.`);
    }

    // Budget check
    const userDoc = await User.findById(req.user);
    if (userDoc.monthlyBudget > 0 && currentTotal > userDoc.monthlyBudget) {
      insights.push(`Warning: You have exceeded your monthly budget of ₹${userDoc.monthlyBudget}!`);
    }

    // Average Spending (over months that have data)
    const activeMonths = last6Months.filter(m => m.amount > 0).length || 1;
    const averageMonthlySpending = totalSpending / activeMonths;

    res.json({
      totalSpending,
      categoryData,
      monthlyData: last6Months,
      insights,
      userBudget: userDoc.monthlyBudget,
      currentMonthTotal: currentTotal,
      averageMonthlySpending
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.find({ user: userId });

    let total = 0;
    let categoryMap = {};

    expenses.forEach(e => {
      total += e.amount;
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    const categories = Object.keys(categoryMap);
    let topCategory = categories.length > 0 ? categories.reduce((a, b) => categoryMap[a] > categoryMap[b] ? a : b) : 'N/A';

    let insights = [];

    insights.push(`You spent ₹${total} in total.`);
    insights.push(`Top spending category is ${topCategory}.`);

    res.json({ insights });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getAnalytics,
  getInsights
};