/**
 * GroceryAlert Model
 * Tracks grocery items that need to be purchased
 */

const mongoose = require('mongoose');

const GroceryAlertSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['dairy', 'meat', 'vegetables', 'fruits', 'beverages', 'condiments', 'other'],
    default: 'other'
  },
  reason: {
    type: String,
    enum: ['out-of-stock', 'expiring-soon', 'low-quantity', 'manual'],
    default: 'manual'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  suggestedQuantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: 'pieces'
  },
  status: {
    type: String,
    enum: ['pending', 'bought', 'dismissed'],
    default: 'pending'
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  store: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  // Auto-generated alerts link back to food item
  relatedFoodItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GroceryAlert', GroceryAlertSchema);
