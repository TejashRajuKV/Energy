import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Building2, ArrowRight, Search } from 'lucide-react';
import AppLayout from '../../components/dashboard/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

export default function SitesPage() {
  const { organization } = useAuthStore();
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization?.id) {
      api.get(`/api/sites?orgId=${organization.id}`)
        .then(r => setSites(r.data))
        .finally(() => setLoading(false));
    }
  }, [organization]);

  const filtered = sites.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.3rem' }}>Sites</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your office locations and run analyses.</p>
          </div>
          <Link to="/app/sites/new" className="btn btn-primary"><Plus size={16} /> Add Site</Link>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 360, marginBottom: '1.5rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search sites..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 1rem' }}><Building2 size={32} /></div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              {search ? 'No sites match your search' : 'No sites yet'}
            </h3>
            {!search && (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add your first office location to begin analyzing energy waste.</p>
                <Link to="/app/sites/new" className="btn btn-primary"><Plus size={15} /> Add First Site</Link>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filtered.map((site, i) => (
              <motion.div key={site.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={`/app/sites/${site.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ width: 44, height: 44, background: 'rgba(109,140,114,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sage)' }}>
                        <Building2 size={20} />
                      </div>
                      <span className={`badge ${site._count?.analyses > 0 ? 'badge-sage' : 'badge-gold'}`}>
                        {site._count?.analyses > 0 ? `${site._count.analyses} analys${site._count.analyses === 1 ? 'is' : 'es'}` : 'Pending analysis'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{site.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      {site.city}, {site.country} · {site.floorAreaSqft?.toLocaleString()} sqft · {site.siteType}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {site.hvacType && <span className="badge badge-sky" style={{ fontSize: '0.7rem' }}>{site.hvacType.replace('_', ' ')}</span>}
                        {site.hasServerRoom && <span className="badge badge-terracotta" style={{ fontSize: '0.7rem' }}>Server room</span>}
                      </div>
                      <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
