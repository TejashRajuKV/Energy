import { motion } from 'framer-motion';
import { Zap, Clock, BarChart2, FileText, Users, Sliders, CheckCircle, Shield } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';

const features = [
  { icon: Zap, title: 'Ghost Load Estimation', desc: <>Heuristic engine estimates off-hours waste from your bill, schedule, and equipment profile. Results in under 5 seconds.</>, badge: 'Core' },
  { icon: BarChart2, title: 'Category Breakdown', desc: <>HVAC, lighting, compute, network, and kitchen — each with share percentage, cost impact, and CO<sub>2</sub> attribution.</>, badge: 'Analytics' },
  { icon: Clock, title: 'Schedule Intelligence', desc: <>Define work hours, cleaning shifts, weekend activity, and HVAC pre/post-cool windows for precise after-hours modeling.</>, badge: 'Inputs' },
  { icon: Sliders, title: 'Scenario Simulator', desc: <>Adjust HVAC runtime, enable smart strips, toggle weekend shutdown — see the projected savings and payback instantly.</>, badge: 'Interactive' },
  { icon: FileText, title: 'PDF & CSV Reports', desc: <>Export full analysis summaries and ranked recommendation CSVs. Share read-only report links with stakeholders.</>, badge: 'Export' },
  { icon: Shield, title: 'Transparent Confidence Model', desc: <>Every analysis shows a confidence score, rated inputs, and the exact assumptions behind each estimate. Nothing hidden.</>, badge: 'Trust' },
];

export default function FeaturesPage() {
  return (
    <div>
      <Navbar light />
      <div style={{ paddingTop: 'var(--nav-height)' }}>
        <section style={{ background: 'var(--bg-section)', padding: '5rem 0 4rem' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 640 }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Features</div>
            <h1 className="text-hero-sm" style={{ marginBottom: '1rem' }}>Everything you need to stop the leak.</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>
              GhostLoad is a focused diagnostic tool. Every feature is designed to answer one of four questions: what, why, how much, and what next.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="section-label" style={{ justifyContent: 'center' }}>What GhostLoad Does</div>
              <h2 className="text-display" style={{ marginBottom: '1rem' }}>Six capabilities. One clean diagnosis.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
                No sensors. No auditors. Just your bill, schedule, and equipment profile.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {features.map(({ icon: Icon, title, desc, badge }, i) => (
                <motion.div key={title} className="card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ width: 48, height: 48, background: 'rgba(215,106,74,0.08)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-terracotta)' }}>
                      <Icon size={22} />
                    </div>
                    <span className="badge badge-terracotta">{badge}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.625rem' }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Confidence & Transparency callout */}
        <section className="section" style={{ background: 'var(--surface-dark)', color: 'var(--text-inverse)' }}>
          <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
            <div className="section-label" style={{ color: 'var(--accent-gold)', justifyContent: 'center' }}>Transparency First</div>
            <h2 className="text-display" style={{ color: 'var(--text-inverse)', marginBottom: '1.25rem' }}>Every result shows its assumptions.</h2>
            <p style={{ color: 'var(--text-inverse-muted)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              Every analysis displays the tariff rate used, the emission factor applied, and whether kWh was provided or estimated. Confidence scores (0–100%) tell you exactly how reliable the estimate is.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Confidence score', 'Assumption panel', 'Estimated language', 'Data quality flags'].map((f) => (
                <div key={f} style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(245,240,230,0.06)', borderRadius: 999, padding: '6px 14px', fontSize: '0.82rem', color: 'var(--text-inverse-muted)' }}>
                  <CheckCircle size={13} style={{ color: 'var(--accent-sage-light)' }} /> {f}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
