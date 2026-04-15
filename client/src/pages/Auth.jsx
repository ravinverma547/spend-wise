import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Wallet, ArrowRight, Sparkles, Shield, TrendingUp, CheckCircle2, RefreshCw } from 'lucide-react';

const FEATURES = [
  { icon: <TrendingUp size={14} />, label: 'Smart Analytics' },
  { icon: <Shield size={14} />, label: 'Secure & Private' },
  { icon: <Sparkles size={14} />, label: 'AI Insights' },
];

// ── OTP Input: 6 boxes ──────────────────────────────────────────────────────
const OTPInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = value.split('');

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (digits[idx]) { next[idx] = ''; onChange(next.join('')); }
      else if (idx > 0) { inputs.current[idx - 1].focus(); }
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits];
    next[idx] = e.key;
    onChange(next.join(''));
    if (idx < 5) inputs.current[idx + 1].focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          onChange={() => {}}
          style={{
            width: '52px', height: '58px',
            textAlign: 'center',
            fontSize: '1.6rem',
            fontWeight: 800,
            borderRadius: '0.875rem',
            border: digits[i] ? '2px solid #7c3aed' : '2px solid rgba(124,58,237,0.3)',
            background: digits[i] ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.05)',
            color: '#f0f0ff',
            caretColor: '#a78bfa',
            outline: 'none',
            transition: 'all 0.15s ease',
            boxShadow: digits[i] ? '0 0 12px rgba(124,58,237,0.3)' : 'none',
            fontFamily: 'monospace',
          }}
        />
      ))}
    </div>
  );
};

