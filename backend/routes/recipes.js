/**
 * Recipe Routes
 * NLP-inspired ingredient matching for recipe recommendations
 */

const express = require('express');
const router  = express.Router();
const Recipe  = require('../models/Recipe');
const FoodItem = require('../models/FoodItem');

// GET /api/recipes — Get all recipes, optionally matched against available items
router.get('/', async (req, res) => {
  try {
    const { match } = req.query; // ?match=true to get AI-matched recipes

    const recipes = await Recipe.find({}).sort({ rating: -1 });

    if (match === 'true') {
      // Get all available (non-expired) food items
      const availableItems = await FoodItem.find({ status: { $ne: 'expired' } });
      const availableNames = availableItems.map(i => i.name.toLowerCase());

      // NLP-style: score recipes by ingredient overlap (Jaccard similarity)
      const scored = recipes.map(recipe => {
        const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
        const requiredIngredients = recipe.ingredients
          .filter(i => i.required)
          .map(i => i.name.toLowerCase());

        // How many required ingredients are available?
        const matchedRequired = requiredIngredients.filter(ing =>
          availableNames.some(avail => avail.includes(ing) || ing.includes(avail))
        );

        const matchedAll = recipeIngredients.filter(ing =>
          availableNames.some(avail => avail.includes(ing) || ing.includes(avail))
        );

        const matchScore = requiredIngredients.length > 0
          ? Math.round((matchedRequired.length / requiredIngredients.length) * 100)
          : 0;

        const canMake = matchedRequired.length === requiredIngredients.length;

        // Missing ingredients
        const missing = requiredIngredients
          .filter(ing => !availableNames.some(a => a.includes(ing) || ing.includes(a)));

        return {
          ...recipe.toJSON(),
          matchScore,
          canMake,
          matchedIngredients: matchedAll.length,
          totalIngredients:   recipeIngredients.length,
          missingIngredients: missing
        };
      });

      // Sort: can-make first, then by match score
      scored.sort((a, b) => {
        if (a.canMake && !b.canMake) return -1;
        if (!a.canMake && b.canMake) return 1;
        return b.matchScore - a.matchScore;
      });

      return res.json({ success: true, count: scored.length, data: scored });
    }

    res.json({ success: true, count: recipes.length, data: recipes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/recipes/:id — Single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, error: 'Recipe not found' });
    res.json({ success: true, data: recipe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/recipes — Add recipe
router.post('/', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json({ success: true, data: recipe });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
