/**
 * Dashboard Page
 * Shows stats, temperature, alerts, freshness chart, energy info
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { aiAPI, fridgeAPI } from '../utils/api';
import { StatCard, SectionHeader, Spinner, FreshnessBar, StatusBadge } from '../components/UI';
import toast from 'react-hot-toast';

// Category color map
const CAT_COLORS = {
  dairy: '#38bdf8', meat: '#f97316', vegetables: '#22c55e',
  fruits: '#a78bfa', beverages: '#06b6d4', condiments: '#eab308',
  leftovers: '#94a3b8', other: '#64748b'
};

const STATUS_COLORS = { fresh: '#22c55e', good: '#38bdf8', 'expiring-soon': '#eab308', expired: '#ef4444' };

export default function Dashboard() {
  const { foodItems, fridge, stats, groceryAlerts, fetchFridge } = useApp();
  const navigate = useNavigate();
  const [energyData,    setEnergyData]    = useState(null);
  const [loadingEnergy, setLoadingEnergy] = useState(false);
  const [settingMode,   setSettingMode]   = useState(false);

  // Build status pie data
  const statusPieData = [
    { name: 'Fresh',    value: stats.fresh,        fill: '#22c55e' },
    { name: 'Good',     value: stats.good,         fill: '#38bdf8' },
    { name: 'Expiring', value: stats.expiringSoon,  fill: '#eab308' },
    { name: 'Expired',  value: stats.expired,       fill: '#ef4444' },
  ].filter(d => d.value > 0);

  // Category breakdown
  const categoryData = Object.entries(
    foodItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([cat, count]) => ({ name: cat, count, fill: CAT_COLORS[cat] || '#64748b' }));

  // Freshness timeline (7-day mock trend)
  const freshnessTimeline = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    fresh:   Math.floor(Math.random() * 4) + stats.fresh,
    expiring: Math.floor(Math.random() * 2) + stats.expiringSoon,
  }));

  // Load energy data
  useEffect(() => {
    const fetchEnergy = async () => {
      setLoadingEnergy(true);
      try {
        const res = await aiAPI.energyOptimization();
        setEnergyData(res.data);
      } catch { /* skip */ }
      setLoadingEnergy(false);
    };
    fetchEnergy();
  }, []);

  // Energy mode toggle
  const handleEnergyMode = async (mode) => {
    setSettingMode(true);
    try {
      await fridgeAPI.setEnergyMode(mode);
      await fetchFridge();
      toast.success(`Switched to ${mode.toUpperCase()} mode`);
    } catch { toast.error('Failed to update energy mode'); }
    setSettingMode(false);
  };

  // Expiring items (sorted)
  const expiringItems = [...foodItems]
    .filter(i => i.status === 'expiring-soon' || i.status === 'expired')
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 5);

  return (
    <div style={{ maxWidth: 1400 }}>
      <SectionHeader
        title="Dashboard"
        subtitle={`Last updated: ${new Date().toLocaleTimeString()}`}
        action={
          <button className="btn-frost" style={{ fontSize: 13 }} onClick={() => navigate('/food-items')}>
            + Add Item
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Items"   value={stats.total}        icon="🥗" color="#38bdf8"  subtitle="In refrigerator" />
        <StatCard label="Fresh"         value={stats.fresh}        icon="✅" color="#22c55e"  subtitle="Fully fresh" />
        <StatCard label="Good"          value={stats.good}         icon="👍" color="#38bdf8"  subtitle="Still good" />
        <StatCard label="Expiring Soon" value={stats.expiringSoon} icon="⚠️" color="#eab308" subtitle="Needs attention" />
        <StatCard label="Expired"       value={stats.expired}      icon="❌" color="#ef4444"  subtitle="Discard these" />
        <StatCard label="Grocery Alerts" value={groceryAlerts.length} icon="🛒" color="#a78bfa" subtitle="Items needed" />
      </div>

      {/* ── Row 2: Charts + Temperature ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 16, marginBottom: 24 }}>

        {/* Freshness Trend */}
        <div className="glass-card p-5">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>FRESHNESS TREND (7 DAYS)</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={freshnessTimeline}>
              <defs>
                <linearGradient id="gFresh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="fresh"   stroke="#22c55e" fill="url(#gFresh)" name="Fresh" />
              <Area type="monotone" dataKey="expiring" stroke="#eab308" fill="url(#gExp)"   name="Expiring" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-5">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>ITEMS BY CATEGORY</div>
          {categoryData.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>No items yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={categoryData} dataKey="count" cx="50%" cy="50%" innerRadius={35} outerRadius={55}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {categoryData.map(cat => (
                  <span key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.fill, display: 'inline-block' }}/>
                    {cat.name} ({cat.count})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Temperature Panel */}
        <div className="glass-card p-5">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>TEMPERATURE</div>
          {fridge ? (
            <>
              {[
                { zone: 'Main', temp: fridge.temperature?.main,    target: fridge.targetTemperature?.main,    icon: '🌡️' },
                { zone: 'Freezer', temp: fridge.temperature?.freezer, target: fridge.targetTemperature?.freezer, icon: '🧊' },
                { zone: 'Crisper', temp: fridge.temperature?.crisper, target: null, icon: '🥬' }
              ].map(z => (
                <div key={z.zone} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{z.icon} {z.zone}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                      {z.temp}°C
                    </span>
                  </div>
                  {z.target && (
                    <div style={{ fontSize: 11, color: '#475569' }}>Target: {z.target}°C</div>
                  )}
                  <div style={{ height: 4, background: '#1e3a5f', borderRadius: 2, marginTop: 4 }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: '#38bdf8',
                      width: `${Math.min(100, Math.max(0, 100 - Math.abs(z.temp) * 3))}%`,
                      transition: 'width 1s ease'
                    }}/>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>
                Humidity: {fridge.humidity}%
              </div>
              <div style={{
                marginTop: 12, padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite', display: 'inline-block' }}/>
                Online · {fridge.energyMode?.toUpperCase()} MODE
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><Spinner /></div>
          )}
        </div>
      </div>

      {/* ── Row 3: Expiring Items + Energy Tips ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Expiring/Expired Alerts */}
        <div className="glass-card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>⚠ EXPIRY ALERTS</div>
            <button onClick={() => navigate('/food-items')} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: 12, cursor: 'pointer' }}>View all →</button>
          </div>
          {expiringItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 13 }}>All items are fresh!</div>
            </div>
          ) : expiringItems.map(item => (
            <div key={item._id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: '1px solid #1e3a5f'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{item.name}</div>
                <FreshnessBar score={item.freshnessScore} />
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                  {item.daysUntilExpiry < 0
                    ? `Expired ${Math.abs(item.daysUntilExpiry)} day(s) ago`
                    : `${item.daysUntilExpiry} day(s) left`}
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>

        {/* Energy Optimization */}
        <div className="glass-card p-5">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>⚡ ENERGY OPTIMIZATION</div>
          {loadingEnergy ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><Spinner /></div>
          ) : energyData ? (
            <>
              {/* Mode Buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['eco', 'normal', 'boost'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleEnergyMode(mode)}
                    disabled={settingMode}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                      background: fridge?.energyMode === mode
                        ? mode === 'eco' ? '#22c55e' : mode === 'boost' ? '#ef4444' : '#0ea5e9'
                        : '#1e3a5f',
                      color: fridge?.energyMode === mode ? 'white' : '#64748b'
                    }}
                  >
                    {mode === 'eco' ? '🌿' : mode === 'boost' ? '🚀' : '⚡'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {/* Savings summary */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Current', val: energyData.currentUsage?.daily, color: '#f97316' },
                  { label: 'Optimized', val: energyData.optimizedUsage?.daily, color: '#22c55e' }
                ].map(d => (
                  <div key={d.label} style={{ flex: 1, textAlign: 'center', padding: 10, background: '#0f172a', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{d.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: d.color, fontFamily: 'JetBrains Mono' }}>{d.val}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>per day</div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>AI Tips</div>
              {energyData.tips?.slice(0, 3).map(tip => (
                <div key={tip.id} style={{
                  display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #1e3a5f', alignItems: 'flex-start'
                }}>
                  <span style={{ color: tip.impact === 'high' ? '#ef4444' : tip.impact === 'medium' ? '#eab308' : '#22c55e', fontSize: 14 }}>
                    {tip.impact === 'high' ? '🔴' : tip.impact === 'medium' ? '🟡' : '🟢'}
                  </span>
                  <div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 2 }}>{tip.suggestion}</div>
                    <div style={{ fontSize: 11, color: '#22c55e' }}>↓ {tip.potentialSaving}</div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>Could not load energy data</div>
          )}
        </div>
      </div>
    </div>
  );
}
