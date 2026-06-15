import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sliders, Plus, TrendingDown, Wind, Monitor } from 'lucide-react';
import AppLayout from '../../components/dashboard/AppLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const sliderControls = [
  { key: 'hvacRuntimeReductionPercent', label: 'HVAC Runtime Reduction', unit: '%', min: 0, max: 60, default: 30, impact: 'Correct HVAC schedule + smart thermostat' },
  { key: 'deviceShutdownPolicy', label: 'PC Shutdown Policy', unit: 'toggle', impact: 'Auto-sleep + end-of-day enforcement' },
  { key: 'lightingAutomation', label: 'Lighting Automation', unit: 'toggle', impact: 'Motion sensors in low-traffic zones' },
  { key: 'weekendShutdown', label: 'Full Weekend Shutdown', unit: 'toggle', impact: 'All non-essential loads off Saturday/Sunday' },
  { key: 'smartStripAdoption', label: 'Smart Power Strips', unit: 'toggle', impact: 'Non-essential network + pantry devices' },
];

export default function ScenarioSimulatorPage() {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [changes, setChanges] = useState({ hvacRuntimeReductionPercent: 30, deviceShutdownPolicy: false, lightingAutomation: false, weekendShutdown: false, smartStripAdoption: false });
  const [scenarios, setScenarios] = useState([]);
  const [computing, setComputing] = useState(false);
  const [scenarioName, setScenarioName] = useState('Scenario 1');

  useEffect(() => {
    api.get(`/api/analyses/${analysisId}`).then(r => setAnalysis(r.data));
    api.get(`/api/scenarios/${analysisId}/scenarios`).then(r => setScenarios(r.data));
  }, [analysisId]);

  const baseCost = analysis ? Number(analysis.estimatedAfterHoursCost) : 0;

  // Live preview calculation (mirrors backend logic)
  const previewSavings = () => {
    let ratio = 0;
    if (changes.hvacRuntimeReductionPercent) ratio += (changes.hvacRuntimeReductionPercent / 100) * 0.45;
    if (changes.weekendShutdown) ratio += 0.08;
    if (changes.smartStripAdoption) ratio += 0.07;
    if (changes.lightingAutomation) ratio += 0.06;
    if (changes.deviceShutdownPolicy) ratio += 0.10;
    return Math.round(baseCost * Math.min(ratio, 0.90));
  };

  const saveScenario = async () => {
    setComputing(true);
    try {
      const res = await api.post(`/api/scenarios/${analysisId}/scenarios`, { name: scenarioName, changesJson: changes });
      setScenarios(prev => [res.data, ...prev]);
      toast.success('Scenario saved!');
    } catch { toast.error('Failed to save scenario'); }
    finally { setComputing(false); }
  };

  const projectedSavings = previewSavings();
  const annualSavings = projectedSavings * 12;

  return (
    <AppLayout>
      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to={`/app/analyses/${analysisId}`} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '0.5rem' }}>← Analysis Results</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.3rem' }}>Scenario Simulator</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Adjust controls to see projected savings before committing to any changes.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sliderControls.map(ctrl => (
              <div key={ctrl.key} className="scenario-control">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ctrl.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{ctrl.impact}</div>
                  </div>
                  {ctrl.unit === 'toggle' ? (
                    <label className="toggle">
                      <input type="checkbox" checked={!!changes[ctrl.key]} onChange={e => setChanges({ ...changes, [ctrl.key]: e.target.checked })} />
                      <span className="toggle-slider" />
                    </label>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-terracotta)' }}>{changes[ctrl.key]}{ctrl.unit}</span>
                  )}
                </div>
                {ctrl.unit !== 'toggle' && (
                  <input type="range" min={ctrl.min} max={ctrl.max} step={5} value={changes[ctrl.key] || ctrl.default}
                    onChange={e => setChanges({ ...changes, [ctrl.key]: parseInt(e.target.value) })} />
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="form-input" value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Scenario name" style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={saveScenario} disabled={computing}><Plus size={16} /> Save</button>
            </div>
          </div>

          {/* Live preview */}
          <div style={{ position: 'sticky', top: '2rem' }}>
            <motion.div className="card" style={{ background: 'var(--surface-dark)', color: 'var(--text-inverse)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(109,140,114,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-inverse-muted)', marginBottom: '1rem' }}>Projected Outcome</div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-inverse-muted)', marginBottom: '0.3rem' }}>Monthly Savings</div>
                  <motion.div key={projectedSavings} initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--accent-sage-light)' }}>
                    ₹{projectedSavings.toLocaleString()}
                  </motion.div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(245,240,230,0.05)', borderRadius: 10, padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-inverse-muted)', marginBottom: 2 }}>Annual</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent-gold)' }}>₹{(annualSavings / 100000).toFixed(1)}L</div>
                  </div>
                  <div style={{ background: 'rgba(245,240,230,0.05)', borderRadius: 10, padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-inverse-muted)', marginBottom: 2 }}>vs Baseline</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent-terracotta-light)' }}>{baseCost > 0 ? Math.round((projectedSavings / baseCost) * 100) : 0}%</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-inverse-muted)', marginBottom: 6 }}>
                    <span>Current waste: ₹{baseCost.toLocaleString()}</span>
                    <span>After fix: ₹{(baseCost - projectedSavings).toLocaleString()}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(245,240,230,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${baseCost > 0 ? (projectedSavings / baseCost) * 100 : 0}%` }} transition={{ duration: 0.4 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-sage), var(--accent-gold))', borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Saved scenarios */}
            {scenarios.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Saved Scenarios</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {scenarios.map(s => (
                    <div key={s.id} style={{ background: 'var(--surface-card)', borderRadius: 12, padding: '0.875rem 1rem', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</span>
                      <span style={{ color: 'var(--state-success)', fontWeight: 700, fontSize: '0.875rem' }}>₹{Number(s.projectedMonthlySavings).toLocaleString()}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
