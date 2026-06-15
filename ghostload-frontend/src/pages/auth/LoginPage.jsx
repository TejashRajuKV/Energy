import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Battery, Power } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const FloatingIcons = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <motion.div animate={{ y: [0, -40, 0], x: [0, 15, 0], opacity: [0.3, 0.6, 0.3], rotate: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '20%', left: '20%' }}>
      <Zap size={72} color="var(--accent-terracotta)" style={{ opacity: 0.5, filter: 'blur(3px)' }} />
    </motion.div>
    <motion.div animate={{ y: [0, 30, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2], rotate: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }} style={{ position: 'absolute', top: '50%', right: '15%' }}>
      <Battery size={60} color="var(--accent-sage)" style={{ opacity: 0.4, filter: 'blur(2px)' }} />
    </motion.div>
    <motion.div animate={{ y: [0, -25, 0], opacity: [0.2, 0.4, 0.2], scale: [1, 1.15, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }} style={{ position: 'absolute', bottom: '15%', left: '35%' }}>
      <Power size={50} color="var(--accent-gold)" style={{ opacity: 0.4, filter: 'blur(1px)' }} />
    </motion.div>
  </div>
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(data.organization ? '/app' : '/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left brand panel */}
      <div style={{ background: 'var(--surface-dark)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 30% 60%, rgba(215,106,74,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <FloatingIcons />
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', position: 'relative' }}>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }} style={{ width: 34, height: 34, background: 'var(--accent-terracotta)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </motion.div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-inverse)' }}>GhostLoad</span>
          </Link>
        </motion.div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <motion.blockquote initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: 'var(--text-inverse)', lineHeight: 1.25, marginBottom: '1.5rem' }}>
            "We found ₹34,000 in recoverable waste on the first run."
          </motion.blockquote>
          <motion.cite initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ color: 'var(--text-inverse-muted)', fontSize: '0.875rem', fontStyle: 'normal', display: 'block' }}>
            — Facilities Manager, 200-person tech office, Pune
          </motion.cite>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ color: 'var(--text-inverse-muted)', fontSize: '0.8rem', position: 'relative', zIndex: 10 }}>
          © 2026 GhostLoad. Estimated insights, real savings.
        </motion.div>
      </div>

      {/* Right form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: 'var(--bg-base)', position: 'relative' }}>
        {/* Soft background glow based on focused input */}
        <AnimatePresence>
          {focusedInput && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.5, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', width: '60%', height: '60%', background: 'radial-gradient(circle, var(--accent-terracotta) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
          )}
        </AnimatePresence>

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>Log in to your GhostLoad account.</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label">Email</label>
              <input id="login-email" className="form-input" type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} placeholder="you@company.com" style={{ transition: 'border-color 0.3s, box-shadow 0.3s' }} />
            </motion.div>
            
            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Password
                <Link to="/forgot-password" style={{ color: 'var(--accent-terracotta)', fontSize: '0.8rem', textDecoration: 'none' }}>Forgot password?</Link>
              </label>
              <div style={{ position: 'relative' }}>
                <input id="login-password" className="form-input" type={showPass ? 'text' : 'password'} required autoComplete="current-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} placeholder="••••••••" style={{ paddingRight: '2.75rem', transition: 'border-color 0.3s, box-shadow 0.3s' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-primary)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ marginTop: '0.5rem' }}>
              <motion.button id="login-submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Signing in...</motion.div>
                  ) : (
                    <motion.div key="default" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <span>Sign In</span>
                      <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={18} /></motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-terracotta)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </motion.p>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } div[style*="background: var(--surface-dark)"] { display: none !important; } }`}</style>
    </div>
  );
}
