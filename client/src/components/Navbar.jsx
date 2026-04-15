import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Sun, Moon, Wallet, Menu, X, User, TrendingUp, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--bg-nav)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
    }}>
      <div className="container" style={{ padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
              transition: 'transform 0.3s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(12deg) scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <Wallet size={22} color="white" />
            </div>
            <div>
              <span style={{
                fontSize: '1.2rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #a78bfa, #f9a8d4)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.03em',
              }}>
                SpendWise
              </span>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>
                Financial Tracker
              </div>
            </div>
          </Link>

          {/* Center pill */}
          <div className="md:flex" style={{
            hidden: true,
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '9999px',
            padding: '0.4rem 1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <TrendingUp size={14} color="var(--primary-light)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-light)' }}>
              Track • Save • Grow
            </span>
          </div>

          {/* Right side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              style={{
                width: '38px', height: '38px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              {theme === 'light'
                ? <Moon size={16} color="var(--text-muted)" />
                : <Sun size={18} color="#fcd34d" />
              }
            </button>

            {/* User info pill (desktop) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '9999px',
              padding: '0.4rem 0.4rem 0.4rem 0.5rem',
            }} className="md:flex hidden-mobile">
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700, color: 'white',
                boxShadow: '0 2px 10px rgba(124,58,237,0.4)',
              }}>
                {user?.name?.[0]?.toUpperCase() || <User size={14} />}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, paddingRight: '0.25rem' }}>{user?.name}</span>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  width: '30px', height: '30px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent',
                  transition: 'all 0.2s ease',
                  marginRight: '0.1rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut size={15} color="var(--text-muted)" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'rgba(124,58,237,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              className="md:hidden"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(124,58,237,0.08)',
              borderRadius: '1rem',
              border: '1px solid rgba(124,58,237,0.2)',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, color: 'white',
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.08)',
                color: '#fca5a5',
                fontWeight: 600, fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
