import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { TrendingDown, Wind, Monitor, Lightbulb, Wifi, Coffee, ChevronDown, ChevronUp, Info, Zap, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, AreaChart, Area } from 'recharts';
import api from '../../lib/api';

const CATEGORY_COLORS = { hvac: '#8BB8C7', compute: '#C69A43', lighting: '#D76A4A', network: '#6D8C72', kitchen: '#D7A44A', misc: '#B8A898' };
const CATEGORY_ICONS = { hvac: Wind, compute: Monitor, lighting: Lightbulb, network: Wifi, kitchen: Coffee };

function ConfidenceBar({ score }) {
  const pct = Math.round(score * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Confidence Score</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: pct > 70 ? 'var(--state-success)' : pct > 50 ? 'var(--state-warning)' : 'var(--state-error)' }}>{pct}%</span>
      </div>
      <div className="confidence-bar">
        <motion.div className="confidence-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
      </div>
    </div>
  );
}

export default function SharedReportPage() {
  const { shareToken } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [openRec, setOpenRec] = useState(null);
  const printRef = useRef();

  const handleExportPdf = useReactToPrint({
    content: () => printRef.current,
    contentRef: printRef,
    documentTitle: `ghostload-report-${shareToken}`,
  });

  useEffect(() => {
    // We expect this to hit the public endpoint: GET /api/reports/share/:shareToken
    api.get(`/api/reports/share/${shareToken}`)
      .then(r => setAnalysis(r.data.analysis))
      .catch(() => setAnalysis(null))
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) return (
    <div style={{ padding: '4rem', maxWidth: 1200, margin: '0 auto' }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, marginBottom: '1rem', borderRadius: 16 }} />)}
    </div>
  );

  if (!analysis) return (
    <div className="empty-state" style={{ height: '100vh', justifyContent: 'center' }}>
      <h2>Report Not Found</h2>
      <p style={{ color: 'var(--text-muted)' }}>This link is invalid or has expired.</p>
    </div>
  );

  const pieData = analysis.breakdowns?.map(b => ({ name: b.category, value: Number(b.sharePercent) }));
  const barData = analysis.breakdowns?.map(b => ({ name: b.category.toUpperCase(), cost: Number(b.estimatedCost), kwh: Number(b.estimatedKwh) }));

  const totalBill = Number(analysis.bill?.billAmount || 0);
  const totalSavings = analysis.recommendations?.reduce((sum, r) => sum + Number(r.estimatedMonthlySavings || 0), 0) || 0;
  const projectedBill = Math.max(0, totalBill - totalSavings);

  const getEffortWeight = (effort) => {
    if (effort === 'low') return 1;
    if (effort === 'medium') return 2;
    return 3;
  };

  const sortedRecommendations = [...(analysis.recommendations || [])].sort((a, b) => {
    const scoreA = Number(a.estimatedMonthlySavings) / getEffortWeight(a.effortLevel);
    const scoreB = Number(b.estimatedMonthlySavings) / getEffortWeight(b.effortLevel);
    return scoreB - scoreA;
  });

  const generateLoadCurve = () => {
    if (!analysis?.site?.schedule || !totalBill) return [];
    const openTime = parseInt(analysis.site.schedule.weekdayOpenTime?.split(':')[0]) || 9;
    const closeTime = parseInt(analysis.site.schedule.weekdayCloseTime?.split(':')[0]) || 18;
    
    const workingHrs = closeTime - openTime;
    const nonWorkingHrs = 24 - workingHrs;
    
    const afterHoursCost = Number(analysis.estimatedAfterHoursCost || 0);
    const workingHoursCost = Math.max(0, totalBill - afterHoursCost);
    
    const baseWorkingKw = (workingHoursCost / workingHrs / 30) || 0;
    const baseAfterHoursKw = (afterHoursCost / nonWorkingHrs / 30) || 0;

    const curve = [];
    for (let i = 0; i < 24; i++) {
      const isWorkingHour = i >= openTime && i < closeTime;
      const variance = 0.9 + Math.random() * 0.2;
      let kw = isWorkingHour ? baseWorkingKw * variance : baseAfterHoursKw * variance;
      
      if (i === openTime - 1) kw = baseAfterHoursKw + (baseWorkingKw - baseAfterHoursKw) * 0.5;
      if (i === closeTime) kw = baseWorkingKw - (baseWorkingKw - baseAfterHoursKw) * 0.5;

      curve.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        workingKw: isWorkingHour || i === openTime - 1 || i === closeTime ? Math.round(kw) : 0,
        ghostKw: !isWorkingHour ? Math.round(kw) : 0,
      });
    }
    return curve;
  };
  const loadCurveData = generateLoadCurve();

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <nav style={{ background: 'var(--surface-dark)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 34, height: 34, background: 'var(--accent-terracotta)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-inverse)', fontWeight: 400 }}>GhostLoad</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary btn-sm no-print" onClick={handleExportPdf} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}><Download size={15} /> Save PDF</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-inverse-muted)' }} className="no-print">Read-Only Report</span>
        </div>
      </nav>

      <div ref={printRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', background: 'var(--bg-base)' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.3rem' }}>Energy Leak Analysis</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {new Date(analysis.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {analysis.site?.name} ({analysis.site?.city})
          </p>
        </div>

        {/* Disclaimer banner */}
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>These are <strong>estimated</strong> figures based on bill, schedule, and equipment profiles — not audit-grade metering. Confidence: <strong>{Math.round(analysis.confidenceScore * 100)}%</strong></span>
        </div>

        {/* Before vs After Savings Banner */}
        <div style={{ background: 'var(--surface-dark)', borderRadius: '16px', padding: '2rem', marginBottom: '2.5rem', color: 'var(--text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.5rem', color: '#fff' }}>Projected Savings</h2>
            <p style={{ color: 'var(--text-inverse-muted)', fontSize: '0.95rem' }}>Implement the Priority Actions below to capture this value.</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-inverse-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Bill</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'line-through' }}>₹{Math.round(totalBill).toLocaleString()}</div>
            </div>
            <div style={{ width: 32, height: 2, background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-inverse-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projected Bill</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>₹{Math.round(projectedBill).toLocaleString()}</div>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(65,122,87,0.2)', border: '1px solid var(--state-success)', borderRadius: '12px', marginLeft: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--state-success)', fontWeight: 600, marginBottom: '0.1rem', textTransform: 'uppercase' }}>Total Monthly Savings</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--state-success)' }}>₹{Math.round(totalSavings).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Load Curve Chart */}
        {loadCurveData.length > 0 && (
          <motion.div className="chart-container" style={{ marginBottom: '2rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>24-Hour Load Profile</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated daily power draw. Red area indicates after-hours ghost load.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 12, height: 12, background: 'rgba(215,106,74,0.15)', border: '1px solid var(--accent-terracotta)', borderRadius: 3 }} />
                  <span style={{ color: 'var(--text-muted)' }}>Ghost Load</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 12, height: 12, background: 'rgba(109,140,114,0.15)', border: '1px solid var(--accent-sage)', borderRadius: 3 }} />
                  <span style={{ color: 'var(--text-muted)' }}>Working Hours</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={loadCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWorking" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-sage)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-sage)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGhost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-terracotta)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-terracotta)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#66706D' }} tickMargin={10} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: '#66706D' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12 }}
                  formatter={(value, name) => [value > 0 ? value + ' kW' : '0 kW', name === 'workingKw' ? 'Working Load' : 'Ghost Load']}
                />
                <Area type="monotone" dataKey="workingKw" stroke="var(--accent-sage)" fill="url(#colorWorking)" strokeWidth={2} />
                <Area type="monotone" dataKey="ghostKw" stroke="var(--accent-terracotta)" fill="url(#colorGhost)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Est. Monthly Waste', value: `₹${Number(analysis.estimatedAfterHoursCost).toLocaleString()}`, color: 'var(--accent-terracotta)', icon: TrendingDown },
            { label: 'After-Hours kWh', value: `${Number(analysis.estimatedAfterHoursKwh).toLocaleString()} kWh`, color: 'var(--accent-gold)', icon: Wifi },
            { label: 'Annual CO₂ Impact', value: `${Number(analysis.annualCo2Kg / 1000).toFixed(1)} tCO₂`, color: 'var(--accent-sage)', icon: Wind },
            { label: 'Waste Ratio', value: `${Number(analysis.estimatedWasteRatio).toFixed(1)}%`, color: 'var(--accent-sky)', icon: TrendingDown },
          ].map(({ label, value, color, icon: Icon }, i) => (
            <motion.div key={label} className="kpi-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="kpi-label">{label}</span>
                <div style={{ width: 34, height: 34, background: `${color}18`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}><Icon size={16} /></div>
              </div>
              <div className="kpi-value text-tabular" style={{ color }}>{value}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category Share</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>% of after-hours waste by category</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {pieData?.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#B8A898'} />)}
                </Pie>
                <Tooltip formatter={v => [`${v}%`]} contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              {[...(analysis.breakdowns || [])].sort((a, b) => b.sharePercent - a.sharePercent).map(b => (
                <div key={b.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[b.category] || '#B8A898' }} />
                    <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{b.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.875rem' }}>
                    <span style={{ fontWeight: 600 }}>{Number(b.sharePercent).toFixed(0)}%</span>
                    <span style={{ color: 'var(--text-muted)' }}>₹{Number(b.estimatedCost).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem' }}>Cost by Category</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Est. monthly ₹ wasted per category</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#66706D' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#66706D' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, 'Est. Cost']} contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="cost" radius={[6,6,0,0]}>
                  {barData?.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.name.toLowerCase()] || '#B8A898'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '1rem' }}>
              <ConfidenceBar score={analysis.confidenceScore} />
            </div>
          </motion.div>
        </div>

        {/* Kill List (Priority Action Ranker) */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
            <div>
              <div className="section-label" style={{ color: 'var(--state-error)', marginBottom: '0.5rem' }}>
                <span style={{ background: 'var(--state-error)', width: 20, height: 2, borderRadius: 2, display: 'inline-block', marginRight: 8 }} />
                The Kill List
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Priority Action Ranker</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 300, textAlign: 'right' }}>
              Sorted by maximum savings vs. lowest effort.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedRecommendations.map((rec, i) => {
              const CatIcon = CATEGORY_ICONS[rec.category] || TrendingDown;
              return (
                <motion.div key={rec.id} className="rec-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
                  <div className="rec-card-header" onClick={() => setOpenRec(openRec === i ? null : i)}>
                    <div className="rec-rank" style={{ background: i === 0 ? 'var(--state-error)' : i === 1 ? 'var(--accent-terracotta)' : 'var(--border-medium)', color: i < 2 ? '#fff' : 'var(--text-muted)' }}>#{i + 1}</div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${CATEGORY_COLORS[rec.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CATEGORY_COLORS[rec.category], flexShrink: 0 }}>
                      <CatIcon size={20} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ minWidth: 200 }}>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>{rec.title}</div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{rec.category}</span>
                          <span>Confidence: <strong>{Math.round(rec.confidenceScore * 100)}%</strong></span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Savings</div>
                          <div style={{ color: 'var(--state-success)', fontWeight: 700, fontSize: '1.1rem' }}>₹{Number(rec.estimatedMonthlySavings).toLocaleString()}/mo</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>CO<sub style={{ fontSize: '0.55rem', marginLeft: 1 }}>2</sub> Avoided</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{Number(rec.estimatedAnnualCo2Kg).toFixed(0)} kg/yr</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payback</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{rec.paybackMonths ? `${Number(rec.paybackMonths).toFixed(1)} mo` : 'Immediate'}</div>
                        </div>
                        <div style={{ width: 80, textAlign: 'right' }}>
                          <span className={`badge ${rec.effortLevel === 'low' ? 'badge-sage' : rec.effortLevel === 'medium' ? 'badge-gold' : 'badge-terracotta'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                            {rec.effortLevel} effort
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ paddingLeft: '1rem', display: 'flex', alignItems: 'center' }}>
                      {openRec === i ? <ChevronUp size={20} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  </div>
                  {openRec === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rec-card-body" style={{ padding: '1.25rem 1.5rem 1.5rem', background: 'var(--bg-subtle)' }}>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', margin: 0, maxWidth: 800 }}>{rec.description}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Assumptions */}
        <div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', marginBottom: '0.75rem' }}
            onClick={() => setShowAssumptions(!showAssumptions)}>
            <Info size={15} /> {showAssumptions ? 'Hide' : 'Show'} Assumptions & Methodology
            {showAssumptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showAssumptions && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="assumptions-drawer">
              {Object.entries(analysis.assumptionsJson || {}).map(([k, v]) => (
                <div key={k} className="assumption-row">
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{k.replace(/_/g, ' ')}</span>
                  <span className="assumption-value">{String(v)}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
