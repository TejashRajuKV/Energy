import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save } from 'lucide-react';
import AppLayout from '../../components/dashboard/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', timezone: user?.timezone || 'Asia/Kolkata', preferredCurrency: user?.preferredCurrency || 'INR' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/api/profile', form);
      await fetchMe();
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPwdLoading(true);
    try {
      await api.post('/api/profile/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setPwdLoading(false); }
  };

  return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 600 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.3rem' }}>Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your personal information and preferences.</p>
        </div>

        {/* Avatar */}
        <motion.div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#fff', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</div>
          </div>
        </motion.div>

        {/* Profile form */}
        <motion.div className="card" style={{ marginBottom: '1.5rem' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} style={{ color: 'var(--accent-terracotta)' }} /> Personal Info
          </h2>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Preferred Currency</label>
                <select className="form-input" value={form.preferredCurrency} onChange={e => setForm({ ...form, preferredCurrency: e.target.value })}>
                  {['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-input" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}>
                  {['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
              <Save size={15} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Password */}
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--accent-terracotta)' }} /> Change Password
          </h2>
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([field, label]) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type="password" required value={pwdForm[field]} onChange={e => setPwdForm({ ...pwdForm, [field]: e.target.value })} />
              </div>
            ))}
            <button type="submit" className="btn btn-dark" disabled={pwdLoading} style={{ alignSelf: 'flex-start' }}>
              {pwdLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  );
}
