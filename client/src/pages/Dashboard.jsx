import React, { useEffect, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Download, TrendingUp, Wallet, PieChart as PieChartIcon,
  ArrowRight, Lightbulb, Search, Filter, Calendar, Loader2,
  Sparkles, BarChart2, Activity, X, ChevronDown, FileText, Table2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';

const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#f97316', '#8b5cf6'];
const CATEGORIES = ["Food", "Transportation", "Entertainment", "Shopping", "Utilities", "Health", "Education", "Travel", "Others"];

const CATEGORY_ICONS = {
  Food: '🍔', Transportation: '🚗', Entertainment: '🎬', Shopping: '🛍️',
  Utilities: '💡', Health: '❤️', Education: '📚', Travel: '✈️', Others: '📦'
};

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,15,40,0.95)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <p style={{ color: '#a78bfa', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ color: 'white', fontWeight: 700 }}>₹{payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { expenses, analytics, loading, fetchExpenses, fetchAnalytics, addExpense, deleteExpense } = useExpenses();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '', startDate: '', endDate: '' });
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    const t = setTimeout(() => fetchExpenses(filters), 500);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => { fetchAnalytics(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addExpense({ ...formData, amount: parseFloat(formData.amount) });
    setFormData({ amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], description: '' });
    setShowForm(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Spend Wise — Expense Report', 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: expenses.map(e => [new Date(e.date).toLocaleDateString(), e.category, e.description, `₹${e.amount}`]),
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237] }
    });
    doc.save('expenses.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(expenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Category: e.category,
      Description: e.description,
      Amount: e.amount
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, "expenses.xlsx");
  };

  const pieData = analytics?.categoryData
    ? Object.keys(analytics.categoryData).map(key => ({ name: key, value: analytics.categoryData[key] }))
    : [];

  const budgetUsagePercent = Math.min(100, ((analytics?.currentMonthTotal || 0) / (analytics?.userBudget || 1)) * 100);
  const remaining = Math.max(0, (analytics?.userBudget || 0) - (analytics?.currentMonthTotal || 0));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">

      {/* ===== HEADER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.08))',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '1.5rem',
        padding: '1.75rem 2rem',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG decoration */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', left: '30%',
          width: '150px', height: '150px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {greeting()}, {user?.name?.split(' ')[0]}! 👋
              </span>
            </div>
            <h1 style={{
              fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #f0f0ff 30%, #a78bfa)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              lineHeight: 1.1,
            }}>
              Financial Overview
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Track spending, analyze trends & hit your goals
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                color: 'white', border: 'none',
                borderRadius: '0.875rem',
                fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(124,58,237,0.45)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 10px 32px rgba(124,58,237,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.45)')}
            >
              <Plus size={18} /> Add Expense
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { fn: exportPDF, icon: <FileText size={16} />, label: 'PDF', color: '#ef4444' },
                { fn: exportExcel, icon: <Table2 size={16} />, label: 'Excel', color: '#10b981' },
              ].map((btn, i) => (
                <button key={i} onClick={btn.fn} title={`Download ${btn.label}`} style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.65rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${btn.color}30`,
                  borderRadius: '0.75rem',
                  color: btn.color,
                  fontWeight: 600, fontSize: '0.8rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${btn.color}15`, e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)', e.currentTarget.style.transform = 'none')}
                >
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS GRID ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          {
            title: 'Monthly Budget', value: analytics?.userBudget,
            icon: <Wallet size={22} />, emoji: '💰',
            gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            glow: 'rgba(124,58,237,0.4)', progress: budgetUsagePercent,
          },
          {
            title: 'Spent This Month', value: analytics?.currentMonthTotal,
            icon: <TrendingUp size={22} />, emoji: '📊',
            gradient: 'linear-gradient(135deg, #ec4899, #f9a8d4)',
            glow: 'rgba(236,72,153,0.4)',
          },
          {
            title: 'Avg. Monthly Spend', value: Math.round(analytics?.averageMonthlySpending || 0),
            icon: <Activity size={22} />, emoji: '📈',
            gradient: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
            glow: 'rgba(245,158,11,0.4)',
          },
          {
            title: 'Remaining Balance', value: remaining,
            icon: <Sparkles size={22} />, emoji: '✨',
            gradient: 'linear-gradient(135deg, #10b981, #6ee7b7)',
            glow: 'rgba(16,185,129,0.4)',
          },
        ].map((stat, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <StatCard {...stat} />
            {stat.title === 'Monthly Budget' && (
              <button
                onClick={() => {
                  const b = prompt('Update Monthly Budget (₹):', analytics?.userBudget || 0);
                  if (b !== null && b !== '' && !isNaN(parseFloat(b))) {
                    api.put('/auth/budget', { monthlyBudget: parseFloat(b) })
                      .then(() => { fetchAnalytics(); alert('Budget Updated! ✅'); })
                      .catch(() => alert('Failed to update budget. Check your connection.'));
                  }
                }}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.65rem', fontWeight: 800,
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: '0.5rem',
                  color: '#a78bfa',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                UPDATE
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ===== FILTERS ===== */}
      <div style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '1.25rem',
        padding: '1.25rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        alignItems: 'end',
      }}>
        {[
          { label: 'Search', icon: <Search size={15} />, type: 'text', placeholder: 'Food, rent...', key: 'search' },
          { label: 'Category', icon: <Filter size={15} />, type: 'select', key: 'category' },
          { label: 'Date From', icon: <Calendar size={15} />, type: 'date', key: 'startDate' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {f.icon} {f.label}
            </label>
            <div style={{ position: 'relative' }}>
              {f.type === 'select' ? (
                <select
                  className="input-field"
                  style={{ paddingLeft: '0.875rem', height: '42px' }}
                  value={filters[f.key]}
                  onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                </select>
              ) : (
                <input
                  type={f.type}
                  className="input-field"
                  style={{ height: '42px', paddingLeft: '0.875rem' }}
                  placeholder={f.placeholder}
                  value={filters[f.key]}
                  onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                />
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => setFilters({ search: '', category: '', startDate: '', endDate: '' })}
          style={{
            height: '42px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.1)', e.currentTarget.style.color = '#a78bfa')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)', e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ✕ Reset
        </button>
      </div>

      {/* ===== MAIN CONTENT GRID ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

          {/* Bar Chart */}
          <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #7c3aed, #ec4899)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(124,58,237,0.15)', borderRadius: '0.625rem' }}>
                <BarChart2 size={18} color="#a78bfa" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Monthly Spending Trend</h3>
            </div>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.monthlyData || []} barSize={32}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(124,58,237,0.1)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart + Breakdown */}
          <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #ec4899)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.15)', borderRadius: '0.625rem' }}>
                <PieChartIcon size={18} color="#fcd34d" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Spending by Category</h3>
            </div>

            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
              {pieData.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.625rem',
                  transition: 'background 0.15s ease',
                  cursor: 'default',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{CATEGORY_ICONS[item.name]} {item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>₹{item.value?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Transactions + Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

          {/* Transactions Table */}
          <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            position: 'relative', overflow: 'hidden',
            gridColumn: 'span 2',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.15)', borderRadius: '0.625rem' }}>
                  <Activity size={18} color="#6ee7b7" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Recent Transactions</h3>
              </div>
              {loading && <Loader2 size={18} color="#a78bfa" style={{ animation: 'spin 1s linear infinite' }} />}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    {['Date', 'Category', 'Description', 'Amount', ''].map((h, i) => (
                      <th key={i} style={{
                        padding: '0.75rem 1rem',
                        textAlign: i === 4 ? 'right' : 'left',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--text-muted)',
                        background: 'rgba(124,58,237,0.06)',
                        borderBottom: '1px solid var(--border-color)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp, idx) => (
                    <tr key={exp._id} style={{ transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem', borderBottom: '1px solid rgba(124,58,237,0.06)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid rgba(124,58,237,0.06)' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          background: `${COLORS[CATEGORIES.indexOf(exp.category) % COLORS.length]}18`,
                          color: COLORS[CATEGORIES.indexOf(exp.category) % COLORS.length],
                          border: `1px solid ${COLORS[CATEGORIES.indexOf(exp.category) % COLORS.length]}30`,
                          fontSize: '0.72rem', fontWeight: 700,
                        }}>
                          {CATEGORY_ICONS[exp.category]} {exp.category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid rgba(124,58,237,0.06)', fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.description}
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid rgba(124,58,237,0.06)', fontSize: '1rem', fontWeight: 800, color: '#f0f0ff' }}>
                        ₹{exp.amount?.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid rgba(124,58,237,0.06)', textAlign: 'right' }}>
                        <button
                          onClick={() => deleteExpense(exp._id)}
                          style={{
                            padding: '0.3rem 0.7rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#fca5a5',
                            fontSize: '0.72rem', fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            opacity: 0,
                          }}
                          className="del-btn"
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)', e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)', e.currentTarget.style.opacity = '0')}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && expenses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                  <div style={{
                    width: '60px', height: '60px',
                    background: 'rgba(124,58,237,0.1)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}>
                    <Search size={24} color="#a78bfa" />
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>No transactions found</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try adjusting filters or add a new expense.</p>
                </div>
              )}
            </div>
          </div>

          {/* Smart Insights */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.06))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #7c3aed)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.15)', borderRadius: '0.625rem' }}>
                <Lightbulb size={18} color="#fcd34d" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>💡 Smart Insights</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics?.insights?.map((insight, idx) => (
                <div key={idx} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.875rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '0.875rem',
                  border: '1px solid rgba(124,58,237,0.15)',
                  animation: 'fadeIn 0.4s ease forwards',
                  animationDelay: `${idx * 100}ms`,
                  opacity: 0,
                }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '0.1rem',
                  }}>
                    <ArrowRight size={12} color="white" />
                  </div>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-main)' }}>{insight}</p>
                </div>
              ))}
              {!analytics?.insights?.length && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <Sparkles size={32} color="#a78bfa" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                  Add more expenses to unlock personalized financial tips!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== FAB (Mobile) ===== */}
      <button
        onClick={() => setShowForm(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '58px', height: '58px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          color: 'white', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(124,58,237,0.5)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 90,
        }}
        className="md:hidden"
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)', e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.5)')}
      >
        <Plus size={26} />
      </button>

      {/* ===== Budget FAB ===== */}
      <div style={{ position: 'fixed', bottom: '6.5rem', right: '2.2rem', zIndex: 9999 }}>
        <button
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(15,15,40,0.95)',
            border: '2px solid rgba(124,58,237,0.5)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)', e.currentTarget.style.borderColor = '#7c3aed')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'none', e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
          onClick={() => {
            try {
              const currentBudget = analytics?.userBudget || 0;
              const b = prompt('Update Monthly Budget (₹):', currentBudget);
              if (b !== null && b !== '' && !isNaN(parseFloat(b))) {
                api.put('/auth/budget', { monthlyBudget: parseFloat(b) })
                  .then(() => {
                    fetchAnalytics();
                    alert('Budget updated successfully! ✅');
                  })
                  .catch((err) => {
                    console.error('Budget Update Error:', err);
                    alert('Failed to update budget. Please check your connection.');
                  });
              }
            } catch (err) {
              console.error('Prompt Error:', err);
            }
          }}
          title="Manage Monthly Budget"
        >
          <Wallet size={24} color="#a78bfa" />
        </button>
      </div>

      {/* ===== ADD EXPENSE MODAL ===== */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: 'rgba(10,10,30,0.97)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '1.5rem',
            padding: '2rem',
            width: '100%', maxWidth: '480px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.2)',
            position: 'relative', overflow: 'hidden',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #7c3aed, #ec4899, #06b6d4)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>New Transaction</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Record your expense below</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)', e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)', e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                <X size={16} color="#fca5a5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Amount (₹)</label>
                <input
                  type="number" step="0.01"
                  className="input-field"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  style={{ fontSize: '1.5rem', fontWeight: 700, height: '56px', letterSpacing: '-0.02em', color: '#f0f0ff', caretColor: '#a78bfa' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ height: '46px', color: '#f0f0ff' }}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    style={{ height: '46px', color: '#f0f0ff', caretColor: '#a78bfa' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Description</label>
                <textarea
                  className="input-field"
                  placeholder="What did you spend on?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ height: '90px', resize: 'none', color: '#f0f0ff', caretColor: '#a78bfa' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  borderRadius: '0.875rem',
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  color: 'white', border: 'none',
                  fontWeight: 800, fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(124,58,237,0.45)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.45)')}
              >
                💾 Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete button hover fix */}
      <style>{`
        tr:hover .del-btn { opacity: 1 !important; }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, icon, emoji, gradient, glow, progress }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${glow}` : 'var(--shadow-md)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
    >
      {/* Gradient top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradient }} />

      {/* BG glow circle */}
      <div style={{
        position: 'absolute', right: '-20px', top: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        opacity: hovered ? 0.6 : 0.3,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{
          width: '48px', height: '48px',
          background: gradient,
          borderRadius: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
          boxShadow: `0 6px 20px ${glow}`,
          transform: hovered ? 'scale(1.1) rotate(5deg)' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
      </div>

      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>{title}</p>
      <h4 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
        ₹{value ? value.toLocaleString() : '0'}
      </h4>

      {progress !== undefined && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Budget Used</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: progress > 90 ? '#fca5a5' : '#a78bfa' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: '999px',
              background: progress > 90 ? 'linear-gradient(90deg, #ef4444, #f97316)' : gradient,
              transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
