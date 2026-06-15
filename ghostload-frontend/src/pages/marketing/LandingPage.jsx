import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, ArrowRight, Wind, Monitor, Lightbulb, Wifi,
  Coffee, TrendingDown, Shield, Clock, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';

// ── Animated counter ──────────────────────────────────────
function Counter({ target, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── FAQ Data ──────────────────────────────────────────────
const faqs = [
  { q: 'How accurate are the estimates?', a: 'GhostLoad uses transparent heuristics based on your bill, schedule, and equipment profile. Confidence scores (0–100%) are shown on every result. When kWh data and tariff rates are provided, confidence improves significantly. These are estimation ranges, not audit-grade readings.' },
  { q: 'Do I need a smart meter or IoT hardware?', a: 'No. GhostLoad requires only your monthly bill, office schedule, and equipment counts. No hardware, no sensors, no installation. This is the point — we give you actionable insight from data you already have.' },
  { q: 'Does it work without kWh data on the bill?', a: 'Yes. When kWh is missing, GhostLoad estimates it from your bill amount and a regional tariff benchmark. The confidence score will reflect the lower certainty, and a warning will be shown.' },
  { q: 'Can I manage multiple offices?', a: 'Yes. You can create multiple sites under one organization, run separate analyses for each, and compare results across your portfolio.' },
  { q: 'Can I export the results?', a: 'Yes. Every analysis can be exported as a PDF summary or CSV recommendation list. You can also generate a shareable read-only link for teammates and stakeholders.' },
  { q: 'Who is GhostLoad for?', a: 'GhostLoad is designed for facilities managers, startup founders, coworking operators, school administrators, and sustainability leads in small-to-mid-sized organizations. No engineering background required.' },
];

// ── Category data ─────────────────────────────────────────
const categories = [
  { key: 'hvac', icon: Wind, label: 'HVAC Systems', leakage: '15–30% after close', fix: 'Schedule correction + smart thermostat', color: '#8BB8C7', bg: 'rgba(139,184,199,0.12)' },
  { key: 'compute', icon: Monitor, label: 'Computers & Screens', leakage: '10–25% standby', fix: 'Auto-sleep policy + shutdown enforcement', color: '#C69A43', bg: 'rgba(198,154,67,0.10)' },
  { key: 'lighting', icon: Lightbulb, label: 'Lighting Zones', leakage: '8–20% overnight', fix: 'Motion sensors + zone-based shutoff', color: '#D76A4A', bg: 'rgba(215,106,74,0.10)' },
  { key: 'network', icon: Wifi, label: 'Network & Servers', leakage: '80–100% always-on', fix: 'Isolate essential vs non-essential loads', color: '#6D8C72', bg: 'rgba(109,140,114,0.10)' },
  { key: 'kitchen', icon: Coffee, label: 'Pantry Appliances', leakage: '20–35% after hours', fix: 'Outlet timers + awareness policy', color: '#D76A4A', bg: 'rgba(215,106,74,0.08)' },
];

// ── Steps ─────────────────────────────────────────────────
const steps = [
  { num: '01', title: 'Add your bill + schedule', desc: 'Enter your monthly electricity bill, work hours, and office details. Takes under 3 minutes.' },
  { num: '02', title: 'GhostLoad models the leak', desc: 'Our heuristic engine estimates what is running after hours by category — HVAC, compute, lighting, and more.' },
  { num: '03', title: 'Get your ranked kill list', desc: 'See your top 5 waste sources, monthly cost impact, CO₂ footprint, and a prioritized action plan.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [hoveredCat, setHoveredCat] = useState(null);

  return (
    <div style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      {/* ── SECTION 1: HERO ────────────────────────────────── */}
      <section className="hero-section">
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'flex-start' }}>
            {/* Left */}
            <div style={{ maxWidth: 600, paddingTop: '3rem' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="section-label" style={{ color: 'var(--accent-terracotta)' }}>
                  <span style={{ background: 'var(--accent-terracotta)', width: 20, height: 2, borderRadius: 2, display: 'inline-block' }} />
                  Energy Intelligence for Offices
                </div>
              </motion.div>

              <motion.h1 className="text-hero" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                Your office burns<br />money <span style={{ fontFamily: 'var(--font-script)', color: 'var(--accent-terracotta-dark)', fontSize: '1.2em', display: 'inline-block', transform: 'rotate(-2deg) translateY(5px)' }}>after hours.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 440, fontWeight: 500, textWrap: 'pretty' }}>
                GhostLoad estimates your off-hours energy leak from a monthly bill, schedule, and equipment profile. No hardware. No auditor. Just a clear diagnosis and a ranked action plan.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <Link to="/signup" className="btn btn-primary btn-lg" style={{ borderRadius: '999px', padding: '1.125rem 2.5rem', fontSize: '1.1rem' }}>
                  Run a Free Analysis <ArrowRight size={18} />
                </Link>
              </motion.div>

              {/* Trust chips */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[['No hardware required', CheckCircle], ['Results in < 8 minutes', Clock], ['Transparent assumptions', Shield]].map(([text, Icon]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Icon size={16} style={{ color: 'var(--accent-terracotta)' }} /> {text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - Image */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ position: 'relative' }}>
               <img src="/hero-bg.png" alt="Office Illustration" style={{ width: '100%', height: 'auto', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(245,240,230,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={16} style={{ animation: 'bounce 2s infinite' }} />
        </div>
      </section>

      {/* ── SECTION 2: STATS BAR ───────────────────────────── */}
      <section style={{ background: 'var(--surface-dark-3)', padding: '2.5rem 0', borderBottom: '1px solid rgba(245,240,230,0.06)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { val: 18, prefix: '', suffix: '%', label: 'Avg. after-hours waste ratio' },
              { val: 42000, prefix: '₹', suffix: '+', label: 'Monthly savings uncovered' },
              { val: 8, prefix: '', suffix: ' min', label: 'Time to first insight' },
              { val: 5, prefix: '', suffix: ' fixes', label: 'Ranked in every analysis' },
            ].map(({ val, prefix, suffix, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--accent-terracotta)', lineHeight: 1, marginBottom: 6 }}>
                  <Counter target={val} prefix={prefix} suffix={suffix} />
                </div>
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE HIDDEN PROBLEM ─────────────────── */}
      <section className="section" style={{ background: 'var(--bg-section)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="section-label">The Problem</div>
              <h2 className="text-display" style={{ marginBottom: '1.5rem' }}>
                Your utility bill is<br /><span style={{ fontStyle: 'italic', color: 'var(--accent-terracotta)' }}>hiding the truth.</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Monthly bills are aggregated — they show total cost, not when or where.',
                  'Devices stay on standby overnight: HVAC, servers, screens, kitchen appliances.',
                  'Managers can\'t justify fixes without knowing the cost of inaction.',
                  'Energy auditors take weeks and cost lakhs. GhostLoad takes minutes.',
                ].map((text, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(215,106,74,0.12)', color: 'var(--accent-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Zap size={12} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Visual: building at night */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div style={{ background: 'var(--surface-dark)', borderRadius: 24, padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(215,106,74,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: '0.5rem' }}>2:00 AM — Office Closed</div>
                  {/* Building grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, margin: '0 auto', maxWidth: 200 }}>
                    {Array.from({ length: 36 }).map((_, i) => {
                      const isOn = [2, 5, 8, 11, 13, 17, 20, 23, 25, 29, 32].includes(i);
                      return (
                        <motion.div key={i} animate={isOn ? { opacity: [0.6, 1, 0.6] } : {}} transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() }}
                          style={{ height: 18, borderRadius: 3, background: isOn ? 'rgba(215,106,74,0.8)' : 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.06)' }} />
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[['HVAC running', '3.2 kW/h', 'var(--accent-sky)'], ['Server room', '1.8 kW/h', 'var(--accent-gold)'], ['Floor 2 lighting', '0.9 kW/h', 'var(--accent-terracotta)'], ['Kitchen appliances', '0.6 kW/h', 'var(--accent-sage-light)']].map(([name, val, color]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245,240,230,0.04)', borderRadius: 8, padding: '0.5rem 0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                        <span style={{ color: 'rgba(245,240,230,0.6)', fontSize: '0.8rem' }}>{name}</span>
                      </div>
                      <span style={{ color, fontSize: '0.8rem', fontWeight: 700 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>How It Works</div>
            <h2 className="text-display">Three steps to see your leak.</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 520, margin: '0.75rem auto 0' }}>
              No installations. No sensors. No waiting.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {steps.map((step, i) => (
              <motion.div key={step.num} className="card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--border-light)', lineHeight: 1, position: 'absolute', top: '-10px', right: '1rem' }}>{step.num}</div>
                <div style={{ width: 44, height: 44, background: 'var(--accent-terracotta)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '1.25rem' }}>
                  {i === 0 ? <Zap size={20} /> : i === 1 ? <TrendingDown size={20} /> : <CheckCircle size={20} />}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.75rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: WASTE CATEGORIES ───────────────────── */}
      <section className="section" style={{ background: 'var(--bg-section)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Energy Vampires</div>
            <h2 className="text-display">Where the ghosts hide.</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0.75rem auto 0' }}>
              Hover each category to see typical leakage patterns and common fixes.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isHovered = hoveredCat === cat.key;
              return (
                <motion.div key={cat.key} className={`category-card ${cat.key}`}
                  onMouseEnter={() => setHoveredCat(cat.key)}
                  onMouseLeave={() => setHoveredCat(null)}
                  whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <div className={`category-icon ${cat.key}`}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>{cat.label}</h3>
                  {isHovered ? (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--state-error)' }}>Leakage:</span> {cat.leakage}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--state-success)' }}>Fix:</span> {cat.fix}
                      </div>
                    </motion.div>
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cat.leakage} after close</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ROI PREVIEW ─────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div className="section-label">ROI Calculator</div>
              <h2 className="text-display" style={{ marginBottom: '1rem' }}>
                See the money <span style={{ fontStyle: 'italic', color: 'var(--accent-gold)' }}>before</span> you spend it.
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
                Every recommendation comes with a monthly savings estimate, CO₂ impact, and payback period — so you know exactly what you get before you act.
              </p>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Run My Analysis <ArrowRight size={18} />
              </Link>
            </div>
            {/* Sample recommendation cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { rank: 1, title: 'Correct HVAC schedule', savings: '₹14,100/mo', payback: '1.5 months', effort: 'Low' },
                { rank: 2, title: 'Enable PC auto-sleep policy', savings: '₹7,600/mo', payback: 'Immediate', effort: 'Low' },
                { rank: 3, title: 'Install outlet timers in pantry', savings: '₹3,800/mo', payback: '3 weeks', effort: 'Low' },
              ].map((rec, i) => (
                <motion.div key={rec.rank} className="rec-card" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                    <div className="rec-rank">#{rec.rank}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{rec.title}</div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--state-success)', fontWeight: 700 }}>{rec.savings}</span>
                        <span style={{ color: 'var(--text-muted)' }}>Payback: {rec.payback}</span>
                        <span className="badge badge-sage">{rec.effort} effort</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: WHY TEAMS USE IT ───────────────────── */}
      <section className="section" style={{ background: 'var(--surface-dark)', color: 'var(--text-inverse)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-label" style={{ color: 'var(--accent-terracotta-light)', justifyContent: 'center' }}>Why Teams Use GhostLoad</div>
            <h2 className="text-display" style={{ color: 'var(--text-inverse)' }}>Built for operators, not engineers.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: TrendingDown, title: 'Operational Clarity', desc: 'See exactly which categories are bleeding money after hours, with confidence scores attached.' },
              { icon: Clock, title: 'Faster Decisions', desc: 'Ranked payback analysis means you always know which fix to approve first.' },
              { icon: CheckCircle, title: 'Sustainability Reporting', desc: 'Annual CO₂ impact and category breakdowns ready for ESG or board presentations.' },
              { icon: Shield, title: 'No Hardware Needed', desc: 'Works from your existing bill and schedule data. No sensors, no installation, no risk.' },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} className="card card-dark" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div style={{ width: 44, height: 44, background: 'rgba(215,106,74,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-terracotta-light)' }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-inverse)', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-inverse-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: TRUST & METHOD ──────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-section)' }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Transparency</div>
            <h2 className="text-display" style={{ marginBottom: '1.25rem' }}>Honest by design.</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2.5rem', fontSize: '1.05rem' }}>
              GhostLoad is not an audit tool. It is a fast diagnostic — like an X-ray before a doctor's visit. Every result shows the assumptions used, the confidence level, and what data would improve the estimate.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'left' }}>
              {[
                { label: 'Not audit-grade metering', desc: 'We estimate from bill + schedule, not submeters.' },
                { label: 'Confidence scores on every result', desc: 'You always know how reliable each estimate is.' },
                { label: 'Best for early-stage diagnostics', desc: 'A practical first step before commissioning an audit.' },
              ].map(({ label, desc }) => (
                <div key={label} className="card card-flat" style={{ padding: '1.25rem' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-sage-bg)', border: '2px solid var(--accent-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <CheckCircle size={12} style={{ color: 'var(--accent-sage)' }} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FAQ ─────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Common Questions</div>
            <h2 className="text-display">Frequently asked.</h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} id={`faq-${i}`} aria-expanded={openFaq === i}>
                  {faq.q}
                  {openFaq === i ? <ChevronUp size={18} style={{ color: 'var(--accent-terracotta)', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className="faq-answer">
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 10: FINAL CTA ──────────────────────────── */}
      <section style={{ background: 'var(--surface-dark)', padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(215,106,74,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="section-label" style={{ color: 'var(--accent-terracotta-light)', justifyContent: 'center', marginBottom: '1.5rem' }}>Get Started Free</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-inverse)', marginBottom: '1.25rem', lineHeight: 1.1 }}>
              Expose what your building<br />
              <span style={{ color: 'var(--accent-terracotta)', fontStyle: 'italic' }}>wastes after dark.</span>
            </h2>
            <p style={{ color: 'var(--text-inverse-muted)', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
              Free to start. No credit card. Results in under 8 minutes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary btn-lg btn-pill">
                Run Free Analysis <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg btn-pill" style={{ borderColor: 'rgba(245,240,230,0.2)', color: 'var(--text-inverse)' }}>
                Talk to Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @media (max-width: 768px) {
          .hero-section > .container > div { grid-template-columns: 1fr !important; }
          .hero-section > .container > div > div:last-child { display: none; }
        }
      `}</style>
    </div>
  );
}
