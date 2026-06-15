import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Building, MessageSquare, Send } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import api from '../../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', companySize: '', message: '', interest: 'demo' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/contact', form);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar light />
      <div style={{ paddingTop: 'var(--nav-height)' }}>
        <section style={{ background: 'var(--bg-section)', padding: '4rem 0' }}>
          <div className="container" style={{ maxWidth: 520 }}>
            <div className="section-label">Contact</div>
            <h1 className="text-hero-sm" style={{ marginBottom: '0.75rem' }}>Let's talk.</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
              Interested in a demo, pilot program, or just want to understand if GhostLoad fits your context? Reach out — we respond within one business day.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem', maxWidth: 900, margin: '0 auto' }}>
              {/* Left info */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>What we can help with</h3>
                {[
                  { icon: Mail, title: 'Product Demo', desc: 'See GhostLoad in action with a live walkthrough tailored to your office type.' },
                  { icon: Building, title: 'Pilot Program', desc: 'Run GhostLoad on one site for 30 days and measure real savings.' },
                  { icon: MessageSquare, title: 'General Questions', desc: 'Questions about accuracy, methodology, or how to interpret results.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(215,106,74,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-terracotta)', flexShrink: 0 }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                {status === 'success' ? (
                  <div className="alert alert-success" style={{ flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
                    <strong>Message sent!</strong>
                    <p style={{ marginTop: 8, color: 'var(--state-success)' }}>We'll get back to you within one business day.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="grid-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Work Email *</label>
                        <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="priya@company.com" />
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input className="form-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Company Size</label>
                        <select className="form-input" value={form.companySize} onChange={e => setForm({ ...form, companySize: e.target.value })}>
                          <option value="">Select...</option>
                          {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => <option key={s} value={s}>{s} employees</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">I'm interested in</label>
                      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                        {[['demo', 'Demo'], ['pilot', 'Pilot Program'], ['support', 'Support'], ['other', 'Other']].map(([val, label]) => (
                          <button key={val} type="button" onClick={() => setForm({ ...form, interest: val })}
                            style={{ padding: '6px 14px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 600, border: `1.5px solid ${form.interest === val ? 'var(--accent-terracotta)' : 'var(--border-medium)'}`, background: form.interest === val ? 'rgba(215,106,74,0.10)' : 'transparent', color: form.interest === val ? 'var(--accent-terracotta)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea className="form-input" required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your office, current energy challenges, or questions..." style={{ resize: 'vertical' }} />
                    </div>
                    {status === 'error' && <div className="alert alert-error">Something went wrong. Please try again.</div>}
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                      {loading ? 'Sending...' : <><Send size={16} /> Send Message</>}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