// ── Main Auth Component ──────────────────────────────────────────────────────
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1 = form, 2 = otp, 3 = success
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login, sendOtp, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Step 1 → Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendOtp(formData.name, formData.email, formData.password);
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP bhejne mein dikkat aayi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Verify OTP & Register
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError('6-digit OTP enter karein.'); return; }
    setLoading(true);
    setError('');
    try {
      await verifyOtp(formData.email, otp);
      setStep(3);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP galat hai ya expire ho gaya.');
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ya password galat hai.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');
    try {
      await resendOtp(formData.email);
      setOtp('');
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP dobara bhejne mein dikkat aayi.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setStep(1);
    setError('');
    setOtp('');
  };

  const INPUT_STYLE = {
    paddingLeft: '2.5rem',
    color: '#f0f0ff',
    caretColor: '#a78bfa',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', position: 'relative',
    }}>
      {/* Animated background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[
          { size: 600, top: '-100px', left: '-100px', color: 'rgba(124,58,237,0.18)', dur: '8s' },
          { size: 500, bottom: '-80px', right: '-80px', color: 'rgba(236,72,153,0.12)', dur: '10s', rev: true },
          { size: 300, top: '50%', left: '60%', color: 'rgba(6,182,212,0.1)', dur: '6s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${b.size}px`, height: `${b.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            top: b.top, left: b.left, bottom: b.bottom, right: b.right,
            animation: `floatBlob${b.rev ? 'Rev' : ''} ${b.dur} ease-in-out infinite`,
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }} className="animate-fade-in">

        {/* ── CARD ── */}
        <div style={{
          background: 'rgba(15,15,40,0.85)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '1.5rem',
          padding: '2.25rem',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.15)',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* Top gradient line - changes by step */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: step === 3
              ? 'linear-gradient(90deg, #10b981, #06b6d4)'
              : 'linear-gradient(90deg, #7c3aed, #ec4899, #06b6d4)',
            borderRadius: '1.5rem 1.5rem 0 0',
            transition: 'background 0.5s ease',
          }} />

          {/* ══ STEP 1: LOGIN or REGISTER FORM ═══════════════════════════ */}
          {(step === 1) && (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                  width: '68px', height: '68px',
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  borderRadius: '1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.1rem',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
                  animation: 'floatLogo 3s ease-in-out infinite',
                }}>
                  <Wallet size={32} color="white" />
                </div>
                <h1 style={{
                  fontSize: '1.8rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, #f0f0ff, #a78bfa)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                  marginBottom: '0.3rem',
                }}>
                  {isLogin ? 'Welcome Back 👋' : 'Shuru Karein 🚀'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {isLogin ? 'Sign in to manage your finances' : 'Create account with email verification'}
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {FEATURES.map((f, i) => (
                    <span key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: '9999px', padding: '0.2rem 0.65rem',
                      fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary-light)',
                    }}>
                      {f.icon} {f.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={isLogin ? handleLogin : handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                      <input type="text" className="input-field" style={INPUT_STYLE} placeholder="John Doe"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                    <input type="email" className="input-field" style={INPUT_STYLE} placeholder="john@gmail.com"
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                    <input type="password" className="input-field" style={INPUT_STYLE} placeholder="••••••••"
                      value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                  </div>
                </div>

                {error && <ErrorBox msg={error} />}

                <PrimaryBtn loading={loading}>
                  {loading
                    ? (isLogin ? 'Signing in...' : 'OTP bhej raha hoon...')
                    : (isLogin ? 'Sign In to Dashboard' : '📧 OTP Bhejo Email Par')
                  }
                  {!loading && <ArrowRight size={17} />}
                </PrimaryBtn>
              </form>

              <Footer isLogin={isLogin} onSwitch={switchMode} />
            </>
          )}

          {/* ══ STEP 2: OTP VERIFICATION ═══════════════════════════════════ */}
          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                  width: '68px', height: '68px',
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  borderRadius: '1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.1rem',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
                  fontSize: '2rem',
                }}>
                  📧
                </div>
                <h1 style={{
                  fontSize: '1.7rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, #f0f0ff, #a78bfa)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                  marginBottom: '0.4rem',
                }}>
                  OTP Check Karein
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  6-digit code bheja gaya:
                </p>
                <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {formData.email}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                  ⏱️ Code 5 minutes mein expire hoga. Spam folder bhi check karein.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <OTPInput value={otp} onChange={setOtp} />

                {error && <ErrorBox msg={error} />}

                <PrimaryBtn loading={loading} disabled={otp.length < 6}>
                  {loading ? 'Verify ho raha hai...' : '✅ Verify OTP & Register'}
                </PrimaryBtn>
              </form>

              {/* Resend + Back */}
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.875rem', fontWeight: 600,
                    color: resendCooldown > 0 ? 'var(--text-muted)' : '#a78bfa',
                    background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <RefreshCw size={14} />
                  {resendCooldown > 0 ? `Dobara bhejein (${resendCooldown}s)` : 'OTP Dobara Bhejein'}
                </button>
                <button onClick={() => { setStep(1); setError(''); setOtp(''); }}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ← Email change karein
                </button>
              </div>
            </>
          )}

          {/* ══ STEP 3: SUCCESS ════════════════════════════════════════════ */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 8px 32px rgba(16,185,129,0.5)',
                animation: 'floatLogo 2s ease-in-out infinite',
              }}>
                <CheckCircle2 size={40} color="white" />
              </div>
              <h2 style={{
                fontSize: '1.6rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #6ee7b7, #06b6d4)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                marginBottom: '0.5rem',
              }}>
                Account Ban Gaya! 🎉
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Dashboard par redirect ho raha hai...
              </p>
              <div style={{
                marginTop: '1.5rem',
                width: '100%', height: '4px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '999px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '999px',
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  animation: 'loadBar 1.5s linear forwards',
                }} />
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          🔒 Your data is encrypted and secure
        </p>
      </div>

      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes floatBlobRev {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(8px) scale(1.05); }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ── Reusable sub-components ──────────────────────────────────────────────────
const PrimaryBtn = ({ loading, disabled, children }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    style={{
      padding: '0.9rem',
      borderRadius: '0.875rem',
      background: (loading || disabled) ? 'rgba(124,58,237,0.35)' : 'linear-gradient(135deg, #7c3aed, #ec4899)',
      color: 'white', border: 'none',
      fontWeight: 700, fontSize: '0.95rem',
      cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      boxShadow: (loading || disabled) ? 'none' : '0 8px 28px rgba(124,58,237,0.4)',
      transition: 'all 0.2s ease',
      letterSpacing: '0.01em',
    }}
  >
    {loading && (
      <span style={{
        width: '18px', height: '18px',
        border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        display: 'inline-block', flexShrink: 0,
      }} />
    )}
    {children}
  </button>
);

const ErrorBox = ({ msg }) => (
  <div style={{
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '0.75rem', padding: '0.7rem 1rem',
    color: '#fca5a5', fontSize: '0.85rem',
    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
  }}>
    ⚠️ {msg}
  </div>
);

const Footer = ({ isLogin, onSwitch }) => (
  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
    <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '1.25rem' }} />
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
      {isLogin ? "Account nahi hai?" : 'Pehle se account hai?'}
      <button onClick={onSwitch} style={{
        marginLeft: '0.5rem',
        background: 'linear-gradient(135deg, #a78bfa, #f9a8d4)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem',
      }}>
        {isLogin ? 'Register karein →' : 'Sign In karein →'}
      </button>
    </p>
  </div>
);

export default Auth;
