import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Wallet, ArrowRight, Sparkles, Shield, TrendingUp } from 'lucide-react';

const FEATURES = [
  { icon: <TrendingUp size={16} />, label: 'Smart Analytics' },
  { icon: <Shield size={16} />, label: 'Bank-Level Security' },
  { icon: <Sparkles size={16} />, label: 'AI Insights' },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      background: 'var(--bg-body)',
    }}>

      {/* Animated background blobs */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          top: '-100px', left: '-100px', animation: 'floatLogo 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
          bottom: '-80px', right: '-80px', animation: 'floatLogo 10s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          top: '50%', left: '60%', animation: 'floatLogo 6s ease-in-out infinite',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1,
      }} className="animate-fade-in">

        {/* Card */}
        <div style={{
          background: 'rgba(15,15,40,0.75)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Top gradient line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #7c3aed, #ec4899, #06b6d4)',
            borderRadius: '1.5rem 1.5rem 0 0',
          }} />

          {/* Subtle inner glow */}
          <div style={{
            position: 'absolute', top: '3px', left: 0, right: 0,
            height: '60px',
            background: 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
            {/* Logo */}
            <div style={{
              width: '72px', height: '72px',
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              borderRadius: '1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
              animation: 'floatLogo 3s ease-in-out infinite',
            }}>
              <Wallet size={34} color="white" />
            </div>

            <h1 style={{
              fontSize: '1.9rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #f0f0ff, #a78bfa)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              marginBottom: '0.4rem',
            }}>
              {isLogin ? 'Welcome Back 👋' : 'Get Started 🚀'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isLogin
                ? 'Sign in to manage your finances smartly'
                : 'Begin your journey to financial freedom'}
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              {FEATURES.map((f, i) => (
                <span key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.7rem',
                  fontSize: '0.7rem', fontWeight: 600,
                  color: 'var(--primary-light)',
                }}>
                  {f.icon} {f.label}
                </span>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', color: '#f0f0ff', caretColor: '#a78bfa' }}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', color: '#f0f0ff', caretColor: '#a78bfa' }}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', color: '#f0f0ff', caretColor: '#a78bfa' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#fca5a5',
                fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.9rem',
                borderRadius: '0.875rem',
                background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #ec4899)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 8px 30px rgba(124,58,237,0.45)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.6)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.45)')}
            >
              {loading ? (
                <>
                  <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In to Dashboard' : 'Create My Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '1.5rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{
                  marginLeft: '0.5rem',
                  background: 'linear-gradient(135deg, #a78bfa, #f9a8d4)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                  fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                }}
              >
                {isLogin ? 'Create Account →' : 'Sign In →'}
              </button>
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔒 Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
};

export default Auth;
