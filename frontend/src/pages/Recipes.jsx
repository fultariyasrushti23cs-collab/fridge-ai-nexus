/**
 * Recipes Page
 * Shows AI-matched recipes based on fridge contents + compatibility check
 */

import React, { useState, useEffect } from 'react';
import { recipesAPI, compatibilityAPI } from '../utils/api';
import { SectionHeader, EmptyState, Spinner } from '../components/UI';
import toast from 'react-hot-toast';

const DIFF_COLOR = { easy: '#22c55e', medium: '#eab308', hard: '#ef4444' };
const CAT_ICON   = { breakfast: '🍳', lunch: '🥗', dinner: '🍽️', snack: '🍎', dessert: '🍰', drink: '🥤' };

export default function Recipes() {
  const [recipes,       setRecipes]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [aiMatch,       setAiMatch]       = useState(true);
  const [expanded,      setExpanded]      = useState(null);
  const [compat,        setCompat]        = useState(null);
  const [loadingCompat, setLoadingCompat] = useState(false);
  const [filter,        setFilter]        = useState('');

  const fetchRecipes = async (match) => {
    setLoading(true);
    try {
      const res = await recipesAPI.getAll(match);
      setRecipes(res.data.data || []);
    } catch { toast.error('Failed to load recipes'); }
    setLoading(false);
  };

  const fetchCompat = async () => {
    setLoadingCompat(true);
    try {
      const res = await compatibilityAPI.check();
      setCompat(res.data);
    } catch { /* skip */ }
    setLoadingCompat(false);
  };

  useEffect(() => { fetchRecipes(aiMatch); }, [aiMatch]);
  useEffect(() => { fetchCompat(); }, []);

  const displayed = filter
    ? recipes.filter(r => r.category === filter)
    : recipes;

  return (
    <div>
      <SectionHeader
        title="Recipe Suggestions"
        subtitle="AI-powered recommendations based on your fridge contents"
      />

      {/* ── Controls ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 16px', borderRadius: 10, background: aiMatch ? 'rgba(14,165,233,0.1)' : '#1e293b', border: `1px solid ${aiMatch ? 'rgba(14,165,233,0.4)' : '#334155'}`, transition: 'all 0.2s' }}>
          <div style={{
            width: 36, height: 20, borderRadius: 20,
            background: aiMatch ? '#0ea5e9' : '#334155',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 2, left: aiMatch ? 18 : 2,
              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
            }}/>
          </div>
          <input type="checkbox" checked={aiMatch} onChange={e => setAiMatch(e.target.checked)} style={{ display: 'none' }} />
          <span style={{ fontSize: 13, color: aiMatch ? '#38bdf8' : '#64748b', fontWeight: 600 }}>
            🤖 AI Match Mode
          </span>
        </label>

        {['breakfast','lunch','dinner','snack','dessert'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(filter === cat ? '' : cat)}
            style={{
              padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
              background: filter === cat ? '#0ea5e9' : '#1e293b',
              color: filter === cat ? 'white' : '#64748b'
            }}
          >
            {CAT_ICON[cat]} {cat}
          </button>
        ))}
      </div>

      {/* ── Compatibility Alert ── */}
      {compat && compat.issues?.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>
            ⚠ {compat.issues.length} Food Compatibility Issue{compat.issues.length > 1 ? 's' : ''} Detected
          </div>
          {compat.issues.slice(0, 2).map((issue, i) => (
            <div key={i} style={{ fontSize: 12, color: '#fca5a5', marginBottom: 4 }}>
              · <strong>{issue.items.join(' + ')}</strong>: {issue.reason}
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
            Compatibility Score: {compat.compatibilityScore}/100
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>
      ) : displayed.length === 0 ? (
        <EmptyState icon="📖" message="No recipes found" sub="Try turning off AI Match Mode to see all recipes" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {displayed.map((recipe, idx) => (
            <div
              key={recipe._id}
              className="glass-card animate-fade-up"
              style={{ animationDelay: `${idx * 0.05}s`, opacity: 0, overflow: 'hidden' }}
            >
              {/* Recipe header */}
              <div style={{
                padding: '16px 16px 12px',
                background: recipe.canMake ? 'rgba(34,197,94,0.05)' : recipe.matchScore > 50 ? 'rgba(14,165,233,0.05)' : 'transparent',
                borderBottom: '1px solid #1e3a5f'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{CAT_ICON[recipe.category] || '🍽️'}</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{recipe.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{recipe.description}</div>
                  </div>
                  {/* Match score badge */}
                  {aiMatch && recipe.matchScore !== undefined && (
                    <div style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                      background: recipe.canMake ? 'rgba(34,197,94,0.2)' : recipe.matchScore > 50 ? 'rgba(14,165,233,0.2)' : 'rgba(100,116,139,0.2)',
                      color: recipe.canMake ? '#22c55e' : recipe.matchScore > 50 ? '#38bdf8' : '#64748b',
                      border: `1px solid ${recipe.canMake ? 'rgba(34,197,94,0.3)' : recipe.matchScore > 50 ? 'rgba(14,165,233,0.3)' : 'rgba(100,116,139,0.3)'}`
                    }}>
                      {recipe.canMake ? '✓ Ready' : `${recipe.matchScore}%`}
                    </div>
                  )}
                </div>

                {/* Meta info row */}
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748b' }}>
                  <span>⏱ {recipe.prepTime + recipe.cookTime} min</span>
                  <span>👥 {recipe.servings} servings</span>
                  <span style={{ color: DIFF_COLOR[recipe.difficulty] }}>
                    {'●'.repeat(recipe.difficulty === 'easy' ? 1 : recipe.difficulty === 'medium' ? 2 : 3)} {recipe.difficulty}
                  </span>
                  <span>⭐ {recipe.rating}</span>
                </div>
              </div>

              {/* Ingredients */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e3a5f' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Ingredients ({recipe.ingredients?.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {recipe.ingredients?.map((ing, i) => {
                    const isAvailable = aiMatch && recipe.matchedIngredients > 0;
                    const isMissing = aiMatch && recipe.missingIngredients?.includes(ing.name.toLowerCase());
                    return (
                      <span key={i} style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 11,
                        background: isMissing ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.08)',
                        color: isMissing ? '#fca5a5' : '#94a3b8',
                        border: `1px solid ${isMissing ? 'rgba(239,68,68,0.25)' : '#1e3a5f'}`,
                        textDecoration: isMissing ? 'line-through' : 'none'
                      }}>
                        {ing.name}
                      </span>
                    );
                  })}
                </div>
                {aiMatch && recipe.missingIngredients?.length > 0 && (
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 8 }}>
                    Missing: {recipe.missingIngredients.join(', ')}
                  </div>
                )}
              </div>

              {/* Nutrition + expand */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Cal', val: recipe.nutritionPerServing?.calories },
                    { label: 'Pro', val: `${recipe.nutritionPerServing?.protein}g` },
                    { label: 'Carb', val: `${recipe.nutritionPerServing?.carbs}g` },
                    { label: 'Fat', val: `${recipe.nutritionPerServing?.fat}g` }
                  ].map(n => (
                    <div key={n.label} style={{ flex: 1, textAlign: 'center', background: '#0f172a', borderRadius: 6, padding: '6px 4px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>{n.val}</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{n.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setExpanded(expanded === recipe._id ? null : recipe._id)}
                  style={{
                    width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #334155',
                    background: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12, transition: 'all 0.2s'
                  }}
                >
                  {expanded === recipe._id ? '▲ Hide Instructions' : '▼ View Instructions'}
                </button>

                {/* Instructions */}
                {expanded === recipe._id && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Steps</div>
                    {recipe.instructions?.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(14,165,233,0.15)', color: '#38bdf8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700
                        }}>{i + 1}</div>
                        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{step}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
