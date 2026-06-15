import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, LayoutDashboard, Building2, BarChart2, FileText, Users, Settings, User, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/app' },
  { icon: Building2, label: 'Sites', href: '/app/sites' },
  { icon: BarChart2, label: 'Compare', href: '/app/compare' },
];

function Sidebar() {
  const { pathname } = useLocation();
  const { user, organization, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem 0.5rem', borderBottom: '1px solid rgba(245,240,230,0.06)' }}>
        <Link to="/app" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem 0.75rem' }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent-terracotta)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={15} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-inverse)' }}>GhostLoad</span>
        </Link>
        {/* Org selector */}
        {organization && (
          <div style={{ margin: '0.75rem 0.75rem 0.5rem', background: 'rgba(245,240,230,0.06)', borderRadius: 8, padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 26, height: 26, background: 'var(--accent-sage)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {organization.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-inverse)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{organization.name}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-inverse-muted)', textTransform: 'capitalize' }}>{organization.role}</div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0' }}>
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || (href !== '/app' && pathname.startsWith(href));
          return (
            <Link key={href} to={href} className={`sidebar-nav-item ${active ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(245,240,230,0.06)' }}>
        <Link to="/app/profile" className="sidebar-nav-item">
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-inverse)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-inverse-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </Link>
        <button className="sidebar-nav-item" onClick={handleLogout} style={{ width: '100%', display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-inverse-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
          <LogOut size={17} /> Log out
        </button>
      </div>
    </aside>
  );
}

export default function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}
      <div className={`sidebar-container ${mobileMenuOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>
      <main className="app-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="mobile-header" style={{ display: 'none', padding: '1rem', borderBottom: '1px solid var(--border-light)', alignItems: 'center', gap: '1rem', background: 'var(--bg-base)' }}>
          <button onClick={() => setMobileMenuOpen(true)} style={{ color: 'var(--text-primary)' }}>
            <Menu size={24} />
          </button>
          <div style={{ fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>GhostLoad</div>
        </div>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
