import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Check } from 'lucide-react';
import AppLayout from '../../components/dashboard/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const STEPS = ['Billing', 'Schedule', 'HVAC & Profile', 'Equipment', 'Review'];

const Input = ({ label, hint, ...props }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input className="form-input" {...props} />
    {hint && <span className="form-hint">{hint}</span>}
  </div>
);

function Stepper({ current }) {
  return (
    <div className="stepper">
      {STEPS.map((label, i) => (
        <div key={label} className="step-item">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div className={`step-circle ${i < current ? 'completed' : i === current ? 'active' : 'pending'}`}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span style={{ fontSize: '0.7rem', color: i === current ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === current ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} style={{ margin: '0 0.5rem', marginBottom: '1.2rem' }} />}
        </div>
      ))}
    </div>
  );
}

export default function NewAnalysisWizard() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { organization } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [bill, setBill] = useState({ billAmount: '', kwhTotal: '', billingPeriodStart: '', billingPeriodEnd: '', currency: 'INR', tariffType: 'flat', unitRate: '' });
  const [schedule, setSchedule] = useState({ weekdayOpenTime: '09:00', weekdayCloseTime: '19:00', saturdayOpenTime: '', saturdayCloseTime: '', securityAlwaysOn: true, hvacPrecoolMins: 30, hvacPostcoolMins: 30 });
  const [profile, setProfile] = useState({ hvacType: 'split_ac', hasServerRoom: false, weekendUsage: 'none', occupantsMin: '', occupantsMax: '' });
  const [equipment, setEquipment] = useState([
    { category: 'hvac', itemName: 'Split AC', quantity: 4, ratedWatts: 1500, usagePattern: 'scheduled' },
    { category: 'compute', itemName: 'Desktop PC', quantity: 20, ratedWatts: 150, standbyWatts: 5, usagePattern: 'scheduled' },
    { category: 'compute', itemName: 'Monitor', quantity: 20, ratedWatts: 30, standbyWatts: 2, usagePattern: 'scheduled' },
    { category: 'network', itemName: 'Network Switch', quantity: 2, ratedWatts: 30, standbyWatts: 30, usagePattern: 'always_on' },
    { category: 'kitchen', itemName: 'Refrigerator', quantity: 1, ratedWatts: 200, standbyWatts: 200, usagePattern: 'always_on' },
    { category: 'lighting', itemName: 'LED Tube 18W', quantity: 40, ratedWatts: 18, usagePattern: 'scheduled' },
  ]);

  const handleNext = () => {
    if (step === 0) {
      if (!bill.billAmount || parseFloat(bill.billAmount) <= 0) {
        return toast.error('Please enter a valid bill amount greater than 0');
      }
      if (!bill.billingPeriodStart || !bill.billingPeriodEnd) {
        return toast.error('Please select both billing dates');
      }
      if (new Date(bill.billingPeriodStart) >= new Date(bill.billingPeriodEnd)) {
        return toast.error('Billing start date must be before end date');
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(bill.billingPeriodStart) >= today || new Date(bill.billingPeriodEnd) >= today) {
        return toast.error('Billing dates must be in the past');
      }
    }

    if (step === 1) {
      if (!schedule.weekdayOpenTime || !schedule.weekdayCloseTime) {
        return toast.error('Please enter weekday open and close times');
      }
      if (schedule.weekdayOpenTime >= schedule.weekdayCloseTime) {
        return toast.error('Weekday opening time must be before closing time');
      }
      if (schedule.saturdayOpenTime && schedule.saturdayCloseTime && schedule.saturdayOpenTime >= schedule.saturdayCloseTime) {
        return toast.error('Saturday opening time must be before closing time');
      }
    }

    if (step === 3) {
      for (const item of equipment) {
        if (item.quantity <= 0) return toast.error(`Invalid quantity for ${item.itemName}`);
        if (item.ratedWatts < 0) return toast.error(`Invalid watts for ${item.itemName}`);
      }
    }

    setStep(s => s + 1);
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      // 1. Save bill
      const billRes = await api.post(`/api/bills/${siteId}/bills`, { ...bill, billAmount: parseFloat(bill.billAmount), kwhTotal: bill.kwhTotal ? parseFloat(bill.kwhTotal) : undefined, unitRate: bill.unitRate ? parseFloat(bill.unitRate) : undefined });
      // 2. Upsert schedule
      await api.put(`/api/schedules/${siteId}/schedule`, schedule);
      // 3. Update site profile
      await api.patch(`/api/sites/${siteId}`, profile);
      // 4. Create equipment (reset first in a real app)
      for (const item of equipment) {
        await api.post(`/api/equipment/${siteId}/equipment`, item);
      }
      // 5. Run analysis
      const analysisRes = await api.post(`/api/analyses/${siteId}/analyze`, { billId: billRes.data.id });
      toast.success('Analysis complete!');
      navigate(`/app/analyses/${analysisRes.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.3rem' }}>New Analysis</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete all steps to get your ghost load estimate.</p>
        </div>

        <Stepper current={step} />

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>

              {/* STEP 0: Bill */}
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Billing Details</h2>
                  <div className="grid-2">
                    <Input label="Bill Amount (₹) *" type="number" required value={bill.billAmount} onChange={e => setBill({ ...bill, billAmount: e.target.value })} placeholder="145000" hint="Total amount from your electricity bill" />
                    <Input label="kWh Consumed (optional)" type="number" value={bill.kwhTotal} onChange={e => setBill({ ...bill, kwhTotal: e.target.value })} placeholder="17000" hint="Improves confidence if available" />
                  </div>
                  <div className="grid-2">
                    <Input label="Billing Start Date *" type="date" required value={bill.billingPeriodStart} onChange={e => setBill({ ...bill, billingPeriodStart: e.target.value })} />
                    <Input label="Billing End Date *" type="date" required value={bill.billingPeriodEnd} onChange={e => setBill({ ...bill, billingPeriodEnd: e.target.value })} />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Tariff Type</label>
                      <select className="form-input" value={bill.tariffType} onChange={e => setBill({ ...bill, tariffType: e.target.value })}>
                        <option value="flat">Flat rate</option>
                        <option value="tou">Time-of-use</option>
                        <option value="estimated">Unknown (estimated)</option>
                      </select>
                    </div>
                    <Input label="Unit Rate (₹/kWh)" type="number" value={bill.unitRate} onChange={e => setBill({ ...bill, unitRate: e.target.value })} placeholder="8.50" hint="Leave blank to use regional average (₹8.5)" />
                  </div>
                  <div className="assumptions-drawer">
                    <strong>💡 Tip:</strong> If kWh is not on your bill, GhostLoad estimates it from the bill amount ÷ tariff rate. Confidence score will reflect this.
                  </div>
                </div>
              )}

              {/* STEP 1: Schedule */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Office Schedule</h2>
                  <div className="grid-2">
                    <Input label="Weekday Open Time *" type="time" value={schedule.weekdayOpenTime} onChange={e => setSchedule({ ...schedule, weekdayOpenTime: e.target.value })} />
                    <Input label="Weekday Close Time *" type="time" value={schedule.weekdayCloseTime} onChange={e => setSchedule({ ...schedule, weekdayCloseTime: e.target.value })} />
                  </div>
                  <div className="grid-2">
                    <Input label="Saturday Open (blank = closed)" type="time" value={schedule.saturdayOpenTime} onChange={e => setSchedule({ ...schedule, saturdayOpenTime: e.target.value })} />
                    <Input label="Saturday Close" type="time" value={schedule.saturdayCloseTime} onChange={e => setSchedule({ ...schedule, saturdayCloseTime: e.target.value })} />
                  </div>
                  <div className="grid-2">
                    <Input label="HVAC Pre-cool (minutes)" type="number" value={schedule.hvacPrecoolMins} onChange={e => setSchedule({ ...schedule, hvacPrecoolMins: parseInt(e.target.value) })} />
                    <Input label="HVAC Post-cool (minutes)" type="number" value={schedule.hvacPostcoolMins} onChange={e => setSchedule({ ...schedule, hvacPostcoolMins: parseInt(e.target.value) })} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <label className="toggle">
                      <input type="checkbox" checked={schedule.securityAlwaysOn} onChange={e => setSchedule({ ...schedule, securityAlwaysOn: e.target.checked })} />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.9rem' }}>Security / access system runs 24/7</span>
                  </div>
                </div>
              )}

              {/* STEP 2: HVAC & Profile */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>HVAC & Office Profile</h2>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">HVAC Type</label>
                      <select className="form-input" value={profile.hvacType} onChange={e => setProfile({ ...profile, hvacType: e.target.value })}>
                        {[['split_ac', 'Split AC'], ['central_ac', 'Central AC'], ['vrf', 'VRF System'], ['chiller', 'Chiller'], ['none', 'No HVAC'], ['other', 'Other']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weekend Usage</label>
                      <select className="form-input" value={profile.weekendUsage} onChange={e => setProfile({ ...profile, weekendUsage: e.target.value })}>
                        {[['none', 'Closed (no usage)'], ['low', 'Low (skeleton staff)'], ['medium', 'Medium (partial teams)'], ['high', 'High (near-full ops)']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <Input label="Min Occupants" type="number" value={profile.occupantsMin} onChange={e => setProfile({ ...profile, occupantsMin: e.target.value })} placeholder="30" />
                    <Input label="Max Occupants" type="number" value={profile.occupantsMax} onChange={e => setProfile({ ...profile, occupantsMax: e.target.value })} placeholder="60" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <label className="toggle">
                      <input type="checkbox" checked={profile.hasServerRoom} onChange={e => setProfile({ ...profile, hasServerRoom: e.target.checked })} />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.9rem' }}>This site has a dedicated server room or IT closet</span>
                  </div>
                </div>
              )}

              {/* STEP 3: Equipment */}
              {step === 3 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>Equipment Inventory</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {equipment.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 1fr', gap: '0.75rem', alignItems: 'center', background: 'var(--bg-section)', borderRadius: 12, padding: '0.875rem 1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>{item.category.toUpperCase()}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.itemName}</div>
                        </div>
                        <div className="form-group" style={{ gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quantity</label>
                          <input className="form-input" type="number" value={item.quantity} min={1} style={{ padding: '0.4rem 0.7rem', fontSize: '0.875rem' }}
                            onChange={e => { const upd = [...equipment]; upd[i] = { ...upd[i], quantity: parseInt(e.target.value) }; setEquipment(upd); }} />
                        </div>
                        <div className="form-group" style={{ gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Watts</label>
                          <input className="form-input" type="number" value={item.ratedWatts} style={{ padding: '0.4rem 0.7rem', fontSize: '0.875rem' }}
                            onChange={e => { const upd = [...equipment]; upd[i] = { ...upd[i], ratedWatts: parseInt(e.target.value) }; setEquipment(upd); }} />
                        </div>
                        <span className={`badge ${item.usagePattern === 'always_on' ? 'badge-terracotta' : item.usagePattern === 'intermittent' ? 'badge-gold' : 'badge-sage'}`} style={{ fontSize: '0.68rem' }}>
                          {item.usagePattern.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Review */}
              {step === 4 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>Review & Run</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                      ['Bill Amount', `₹${parseFloat(bill.billAmount || 0).toLocaleString()}`],
                      ['kWh', bill.kwhTotal || 'Will be estimated'],
                      ['Office Hours', `${schedule.weekdayOpenTime} – ${schedule.weekdayCloseTime}`],
                      ['HVAC Type', profile.hvacType?.replace('_', ' ')],
                      ['Equipment Items', equipment.length],
                      ['Server Room', profile.hasServerRoom ? 'Yes' : 'No'],
                    ].map(([k, v]) => (
                      <div key={k} className="assumption-row">
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span className="assumption-value">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="assumptions-drawer" style={{ marginBottom: '1.5rem' }}>
                    <strong>Estimated model:</strong> Results are based on your inputs and heuristic benchmarks. Confidence score will be shown with every result. Assumptions are always visible.
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={() => step > 0 && setStep(s => s - 1)} disabled={step === 0}>
            <ChevronLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={runAnalysis} disabled={loading}>
              {loading ? 'Analyzing...' : <><Zap size={16} /> Run Analysis</>}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
