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