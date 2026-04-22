/**
 * Grocery Alerts Page
 * Manage grocery reminders — auto-generated + manual entries
 */

import React, { useState, useEffect } from 'react';
import { groceryAPI } from '../utils/api';
import { SectionHeader, EmptyState, Spinner, Modal, PriorityBadge } from '../components/UI';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const CATS  = ['dairy','meat','vegetables','fruits','beverages','condiments','other'];
const UNITS = ['pieces','kg','g','liters','ml','bottles','packs','boxes'];
const CAT_ICONS = { dairy:'🥛', meat:'🥩', vegetables:'🥦', fruits:'🍎', beverages:'🥤', condiments:'🫙', other:'📦' };

const emptyForm = { itemName: '', category: 'other', priority: 'medium', suggestedQuantity: 1, unit: 'pieces', estimatedCost: '', notes: '' };

export default function GroceryAlerts() {
  const { fetchGrocery } = useApp();
  const [alerts,     setAlerts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);
  const [form,       setForm]       = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filter,     setFilter]     = useState('pending');
  const [updating,   setUpdating]   = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await groceryAPI.getAll(filter);
      setAlerts(res.data.data || []);
    } catch { toast.error('Failed to load alerts'); }
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await groceryAPI.add(form);
      toast.success(`${form.itemName} added to grocery list!`);
      setForm(emptyForm);
      setShowAdd(false);
      fetchAlerts();
      fetchGrocery();
    } catch { toast.error('Failed to add grocery alert'); }
    setSubmitting(false);
  };

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await groceryAPI.update(id, { status });
      toast.success(status === 'bought' ? '✅ Marked as bought!' : 'Alert dismissed');
      fetchAlerts();
      fetchGrocery();
    } catch { toast.error('Update failed'); }
    setUpdating(null);
  };

  const handleDelete = async (id) => {
    try {
      await groceryAPI.remove(id);
      toast.success('Alert removed');
      fetchAlerts();
      fetchGrocery();
    } catch { toast.error('Delete failed'); }
  };

  // Totals
  const totalCost = alerts
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + (Number(a.estimatedCost) || 0), 0);

  const REASON_LABELS = {
    'out-of-stock': { label: 'Out of Stock', color: '#ef4444' },
    'expiring-soon': { label: 'Expiring Soon', color: '#eab308' },
    'low-quantity': { label: 'Low Quantity', color: '#f97316' },
    'manual': { label: 'Manual', color: '#94a3b8' }
  };

  return (
    <div>
      <SectionHeader
        title="Grocery Alerts"
        subtitle="AI-generated and manual grocery reminders"
        action={<button className="btn-frost" onClick={() => setShowAdd(true)}>+ Add Item</button>}
      />

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 20, padding: '14px 18px',
        background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)',
        borderRadius: 12, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>
          📋 <strong style={{ color: '#f1f5f9' }}>{alerts.filter(a=>a.status==='pending').length}</strong> items needed
        </div>
        {totalCost > 0 && (
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            💰 Est. cost: <strong style={{ color: '#22c55e' }}>₹{totalCost.toFixed(0)}</strong>
          </div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['pending','bought','dismissed'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                background: filter === s ? '#0ea5e9' : '#1e293b',
                color: filter === s ? 'white' : '#64748b'
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>
      ) : alerts.length === 0 ? (
        <EmptyState icon="🛒" message="No grocery alerts" sub={filter === 'pending' ? 'All stocked up! Add items manually if needed.' : `No ${filter} items.`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((alert, idx) => {
            const reasonInfo = REASON_LABELS[alert.reason] || REASON_LABELS.manual;
            return (
              <div
                key={alert._id}
                className="glass-card p-4 animate-fade-up"
                style={{ animationDelay: `${idx * 0.04}s`, opacity: 0, display: 'flex', alignItems: 'center', gap: 16 }}
              >
                {/* Category icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>
                  {CAT_ICONS[alert.category] || '📦'}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{alert.itemName}</span>
                    <PriorityBadge priority={alert.priority} />
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600,
                      background: `${reasonInfo.color}18`, color: reasonInfo.color,
                      border: `1px solid ${reasonInfo.color}40`
                    }}>{reasonInfo.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {alert.suggestedQuantity} {alert.unit}
                    {alert.estimatedCost > 0 && ` · ₹${alert.estimatedCost}`}
                    {alert.store && ` · ${alert.store}`}
                  </div>
                  {alert.notes && <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{alert.notes}</div>}
                  {alert.relatedFoodItemId && (
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                      🔗 Related to: {alert.relatedFoodItemId.name}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div style={{ fontSize: 11, color: '#475569', textAlign: 'right', flexShrink: 0 }}>
                  {new Date(alert.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                {alert.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleStatusChange(alert._id, 'bought')}
                      disabled={updating === alert._id}
                      style={{
                        padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: '#22c55e', color: 'white', fontSize: 12, fontWeight: 600
                      }}
                    >
                      {updating === alert._id ? '...' : '✓ Bought'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(alert._id, 'dismissed')}
                      style={{
                        padding: '7px 12px', borderRadius: 8, border: '1px solid #334155',
                        background: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {alert.status !== 'pending' && (
                  <button
                    onClick={() => handleDelete(alert._id)}
                    style={{
                      padding: '7px 12px', borderRadius: 8, border: '1px solid #334155',
                      background: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12
                    }}
                  >
                    🗑
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Grocery Item">
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Item Name *</label>
            <input placeholder="e.g. Whole Milk" value={form.itemName} onChange={e => setForm(p => ({ ...p, itemName: e.target.value }))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Quantity</label>
              <input type="number" min="0" value={form.suggestedQuantity} onChange={e => setForm(p => ({ ...p, suggestedQuantity: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Unit</label>
              <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Est. Cost (₹)</label>
            <input type="number" placeholder="0" value={form.estimatedCost} onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Notes</label>
            <textarea rows={2} placeholder="Any notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #334155', background: 'none', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" className="btn-frost" style={{ flex: 1 }} disabled={submitting}>{submitting ? 'Adding...' : 'Add to List'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
