import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar({ light = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navClass = `navbar ${light ? 'light-nav' : ''} ${scrolled && !light ? 'scrolled' : ''}`;
  const textColor = light ? 'var(--text-primary)' : 'var(--text-inverse)';
  const mutedColor = light ? 'var(--text-muted)' : 'rgba(245,240,230,0.7)';

  return (
    <nav className={navClass}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, background: 'var(--accent-terracotta)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: textColor, fontWeight: 400 }}>
            GhostLoad
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {[['Features', '/features'], ['About', '/about'], ['Pricing', '/pricing']].map(([label, href]) => (
            <Link key={href} to={href} style={{
              color: location.pathname === href ? 'var(--accent-terracotta-light)' : mutedColor,
              fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = textColor}
              onMouseLeave={e => e.target.style.color = location.pathname === href ? 'var(--accent-terracotta-light)' : mutedColor}
            >{label}</Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
          {isAuthenticated ? (
            <Link to="/app" className="btn btn-primary btn-sm">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={{ color: mutedColor, fontSize: '0.875rem', fontWeight: 500 }}>Log in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Start Free</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ color: textColor, display: 'none' }} className="mobile-menu-btn">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--surface-dark)', zIndex: 999,
          display: 'flex', flexDirection: 'column', padding: '5rem 2rem 2rem',
          gap: '1.5rem'
        }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: '1.2rem', right: '1.5rem', color: 'var(--text-inverse)' }}>
            <X size={24} />
          </button>
          {[['Features', '/features'], ['About', '/about'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([label, href]) => (
            <Link key={href} to={href} onClick={() => setMenuOpen(false)}
              style={{ color: 'var(--text-inverse)', fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>
              {label}
            </Link>
          ))}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-secondary">Log in</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn btn-primary">Start Free Analysis</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
