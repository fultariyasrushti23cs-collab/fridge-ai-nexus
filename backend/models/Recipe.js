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
