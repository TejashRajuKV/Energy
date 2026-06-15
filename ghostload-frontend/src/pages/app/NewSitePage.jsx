import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Save } from 'lucide-react';
import AppLayout from '../../components/dashboard/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function NewSitePage() {
  const navigate = useNavigate();
  const { organization } = useAuthStore();
  const [site, setSite] = useState({ name: '', siteType: 'office', city: '', floorAreaSqft: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!site.name) return toast.error('Site name is required');
    if (!site.city) return toast.error('City is required');
    if (!site.floorAreaSqft || parseInt(site.floorAreaSqft) <= 0) return toast.error('Valid floor area is required');
    setLoading(true);
    try {
      const res = await api.post('/api/sites', { 
        ...site, 
        organizationId: organization.id, 
        country: 'India', 
        timezone: 'Asia/Kolkata', 
        floorAreaSqft: parseInt(site.floorAreaSqft) || null 
      });
      toast.success('Site created successfully!');
      navigate(`/app/sites/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.3rem' }}>Add New Site</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create a new office or building to track.</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Site Name *</label>
              <input className="form-input" required value={site.name} onChange={e => setSite({ ...site, name: e.target.value })} placeholder="E.g., Bengaluru HQ" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Site Type</label>
                <select className="form-input" value={site.siteType} onChange={e => setSite({ ...site, siteType: e.target.value })}>
                  {[['office', 'Office'], ['coworking', 'Coworking Space'], ['clinic', 'Clinic/Healthcare'], ['school', 'School/Education'], ['studio', 'Studio'], ['retail', 'Retail'], ['warehouse', 'Warehouse']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={site.city} onChange={e => setSite({ ...site, city: e.target.value })} placeholder="Bengaluru" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Floor Area (sq ft)</label>
              <input className="form-input" type="number" min={0} value={site.floorAreaSqft} onChange={e => setSite({ ...site, floorAreaSqft: e.target.value })} placeholder="5000" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/app/sites')}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading || !site.name}>
                {loading ? 'Saving...' : <><Save size={16} /> Save Site</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
