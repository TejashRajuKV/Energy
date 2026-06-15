import { motion } from 'framer-motion';
import { CheckCircle, Target, Eye, Heart } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';

const principles = [
  { icon: Eye, title: 'Visible', desc: 'Every hidden waste source should be visible to any business owner, without needing an energy engineer.' },
  { icon: Target, title: 'Actionable', desc: 'Insight without a clear next step is noise. Every diagnosis ends with a ranked action plan.' },
  { icon: CheckCircle, title: 'Honest', desc: 'We show confidence scores, assumptions, and limitations. Trust is earned through transparency, not confidence theater.' },
  { icon: Heart, title: 'Operator-first', desc: 'Built for the person who runs the building, not the person who reads energy reports.' },
];

export default function AboutPage() {
  return (
    <div>
      <Navbar light />
      <div style={{ paddingTop: 'var(--nav-height)' }}>
        {/* Hero */}
        <section style={{ background: 'var(--surface-dark)', padding: '5rem 0 4rem' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="section-label" style={{ color: 'var(--accent-terracotta-light)' }}>Our Story</div>
              <h1 className="text-hero-sm" style={{ color: 'var(--text-inverse)', marginBottom: '1.5rem' }}>
                Invisible waste is a solvable problem.
              </h1>
              <p style={{ color: 'var(--text-inverse-muted)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                Commercial buildings bleed electricity after hours. HVAC systems run on schedules built for a different occupancy. Servers idle in empty rooms. Coffee machines stay warm for no one. The waste is real, the cost is real — but the insight to stop it has never been accessible to the people who run these buildings.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Origin */}
        <section className="section">
          <div className="container" style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-display" style={{ marginBottom: '1.5rem' }}>Why GhostLoad exists.</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                <p>Energy audits are expensive, slow, and designed for large commercial properties. The small office — with 40 people, a few dozen devices, and a monthly electricity bill that nobody fully understands — has no tool built for them.</p>
                <p>GhostLoad was designed to answer a simple question: <em>what is your building consuming after everyone goes home?</em> Not in six weeks after an audit. Not after installing sensors. Right now, from the data you already have.</p>
                <p>The engine is heuristic — it uses bill amounts, schedules, and equipment profiles to estimate likely leakage by category. The model is transparent. The assumptions are shown. The confidence level is always visible. Because a trustworthy estimate you can act on is more valuable than a perfect number you can't get.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What GhostLoad is and isn't */}
        <section className="section" style={{ background: 'var(--bg-section)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--state-success)' }}>GhostLoad is:</h3>
                {['A fast diagnostic SaaS tool.', 'A decision-support engine.', 'A business ROI-led sustainability product.', 'A practical first step before an energy audit.'].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem', alignItems: 'flex-start' }}>
                    <CheckCircle size={18} style={{ color: 'var(--state-success)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--state-error)' }}>GhostLoad is not:</h3>
                {['A generic carbon footprint calculator.', 'A building management system.', 'An enterprise utility analytics suite.', 'An IoT-first hardware platform.'].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--state-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <div style={{ width: 6, height: 2, background: 'var(--state-error)', borderRadius: 1 }} />
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="section-label" style={{ justifyContent: 'center' }}>Product Principles</div>
              <h2 className="text-display">How we think.</h2>
            </div>
            <div className="grid-4">
              {principles.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={title} className="card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(215,106,74,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-terracotta)' }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
