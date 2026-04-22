/**
 * Food Items Page
 * Lists all food items, supports add/remove, AI image detection simulation
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { foodItemsAPI, aiAPI } from '../utils/api';
import { StatusBadge, FreshnessBar, SectionHeader, Modal, EmptyState, Spinner } from '../components/UI';
import toast from 'react-hot-toast';

const CATEGORIES = ['dairy','meat','vegetables','fruits','beverages','condiments','leftovers','other'];
const LOCATIONS  = ['main-shelf','crisper','door','freezer','dairy-drawer'];
const UNITS      = ['pieces','kg','g','liters','ml','bottles','packs','boxes'];

const CAT_ICONS = {
  dairy:'🥛', meat:'🥩', vegetables:'🥦', fruits:'🍎',
  beverages:'🥤', condiments:'🫙', leftovers:'📦', other:'📋'
};

// Default form state
const emptyForm = {
  name: '', category: 'other', quantity: 1, unit: 'pieces',
  expiryDate: '', storageLocation: 'main-shelf', tags: ''
};

export default function FoodItems() {
  const { foodItems, fetchFoodItems } = useApp();
  const [showAdd,      setShowAdd]      = useState(false);
  const [showAI,       setShowAI]       = useState(false);
  const [form,         setForm]         = useState(emptyForm);
  const [filter,       setFilter]       = useState({ category: '', status: '' });
  const [aiResults,    setAiResults]    = useState([]);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [deletingId,   setDeletingId]   = useState(null);
  const fileRef = useRef();

  // Filtered + searched items
  const displayed = foodItems.filter(item => {
    if (filter.category && item.category !== filter.category) return false;
    if (filter.status   && item.status   !== filter.status)   return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Add food item
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await foodItemsAPI.add({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      });
      toast.success(`${form.name} added to fridge!`);
      setForm(emptyForm);
      setShowAdd(false);
      fetchFoodItems();
    } catch (err) {
      toast.error('Failed to add item: ' + (err.response?.data?.error || err.message));
    }
    setSubmitting(false);
  };

  // Remove food item
  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the fridge?`)) return;
    setDeletingId(id);
    try {
      await foodItemsAPI.remove(id);
      toast.success(`${name} removed`);
      fetchFoodItems();
    } catch {
      toast.error('Failed to remove item');
    }
    setDeletingId(null);
  };

  // AI Detection simulation
  const handleAIDetect = async () => {
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await aiAPI.detectItems('simulated_base64_image');
      setAiResults(res.data.data);
      toast.success(`Detected ${res.data.data.length} items!`);
    } catch {
      toast.error('AI detection failed');
    }
    setAiLoading(false);
  };

  // Add AI-detected item to fridge
  const handleAddDetected = async (detected) => {
    try {
      await foodItemsAPI.add({
        name:         detected.name,
        category:     detected.category,
        quantity:     1,
        unit:         'pieces',
        expiryDate:   detected.suggestedExpiry,
        detectedBy:   'ai-detection',
        storageLocation: 'main-shelf'
      });
      toast.success(`${detected.name} added from AI detection!`);
      fetchFoodItems();
    } catch {
      toast.error('Failed to add detected item');
    }
  };

  const statusColor = { fresh: '#22c55e', good: '#38bdf8', 'expiring-soon': '#eab308', expired: '#ef4444' };

  return (
    <div>
      <SectionHeader
        title="Food Items"
        subtitle={`${foodItems.length} items tracked in your refrigerator`}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-frost"
              style={{ background: 'rgba(14,165,233,0.15)', boxShadow: 'none', border: '1px solid rgba(14,165,233,0.4)', color: '#38bdf8' }}
              onClick={() => setShowAI(true)}
            >
              🤖 AI Detect
            </button>
            <button className="btn-frost" onClick={() => setShowAdd(true)}>+ Add Item</button>
          </div>
        }
      />

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="🔍 Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="fresh">Fresh</option>
          <option value="good">Good</option>
          <option value="expiring-soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
        {(filter.category || filter.status || search) && (
          <button
            onClick={() => { setFilter({ category: '', status: '' }); setSearch(''); }}
            style={{ background: 'none', border: '1px solid #334155', color: '#64748b', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* ── Items Grid ── */}
      {displayed.length === 0 ? (
        <EmptyState icon="🥗" message="No food items found" sub="Add items manually or use AI detection" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {displayed.map((item, idx) => (
            <div
              key={item._id}
              className="glass-card p-4 animate-fade-up"
              style={{ animationDelay: `${idx * 0.04}s`, opacity: 0 }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{CAT_ICONS[item.category] || '📋'}</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{item.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{item.category} · {item.storageLocation}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>

              {/* Freshness */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                  <span>Freshness</span>
                  <span style={{ color: statusColor[item.status] || '#94a3b8' }}>{item.freshnessScore}%</span>
                </div>
                <FreshnessBar score={item.freshnessScore} />
              </div>

              {/* Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                <span>{item.quantity} {item.unit}</span>
                <span>
                  {item.daysUntilExpiry < 0
                    ? <span style={{ color: '#ef4444' }}>Expired {Math.abs(item.daysUntilExpiry)}d ago</span>
                    : <span style={{ color: item.daysUntilExpiry <= 3 ? '#eab308' : '#94a3b8' }}>
                        Exp. in {item.daysUntilExpiry}d
                      </span>
                  }
                </span>
              </div>

              {/* Tags */}
              {item.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                  {item.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 10,
                      background: 'rgba(14,165,233,0.1)', color: '#38bdf8',
                      border: '1px solid rgba(14,165,233,0.2)'
                    }}>{tag}</span>
                  ))}
                </div>
              )}

              {/* AI badge */}
              {item.detectedBy === 'ai-detection' && (
                <div style={{ fontSize: 10, color: '#a78bfa', marginBottom: 8 }}>🤖 AI Detected</div>
              )}

              {/* Remove */}
              <button
                onClick={() => handleRemove(item._id, item.name)}
                disabled={deletingId === item._id}
                style={{
                  width: '100%', padding: '7px', borderRadius: 8, border: '1px solid #334155',
                  background: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#334155'; e.target.style.color = '#64748b'; }}
              >
                {deletingId === item._id ? '...' : '🗑 Remove'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Item Modal ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Food Item">
        <form onSubmit={handleAdd}>
          {[
            { label: 'Item Name *', key: 'name', type: 'text', placeholder: 'e.g. Whole Milk' },
            { label: 'Expiry Date *', key: 'expiryDate', type: 'date', placeholder: '' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required={f.label.includes('*')}
              />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Location</label>
              <select value={form.storageLocation} onChange={e => setForm(p => ({ ...p, storageLocation: e.target.value }))}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Quantity</label>
              <input type="number" min="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Unit</label>
              <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tags (comma-separated)</label>
            <input placeholder="e.g. organic, low-fat" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #334155', background: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" className="btn-frost" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── AI Detection Modal ── */}
      <Modal open={showAI} onClose={() => setShowAI(false)} title="🤖 AI Food Detection">
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
          Upload a photo of your groceries and our AI (simulated YOLO-v3 CNN) will detect food items automatically.
        </p>

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #334155', borderRadius: 12, padding: '32px 20px',
            textAlign: 'center', cursor: 'pointer', marginBottom: 16,
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#0ea5e9'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>Click to upload food photo</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>JPG, PNG up to 10MB</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAIDetect} />
        </div>

        <button
          className="btn-frost"
          style={{ width: '100%', marginBottom: 20 }}
          onClick={handleAIDetect}
          disabled={aiLoading}
        >
          {aiLoading ? '🔍 Analyzing image...' : '🚀 Run AI Detection (Demo)'}
        </button>

        {aiLoading && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spinner />
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>Running FridgeAI-YOLO-v3 model...</div>
          </div>
        )}

        {aiResults.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Detected {aiResults.length} items
            </div>
            {aiResults.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: '1px solid #1e3a5f'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {r.category} · Shelf life: {r.avgShelfLife} · Exp: {r.suggestedExpiry}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.3)'
                }}>
                  {(r.confidence * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => handleAddDetected(r)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: '#0ea5e9', color: 'white', cursor: 'pointer', fontSize: 12
                  }}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
