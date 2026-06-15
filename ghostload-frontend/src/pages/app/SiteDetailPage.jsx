import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Calendar, Zap, Plus, ArrowRight, Trash2, Clock } from 'lucide-react';
import AppLayout from '../../components/dashboard/AppLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function SiteDetailPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/sites/${siteId}`).then(r => setSite(r.data)).finally(() => setLoading(false));
  }, [siteId]);

  if (loading) return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem' }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: '1rem', borderRadius: 16 }} />)}
      </div>
    </AppLayout>
  );

  if (!site) return (
    <AppLayout>
      <div className="empty-state" style={{ padding: '5rem' }}>
        <h2>Site not found</h2>
        <Link to="/app/sites" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Sites</Link>
      </div>
    </AppLayout>
  );

  const completeness = [!!site.schedule, site.bills?.length > 0, site.equipment?.length > 0].filter(Boolean).length;

  return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link to="/app/sites" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '0.5rem' }}>
              ← All Sites
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.3rem' }}>{site.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{site.city}, {site.country} · {site.floorAreaSqft?.toLocaleString()} sq ft</p>
          </div>
          <Link to={`/app/sites/${siteId}/new-analysis`} className="btn btn-primary"><Zap size={16} /> Run New Analysis</Link>
        </div>

        {/* Profile completeness */}
        <div className="card" style={{ marginBottom: '1.5rem', background: completeness < 3 ? 'rgba(198,154,67,0.05)' : 'var(--state-success-bg)', borderColor: completeness < 3 ? 'rgba(198,154,67,0.2)' : 'rgba(65,122,87,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Profile Completeness: {Math.round((completeness / 3) * 100)}%</div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                {[['Schedule', !!site.schedule], ['Utility Bill', site.bills?.length > 0], ['Equipment', site.equipment?.length > 0]].map(([label, done]) => (
                  <span key={label} style={{ color: done ? 'var(--state-success)' : 'var(--state-warning)' }}>
                    {done ? '✓' : '○'} {label}
                  </span>
                ))}
              </div>
            </div>
            {completeness < 3 && (
              <span className="badge badge-gold">Complete profile for higher confidence</span>
            )}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Site info */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '1rem' }}>Site Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                ['Type', site.siteType], ['HVAC', site.hvacType || 'Not specified'],
                ['Occupants', site.occupantsMin ? `${site.occupantsMin}–${site.occupantsMax || '?'}` : 'Not specified'],
                ['Weekend Usage', site.weekendUsage], ['Server Room', site.hasServerRoom ? 'Yes' : 'No'],
              ].map(([key, val]) => (
                <div key={key} className="assumption-row">
                  <span>{key}</span><span className="assumption-value">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>Schedule</h3>
              <Link to={`/app/sites/${siteId}/schedule`} style={{ fontSize: '0.8rem', color: 'var(--accent-terracotta)' }}>Edit →</Link>
            </div>
            {site.schedule ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div className="assumption-row"><span>Weekdays</span><span className="assumption-value">{site.schedule.weekdayOpenTime} – {site.schedule.weekdayCloseTime}</span></div>
                <div className="assumption-row"><span>Saturday</span><span className="assumption-value">{site.schedule.saturdayOpenTime || 'Closed'}</span></div>
                <div className="assumption-row"><span>HVAC pre-cool</span><span className="assumption-value">{site.schedule.hvacPrecoolMins} min</span></div>
                <div className="assumption-row"><span>Security 24/7</span><span className="assumption-value">{site.schedule.securityAlwaysOn ? 'Yes' : 'No'}</span></div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <Clock size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>No schedule defined yet.</p>
                <Link to={`/app/sites/${siteId}/new-analysis`} className="btn btn-secondary btn-sm">Add Schedule</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent analyses */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Recent Analyses</h3>
          </div>
          {site.analyses?.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <Zap size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No analyses yet. Run your first analysis to get your ghost load estimate.</p>
              <Link to={`/app/sites/${siteId}/new-analysis`} className="btn btn-primary"><Zap size={15} /> Run First Analysis</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {site.analyses.map(analysis => (
                <Link key={analysis.id} to={`/app/analyses/${analysis.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Analysis — {new Date(analysis.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        ₹{Number(analysis.estimatedAfterHoursCost).toLocaleString()} est. waste · {Number(analysis.confidenceScore * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
