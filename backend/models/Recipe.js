/**
 * Recipe Model
 * Stores recipes that can be recommended based on available ingredients
 */

const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    name: { type: String, required: true },
    amount: { type: String },
    required: { type: Boolean, default: true }
  }],
  instructions: [String],
  prepTime: { type: Number, default: 10 },     // minutes
  cookTime: { type: Number, default: 20 },     // minutes
  servings: { type: Number, default: 2 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
    default: 'dinner'
  },
  nutritionPerServing: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  tags: [String],
  imageUrl: { type: String, default: null },
  // Match score calculated dynamically (not stored)
  rating: { type: Number, default: 4.0, min: 1, max: 5 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', RecipeSchema);

function renderVids(cat) 
{
  const list = cat === 'all' ? VIDEOS : VIDEOS.filter(v => v.cat === cat);
  const catIcons = {breakfast:'🌅',lunch:'☀️',dinner:'🌙',snack:'🍿',sweet:'🍮'};
  document.getElementById('vid-grid').innerHTML = list.map(v => `
    <div class="vid-card" onclick="openVidModal('${v.yt}','${v.t.replace(/'/g,"\\'")}')">
      <div class="vid-thumb">
        <img src="https://img.youtube.com/vi/${v.yt}/mqdefault.jpg" alt="${v.t}"
          loading="lazy" onerror="this.parentElement.innerHTML='<div style=\\'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:36px\\'>${v.e}</div>'">
        <div class="play-mini">▶</div>
        <div class="vid-dur">${v.dur}</div>
      </div>
      <div class="vid-info">
        <div class="vid-title">${v.e} ${v.t}</div>
        <div class="vid-meta">
          ${catIcons[v.cat]||''} ${v.cat} · ${v.cui}
        </div>
      </div>
    </div>`).join('');
}
function filterVids(cat, el) {
  document.querySelectorAll('#vid-tabs .tab-btn').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderVids(cat);
}

function openVidModal(ytId, title) {
  document.getElementById('vid-modal-title').textContent = title || 'Recipe Video';
  document.getElementById('vid-iframe').src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0&modestbranding=1';
  document.getElementById('vid-modal').classList.add('open');
}
function closeVidModal() {
  document.getElementById('vid-modal').classList.remove('open');
  document.getElementById('vid-iframe').src = '';
}
document.getElementById('vid-modal').addEventListener('click', function(e) {
if (e.target === this) closeVidModal();
});

function runCompat() 
{
  const s1 = document.getElementById('c1');
  const s2 = document.getElementById('c2');
  const v1 = s1.value;
  const v2 = s2.value;
  const out = document.getElementById('compat-out');
  if (!v1 || !v2) { out.innerHTML = ''; return; }
  const n1 = s1.options[s1.selectedIndex].dataset.name || s1.options[s1.selectedIndex].text;
  const n2 = s2.options[s2.selectedIndex].dataset.name || s2.options[s2.selectedIndex].text;
  let cls, icon, titleTxt, body;
  if ((v1==='E'&&v2==='S') || (v1==='S'&&v2==='E')) {
    cls='compat-unsafe'; icon='✗'; titleTxt='Do NOT Store Together';
    body=`<strong>${n1}</strong> and <strong>${n2}</strong> must not share the same drawer. Ethylene gas causes shelf life to drop by up to <strong>60%</strong>. Store ethylene producers (apples, bananas, mangoes) in a separate fruit drawer away from all leafy vegetables.`;
  } else if (v1==='P' || v2==='P') {
    cls='compat-warn'; icon='⚠'; titleTxt='Use Dedicated Storage Zones';
    body=`<strong>${n1==='P'?n1:n2}</strong> has a strong odour that can transfer to other foods. Keep it in a sealed container or dedicated zone away from dairy and leafy vegetables.`;
  } else if (v1==='E' && v2==='E') {
    cls='compat-warn'; icon='⚠'; titleTxt='Store With Caution';
    body=`Both <strong>${n1}</strong> and <strong>${n2}</strong> produce ethylene. They won't harm each other but combined ethylene may speed ripening. Use within 2–3 days.`;
  } else {
    cls='compat-safe'; icon='✓'; titleTxt='Safe to Store Together';
    body=`<strong>${n1}</strong> and <strong>${n2}</strong> are compatible — both are ethylene-neutral or have similar storage requirements. They can safely share the same fridge zone without affecting each other's freshness.`;
  }
  const color = cls==='compat-safe'?'var(--green)':cls==='compat-unsafe'?'var(--red)':'var(--yellow)';
  out.innerHTML = `<div class="compat-result ${cls}"><div class="compat-rtitle" style="color:${color}">${icon} ${titleTxt}</div><div class="compat-rbody">${body}</div></div>`;
}

