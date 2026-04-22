/**
 * FoodItem Model
 * Represents individual food items tracked in the refrigerator
 */

const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['dairy', 'meat', 'vegetables', 'fruits', 'beverages', 'condiments', 'leftovers', 'other'],
    default: 'other'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'pieces',
    enum: ['pieces', 'kg', 'g', 'liters', 'ml', 'bottles', 'packs', 'boxes']
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  // Freshness score: 100 = fresh, 0 = expired
  freshnessScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['fresh', 'good', 'expiring-soon', 'expired'],
    default: 'fresh'
  },
  storageLocation: {
    type: String,
    enum: ['main-shelf', 'crisper', 'door', 'freezer', 'dairy-drawer'],
    default: 'main-shelf'
  },
  nutritionInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  imageUrl: {
    type: String,
    default: null
  },
  detectedBy: {
    type: String,
    enum: ['manual', 'ai-detection'],
    default: 'manual'
  },
  tags: [String]
}, {
  timestamps: true
});

// ─── Virtual: Days Until Expiry ───────────────────────────────────────────────
FoodItemSchema.virtual('daysUntilExpiry').get(function () {
  const now = new Date();
  const diff = this.expiryDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// ─── Pre-save: Auto-calculate freshness & status ──────────────────────────────
FoodItemSchema.pre('save', function (next) {
  const now = new Date();
  const totalLife = this.expiryDate - this.addedDate;
  const remaining = this.expiryDate - now;

  if (remaining <= 0) {
    this.freshnessScore = 0;
    this.status = 'expired';
  } else {
    this.freshnessScore = Math.round((remaining / totalLife) * 100);
    const daysLeft = remaining / (1000 * 60 * 60 * 24);
    if (daysLeft <= 1) this.status = 'expiring-soon';
    else if (daysLeft <= 3) this.status = 'expiring-soon';
    else if (daysLeft <= 7) this.status = 'good';
    else this.status = 'fresh';
  }
  next();
});

FoodItemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('FoodItem', FoodItemSchema);
