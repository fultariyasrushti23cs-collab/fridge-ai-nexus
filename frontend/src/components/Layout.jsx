/**
 * Layout — Sidebar + main content shell
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const NAV = [
  { to: '/dashboard',      icon: '⊞', label: 'Dashboard' },
  { to: '/food-items',     icon: '🥗', label: 'Food Items' },
  { to: '/recipes',        icon: '📖', label: 'Recipes' },
  { to: '/grocery-alerts', icon: '🛒', label: 'Grocery' },
  { to: '/settings',       icon: '⚙️', label: 'Settings' },
];

export default function Layout() {
  const { stats, fridge, groceryAlerts, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div className="flex h-screen overflow-hidden relative z-10">

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 68,
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid #334155',
          transition: 'width 0.25s ease',
          display: 'flex', flexDirection: 'column',
          flexShrink: 0, zIndex: 50, overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700" style={{ minHeight: 64 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 0 16px rgba(14,165,233,0.4)'
          }}>❄</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', lineHeight: 1.2 }}>FridgeAI</div>
              <div style={{ fontWeight: 400, fontSize: 11, color: '#0ea5e9' }}>NEXUS</div>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', padding: '8px', alignSelf: sidebarOpen ? 'flex-end' : 'center',
            marginTop: 8, marginRight: sidebarOpen ? 8 : 0,
            fontSize: 16, borderRadius: 6, transition: 'color 0.2s'
          }}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? '←' : '→'}
        </button>

        {/* Nav links */}
        <nav style={{ padding: '8px', flex: 1 }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ marginBottom: 4, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
              title={!sidebarOpen ? label : undefined}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              {sidebarOpen && (
                <span style={{ fontSize: 14, whiteSpace: 'nowrap' }}>{label}</span>
              )}
              {/* Badge for grocery pending */}
              {label === 'Grocery' && groceryAlerts.length > 0 && sidebarOpen && (
                <span style={{
                  marginLeft: 'auto', background: '#ef4444', color: 'white',
                  fontSize: 10, borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>{groceryAlerts.length}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Fridge status mini */}
        {sidebarOpen && fridge && (
          <div style={{
            margin: 8, padding: 12, borderRadius: 12,
            background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)'
          }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Fridge Status</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Main</span>
              <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>{fridge.temperature?.main}°C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Freezer</span>
              <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>{fridge.temperature?.freezer}°C</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
              background: fridge.energyMode === 'eco' ? 'rgba(34,197,94,0.15)' : 'rgba(14,165,233,0.15)',
              color: fridge.energyMode === 'eco' ? '#22c55e' : '#38bdf8',
              border: `1px solid ${fridge.energyMode === 'eco' ? 'rgba(34,197,94,0.3)' : 'rgba(14,165,233,0.3)'}`
            }}>
              {fridge.energyMode === 'eco' ? '🌿' : '⚡'} {fridge.energyMode?.toUpperCase()} MODE
            </div>
          </div>
        )}

        {/* Expired alert */}
        {sidebarOpen && stats.expired > 0 && (
          <div style={{
            margin: '0 8px 8px', padding: '10px 12px', borderRadius: 10,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)'
          }}>
            <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
              ⚠ {stats.expired} item{stats.expired > 1 ? 's' : ''} expired
            </div>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
