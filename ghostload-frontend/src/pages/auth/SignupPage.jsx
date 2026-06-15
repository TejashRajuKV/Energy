import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle, TrendingDown, Lightbulb, Activity } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
];

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
    <motion.div animate={{ y: [0, -30, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3], rotate: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '15%', left: '15%' }}>
      <Zap size={64} color="var(--accent-terracotta)" style={{ opacity: 0.5, filter: 'blur(2px)' }} />
    </motion.div>
    <motion.div animate={{ y: [0, 40, 0], x: [0, -20, 0], opacity: [0.2, 0.5, 0.2], rotate: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} style={{ position: 'absolute', top: '60%', right: '15%' }}>
      <TrendingDown size={80} color="var(--accent-sage)" style={{ opacity: 0.4, filter: 'blur(3px)' }} />
    </motion.div>
    <motion.div animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }} style={{ position: 'absolute', bottom: '20%', left: '30%' }}>
      <Lightbulb size={48} color="var(--accent-gold)" style={{ opacity: 0.4, filter: 'blur(1px)' }} />
    </motion.div>
  </div>
);

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Set up your organization.');
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left brand panel */}
      <div style={{ background: 'var(--surface-dark)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 40% 50%, rgba(109,140,114,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <FloatingIcons />
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', textDecoration: 'none' }}>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }} style={{ width: 34, height: 34, background: 'var(--accent-terracotta)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </motion.div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-inverse)' }}>GhostLoad</span>
          </Link>
        </motion.div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ marginBottom: '2.5rem' }}>
            {['Free to start', 'Results in < 8 minutes', 'No hardware required', 'Transparent estimates'].map((item, i) => (
              <motion.div key={item} variants={itemVariants} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={20} style={{ color: 'var(--accent-sage-light)', flexShrink: 0 }} />
                <span style={{ color: 'rgba(245,240,230,0.9)', fontSize: '1.05rem', fontWeight: 500 }}>{item}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.02 }} style={{ background: 'rgba(245,240,230,0.05)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(245,240,230,0.1)', backdropFilter: 'blur(10px)', cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ color: 'var(--text-inverse-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sample Result</div>
              <Activity size={16} color="var(--accent-terracotta)" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--accent-terracotta)', lineHeight: 1 }}>₹38,400</div>
            <div style={{ color: 'var(--text-inverse-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>estimated monthly after-hours waste</div>
          </motion.div>
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
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.5, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', width: '60%', height: '60%', background: 'radial-gradient(circle, var(--accent-sage-light) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
          )}
        </AnimatePresence>

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Start your free analysis</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>No credit card. Takes under 8 minutes.</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label">Full Name</label>
              <input id="signup-name" className="form-input" required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)} placeholder="Priya Sharma" style={{ transition: 'border-color 0.3s, box-shadow 0.3s' }} />
            </motion.div>

            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label">Work Email</label>
              <input id="signup-email" className="form-input" type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} placeholder="priya@company.com" style={{ transition: 'border-color 0.3s, box-shadow 0.3s' }} />
            </motion.div>

            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="signup-password" className="form-input" type={showPass ? 'text' : 'password'} required autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} placeholder="Create a strong password" style={{ paddingRight: '2.75rem', transition: 'border-color 0.3s, box-shadow 0.3s' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color='var(--text-primary)'} onMouseLeave={(e) => e.target.style.color='var(--text-muted)'}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {form.password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, overflow: 'hidden' }}>
                    {passwordRules.map(({ label, test }, i) => (
                      <motion.div key={label} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', color: test(form.password) ? 'var(--state-success)' : 'var(--text-muted)' }}>
                        <motion.div animate={test(form.password) ? { scale: [1, 1.2, 1] } : {}}>
                          <CheckCircle size={14} style={{ opacity: test(form.password) ? 1 : 0.3, transition: 'all 0.3s' }} />
                        </motion.div>
                        {label}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} style={{ marginTop: '0.5rem' }}>
              <motion.button id="signup-submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Creating account...</motion.div>
                  ) : (
                    <motion.div key="default" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <span>Create Account</span>
                      <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={18} /></motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-terracotta)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </motion.p>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } div[style*="background: var(--surface-dark)"] { display: none !important; } }`}</style>
    </div>
  );
}
