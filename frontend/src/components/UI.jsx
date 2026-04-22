/**
 * Shared UI Components for FridgeAI Nexus
 */

import React from 'react';

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    'fresh':         { cls: 'badge-fresh',    label: 'Fresh' },
    'good':          { cls: 'badge-good',     label: 'Good' },
    'expiring-soon': { cls: 'badge-expiring', label: 'Expiring' },
    'expired':       { cls: 'badge-expired',  label: 'Expired' }
  };
  const { cls, label } = map[status] || { cls: 'badge-good', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Freshness Bar ─────────────────────────────────────────────────────────────
export function FreshnessBar({ score }) {
  const color = score > 60 ? '#22c55e' : score > 30 ? '#eab308' : '#ef4444';
  return (
    <div className="freshness-bar">
      <div
        className="freshness-bar-fill"
        style={{ width: `${Math.max(0, score)}%`, background: color }}
      />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = '#0ea5e9', subtitle }) {
  return (
    <div className="glass-card p-5 animate-fade-up" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -10, right: -10, fontSize: 60,
        opacity: 0.06, transform: 'rotate(15deg)'
      }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: '#64748b' }}>{subtitle}</div>}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, border: '3px solid #334155',
      borderTopColor: '#0ea5e9', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  );
}

// Add spin keyframe via injected style
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, message, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>{message}</div>
      {sub && <div style={{ fontSize: 14 }}>{sub}</div>}
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div
        className="glass-card"
        style={{ width: '100%', maxWidth: 520, padding: 28, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = {
    urgent: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
    high:   { bg: 'rgba(249,115,22,0.15)', color: '#f97316', border: 'rgba(249,115,22,0.3)' },
    medium: { bg: 'rgba(234,179,8,0.15)',  color: '#eab308', border: 'rgba(234,179,8,0.3)' },
    low:    { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e', border: 'rgba(34,197,94,0.3)' }
  };
  const s = map[priority] || map.low;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {priority}
    </span>
  );
}
