import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/expenses', { params: filters });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/expenses/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addExpense = async (expenseData) => {
    const res = await api.post('/expenses', expenseData);
    setExpenses(prev => [res.data, ...prev]);
    fetchAnalytics();
  };

  const updateExpense = async (id, updatedData) => {
    const res = await api.put(`/expenses/${id}`, updatedData);
    setExpenses(prev => prev.map(e => e._id === id ? res.data : e));
    fetchAnalytics();
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    setExpenses(prev => prev.filter(e => e._id !== id));
    fetchAnalytics();
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      analytics, 
      loading, 
      fetchExpenses, 
      fetchAnalytics, 
      addExpense, 
      updateExpense, 
      deleteExpense 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
