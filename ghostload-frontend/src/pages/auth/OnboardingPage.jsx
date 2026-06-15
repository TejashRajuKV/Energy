import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Zap, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { fetchMe } = useAuthStore();
  const [step, setStep] = useState(0);
  const [org, setOrg] = useState({ name: '', industry: 'Technology', companySize: '11-50' });
  const [site, setSite] = useState({ name: '', siteType: 'office', city: '', floorAreaSqft: '' });
  const [loading, setLoading] = useState(false);

  const createOrgAndSite = async () => {
    setLoading(true);
    try {
      const orgRes = await api.post('/api/orgs', { ...org, slug: org.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() });
      const orgId = orgRes.data.id;
      const siteRes = await api.post('/api/sites', { ...site, organizationId: orgId, country: 'India', timezone: 'Asia/Kolkata', floorAreaSqft: parseInt(site.floorAreaSqft) || null });
      await fetchMe();
      toast.success('Organization created!');
      navigate(`/app/sites/${siteRes.data.id}/new-analysis`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Setup failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent-terracotta)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>GhostLoad</span>
        </div>

        <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {step === 0 ? (
            <div className="card" style={{ padding: '2.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Set up your organization</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>This is your workspace for all sites and analyses.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Organization Name *</label>
                  <input className="form-input" required value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} placeholder="Acme Corp" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <select className="form-input" value={org.industry} onChange={e => setOrg({ ...org, industry: e.target.value })}>
                      <option value="">Select...</option>
                      {['Technology', 'Retail', 'Healthcare', 'Education', 'Coworking', 'Manufacturing', 'Other'].map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Size</label>
                    <select className="form-input" value={org.companySize} onChange={e => setOrg({ ...org, companySize: e.target.value })}>
                      <option value="">Select...</option>
                      {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => <option key={s} value={s}>{s} employees</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => org.name && setStep(1)} style={{ justifyContent: 'center' }}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Add your first site</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>You can add more sites later from the dashboard.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Site Name *</label>
                  <input className="form-input" required value={site.name} onChange={e => setSite({ ...site, name: e.target.value })} placeholder="Bengaluru HQ" />
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
                  <input className="form-input" type="number" value={site.floorAreaSqft} onChange={e => setSite({ ...site, floorAreaSqft: e.target.value })} placeholder="5000" />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={createOrgAndSite} disabled={loading || !site.name} style={{ flex: 1, justifyContent: 'center' }}>
                    {loading ? 'Setting up...' : <><Zap size={16} /> Go to Analysis</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Step {step + 1} of 2</p>
      </div>
    </div>
  );
}
