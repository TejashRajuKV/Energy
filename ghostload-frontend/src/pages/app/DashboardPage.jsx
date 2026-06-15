import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingDown, Building2, Zap, BarChart2, ArrowRight, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AppLayout from '../../components/dashboard/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const COLORS = ['#8BB8C7', '#C69A43', '#D76A4A', '#6D8C72', '#D76A4A'];

export default function DashboardPage() {
  const { user, organization } = useAuthStore();
  const [sites, setSites] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization?.id) {
      Promise.all([
        api.get(`/api/sites?orgId=${organization.id}`).then(r => setSites(r.data)),
        api.get(`/api/orgs/${organization.id}/analytics`).then(r => setAnalytics(r.data))
      ]).catch(() => {}).finally(() => setLoading(false));
    }
  }, [organization]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const orgName = organization?.name ? organization.name.charAt(0).toUpperCase() + organization.name.slice(1) : 'your org';
  const userName = user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1).split(' ')[0] : '';

  return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.3rem' }}>
              {getGreeting()}, {userName} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Here's your energy waste overview.</p>
          </div>
          <Link to="/app/sites" className="btn btn-primary">
            <Plus size={16} /> Add Site
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Est. Monthly Waste', value: `₹${(analytics?.totalMonthlyWaste || 0).toLocaleString()}`, delta: 'Across all sites', negative: true, icon: TrendingDown, color: 'var(--accent-terracotta)' },
            { label: 'Annual Savings Opp.', value: `₹${((analytics?.totalSavingsOpp || 0) / 100000).toFixed(1)}L`, delta: 'If top 3 fixes applied', icon: Zap, color: 'var(--accent-gold)' },
            { label: 'Sites Analyzed', value: analytics?.sitesAnalyzed || 0, delta: `in ${orgName}`, icon: Building2, color: 'var(--accent-sage)' },
            { label: <>CO<sub>2</sub> Impact</>, value: <>{((analytics?.totalCo2 || 0) / 1000).toFixed(1)} tCO<sub>2</sub></>, delta: 'annual estimate', icon: BarChart2, color: 'var(--accent-sky)' },
          ].map(({ label, value, delta, negative, icon: Icon, color }, i) => (
            <motion.div key={label} className="kpi-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div className="kpi-label">{label}</div>
                <div style={{ width: 36, height: 36, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  <Icon size={17} />
                </div>
              </div>
              <div className="kpi-value text-tabular">{value}</div>
              <div className={`kpi-delta ${negative ? 'negative' : 'positive'}`}>{delta}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="charts-grid">
          {/* Waste trend */}
          <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Monthly After-Hours Waste</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Estimated ₹ per month</div>
              </div>
              <span className="badge badge-terracotta">ESTIMATED</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics?.trend || []}>
                <defs>
                  <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D76A4A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#D76A4A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#66706D' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#66706D' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Waste']} contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="waste" stroke="#D76A4A" strokeWidth={2.5} fill="url(#wasteGrad)" dot={false} activeDot={{ r: 5, fill: '#D76A4A' }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category donut */}
          <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Category Breakdown</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>Share of after-hours waste</div>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={analytics?.breakdowns || []} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                  {(analytics?.breakdowns || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              {(analytics?.breakdowns || []).map((d, i) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sites list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Your Sites</h2>
            <Link to="/app/sites" style={{ color: 'var(--accent-terracotta)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {sites.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }}><Building2 size={28} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No sites yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Add your first office site to start estimating after-hours waste.</p>
              <Link to="/app/sites/new" className="btn btn-primary"><Plus size={15} /> Add First Site</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sites.slice(0, 5).map(site => (
                <Link key={site.id} to={`/app/sites/${site.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 40, height: 40, background: 'rgba(109,140,114,0.10)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sage)' }}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{site.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{site.city} • {site.floorAreaSqft?.toLocaleString()} sqft</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge ${site._count?.analyses > 0 ? 'badge-sage' : 'badge-gold'}`}>
                        {site._count?.analyses > 0 ? `${site._count.analyses} analys${site._count.analyses === 1 ? 'is' : 'es'}` : 'No analysis yet'}
                      </span>
                      <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
