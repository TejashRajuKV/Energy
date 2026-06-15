import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingDown, Wind, Monitor, Lightbulb, Wifi, Coffee, Activity, MapPin, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import AppLayout from '../../components/dashboard/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const CATEGORY_COLORS = { hvac: '#8BB8C7', compute: '#C69A43', lighting: '#D76A4A', network: '#6D8C72', kitchen: '#D7A44A', misc: '#B8A898' };
const CATEGORY_ICONS = { hvac: Wind, compute: Monitor, lighting: Lightbulb, network: Wifi, kitchen: Coffee, misc: Activity };

export default function CompareSitesPage() {
  const { organization } = useAuthStore();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      api.get(`/api/sites/compare?orgId=${organization.id}`)
        .then(res => setSites(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [organization]);

  if (loading) return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem' }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: '1rem', borderRadius: 16 }} />)}
      </div>
    </AppLayout>
  );

  const sitesWithAnalysis = sites.filter(s => s.hasAnalysis);
  const chartData = sitesWithAnalysis.map(s => ({
    name: s.name,
    waste: s.estimatedMonthlyWaste,
  }));

  return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.3rem' }}>Multi-Site Comparison</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Benchmark energy waste across all your locations.</p>
          </div>
          <Link to="/app/sites/new" className="btn btn-primary"><MapPin size={18} /> Add New Site</Link>
        </div>

        {sitesWithAnalysis.length === 0 ? (
          <div className="empty-state">
            <BarChart2 size={48} color="var(--border-medium)" style={{ marginBottom: '1rem' }} />
            <h2>No Analysis Data</h2>
            <p>You need to run an analysis on at least one site to see comparisons.</p>
            <Link to="/app" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Dashboard</Link>
          </div>
        ) : (
          <>
            {/* Visual Comparison Chart */}
            <div style={{ background: 'var(--surface-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>Estimated Monthly Waste (₹)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Monthly Waste']}
                    contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-light)', borderRadius: 10, color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="waste" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--state-error)' : 'var(--accent-terracotta)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Leaderboard Table */}
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Site Leaderboard</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rank</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Site</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Est. Waste / mo</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Waste Ratio</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top Culprit</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site, index) => {
                    const hasData = site.hasAnalysis;
                    const CatIcon = hasData && site.topWasteCategory ? (CATEGORY_ICONS[site.topWasteCategory] || Activity) : Activity;
                    return (
                      <tr key={site.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: hasData && index === 0 ? 'var(--state-error)' : 'var(--text-muted)' }}>
                          #{index + 1}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{site.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{site.city} · {site.floorAreaSqft.toLocaleString()} sqft</div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          {hasData ? (
                            <div style={{ fontWeight: 700, color: index === 0 ? 'var(--state-error)' : 'var(--text-primary)' }}>
                              ₹{site.estimatedMonthlyWaste.toLocaleString()}
                            </div>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data</span>}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          {hasData ? (
                            <div className={`badge ${site.wasteRatio > 30 ? 'badge-terracotta' : site.wasteRatio > 15 ? 'badge-gold' : 'badge-sage'}`}>
                              {site.wasteRatio.toFixed(1)}%
                            </div>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          {hasData && site.topWasteCategory ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${CATEGORY_COLORS[site.topWasteCategory]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CATEGORY_COLORS[site.topWasteCategory] }}>
                                <CatIcon size={14} />
                              </div>
                              <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 500 }}>{site.topWasteCategory}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          {hasData ? (
                            <Link to={`/app/analyses/${site.analysisId}`} className="btn btn-secondary btn-sm">View Analysis</Link>
                          ) : (
                            <Link to={`/app/sites/${site.id}`} className="btn btn-primary btn-sm">Run Analysis</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
