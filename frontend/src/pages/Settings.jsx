/**
 * Settings Page
 * Fridge configuration, temperature, energy, alert preferences
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fridgeAPI } from '../utils/api';
import { SectionHeader, Spinner } from '../components/UI';
import toast from 'react-hot-toast';

export default function Settings() {
  const { fridge, fetchFridge, loading } = useApp();
  const [saving, setSaving] = useState(false);
  const [localFridge, setLocalFridge] = useState(null);

  // Use local copy for editing
  const data = localFridge || fridge;

  const update = (path, value) => {
    const copy = JSON.parse(JSON.stringify(data || {}));
    const keys = path.split('.');
    let obj = copy;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = obj[keys[i]] || {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setLocalFridge(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fridgeAPI.update(localFridge);
      await fetchFridge();
      setLocalFridge(null);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    setSaving(false);
  };

  if (loading || !data) {
    return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={40}/></div>;
  }

  const Section = ({ title, children }) => (
    <div className="glass-card p-6" style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #1e3a5f', paddingBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );

  const Field = ({ label, children, hint }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{hint}</div>}
    </div>
  );

  const TempInput = ({ label, path, min, max }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
      <label style={{ fontSize: 13, color: '#94a3b8', width: 100 }}>{label}</label>
      <input
        type="range" min={min} max={max}
        value={data.targetTemperature?.[path] || 0}
        onChange={e => update(`targetTemperature.${path}`, Number(e.target.value))}
        style={{ flex: 1, accentColor: '#0ea5e9' }}
      />
      <span style={{ width: 60, textAlign: 'right', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
        {data.targetTemperature?.[path]}°C
      </span>
    </div>
  );

  const Toggle = ({ label, path, hint }) => {
    const keys = path.split('.');
    let val = data;
    for (const k of keys) val = val?.[k];

    return (
      <Field label={label} hint={hint}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{
            width: 44, height: 24, borderRadius: 24,
            background: val ? '#0ea5e9' : '#334155',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3, left: val ? 23 : 3,
              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
            }}/>
          </div>
          <input type="checkbox" checked={!!val} onChange={e => update(path, e.target.checked)} style={{ display: 'none' }} />
          <span style={{ fontSize: 13, color: val ? '#38bdf8' : '#64748b' }}>{val ? 'Enabled' : 'Disabled'}</span>
        </label>
      </Field>
    );
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <SectionHeader
        title="Settings"
        subtitle="Configure your FridgeAI Nexus system"
        action={
          <button className="btn-frost" onClick={handleSave} disabled={saving || !localFridge}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        }
      />

      {/* Fridge Identity */}
      <Section title="🧊 Refrigerator Profile">
        <Field label="Fridge Name">
          <input value={data.name || ''} onChange={e => update('name', e.target.value)} placeholder="My FridgeAI Nexus" />
        </Field>
        <Field label="Model">
          <input value={data.model || ''} onChange={e => update('model', e.target.value)} placeholder="Model number" />
        </Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Status: <span style={{ color: data.isOnline ? '#22c55e' : '#ef4444' }}>
              {data.isOnline ? '● Online' : '○ Offline'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Last Sync: {data.lastSync ? new Date(data.lastSync).toLocaleTimeString() : '—'}
          </div>
        </div>
      </Section>

      {/* Temperature */}
      <Section title="🌡️ Temperature Settings">
        <TempInput label="Main Fridge" path="main"   min={1}   max={8}  />
        <TempInput label="Freezer"    path="freezer" min={-25} max={-12}/>
        <Field label="Humidity (%)" hint="Optimal range: 40–60%">
          <input
            type="range" min={20} max={90}
            value={data.humidity || 45}
            onChange={e => update('humidity', Number(e.target.value))}
            style={{ width: '100%', accentColor: '#0ea5e9' }}
          />
          <div style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono', marginTop: 4 }}>{data.humidity}%</div>
        </Field>
      </Section>

      {/* Energy Mode */}
      <Section title="⚡ Energy Management">
        <Field label="Energy Mode" hint="Eco mode saves ~25% energy. Boost keeps items colder faster.">
          <div style={{ display: 'flex', gap: 10 }}>
            {['eco','normal','boost'].map(mode => (
              <button
                key={mode}
                onClick={() => update('energyMode', mode)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                  background: data.energyMode === mode
                    ? mode === 'eco' ? '#22c55e' : mode === 'boost' ? '#ef4444' : '#0ea5e9'
                    : '#1e293b',
                  color: data.energyMode === mode ? 'white' : '#64748b'
                }}
              >
                {mode === 'eco' ? '🌿 Eco' : mode === 'boost' ? '🚀 Boost' : '⚡ Normal'}
              </button>
            ))}
          </div>
        </Field>
        <div style={{ padding: '12px 14px', background: '#0f172a', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Consumption Estimates</div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { l: 'Daily', v: `${data.energyConsumption?.daily || 1.5} kWh` },
              { l: 'Monthly', v: `${data.energyConsumption?.monthly || 45} kWh` }
            ].map(e => (
              <div key={e.l}>
                <div style={{ fontSize: 11, color: '#475569' }}>{e.l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>{e.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Alerts */}
      <Section title="🔔 Alert Preferences">
        <Toggle label="Temperature Warnings"  path="alerts.temperatureWarning" hint="Alert when temp is out of safe range" />
        <Toggle label="Expiry Warnings"       path="alerts.expiryWarning"      hint="Alert 3 days before items expire" />
        <Toggle label="Door Open Warnings"    path="alerts.doorOpenWarning"    hint="Alert if door is open > 2 minutes" />
        <Toggle label="Low Stock Warnings"    path="alerts.lowStockWarning"    hint="Alert when items are running low" />
      </Section>

      {/* Capacity */}
      <Section title="📦 Capacity & Storage">
        <Field label="Total Capacity (liters)">
          <input type="number" value={data.capacity?.total || 450} onChange={e => update('capacity.total', Number(e.target.value))} />
        </Field>
        <Field label="Current Usage (liters)" hint="Auto-calculated based on items stored">
          <div style={{ position: 'relative' }}>
            <div style={{ height: 8, background: '#1e3a5f', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: ((data.capacity?.used / data.capacity?.total) * 100) > 85 ? '#ef4444' : '#0ea5e9',
                width: `${Math.min(100, (data.capacity?.used / data.capacity?.total) * 100)}%`,
                transition: 'width 0.5s'
              }}/>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
              {data.capacity?.used}L / {data.capacity?.total}L
              ({Math.round((data.capacity?.used / data.capacity?.total) * 100)}% full)
            </div>
          </div>
        </Field>
      </Section>

      {/* About */}
      <Section title="ℹ️ About FridgeAI Nexus">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { l: 'Version', v: 'v1.0.0' },
            { l: 'AI Engine', v: 'FridgeAI-YOLO-v3' },
            { l: 'NLP Model', v: 'Ingredient Matcher v2' },
            { l: 'Stack', v: 'React + Node + MongoDB' }
          ].map(item => (
            <div key={item.l} style={{ padding: '10px 14px', background: '#0f172a', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#475569' }}>{item.l}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{item.v}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
