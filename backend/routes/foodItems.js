/**
 * Food Items Routes
 * CRUD operations for food items in the refrigerator
 */

const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const GroceryAlert = require('../models/GroceryAlert');

// GET /api/food-items — Retrieve all food items with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, status, location } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    if (location) filter.storageLocation = location;

    const items = await FoodItem.find(filter).sort({ expiryDate: 1 });

    // Recalculate freshness dynamically before returning
    const updatedItems = items.map(item => {
      const obj = item.toJSON();
      const now  = new Date();
      const diff = new Date(item.expiryDate) - now;
      obj.daysUntilExpiry = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return obj;
    });

    res.json({ success: true, count: items.length, data: updatedItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/food-items/:id — Get single food item
router.get('/:id', async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Food item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/food-items/add-item — Add a new food item
router.post('/add-item', async (req, res) => {
  try {
    const item = new FoodItem(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item, message: 'Food item added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/food-items — Also support direct POST
router.post('/', async (req, res) => {
  try {
    const item = new FoodItem(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item, message: 'Food item added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/food-items/:id — Update food item
router.put('/:id', async (req, res) => {
  try {
    const item = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!item) return res.status(404).json({ success: false, error: 'Food item not found' });
    res.json({ success: true, data: item, message: 'Food item updated' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/food-items/remove-item/:id — Remove food item
router.delete('/remove-item/:id', async (req, res) => {
  try {
    const item = await FoodItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Food item not found' });

    // Optionally create a grocery alert for replenishment
    if (item.quantity === 0) {
      await GroceryAlert.create({
        itemName: item.name,
        category: item.category,
        reason: 'out-of-stock',
        priority: 'medium'
      });
    }

    res.json({ success: true, message: `${item.name} removed successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/food-items/:id — Also support direct DELETE
router.delete('/:id', async (req, res) => {
  try {
    const item = await FoodItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Food item not found' });
    res.json({ success: true, message: `${item.name} removed successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/food-items/stats/summary — Dashboard stats
router.get('/stats/summary', async (req, res) => {
  try {
    const total   = await FoodItem.countDocuments();
    const fresh   = await FoodItem.countDocuments({ status: 'fresh' });
    const good    = await FoodItem.countDocuments({ status: 'good' });
    const expiring = await FoodItem.countDocuments({ status: 'expiring-soon' });
    const expired  = await FoodItem.countDocuments({ status: 'expired' });

    res.json({
      success: true,
      data: { total, fresh, good, expiringSoon: expiring, expired }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
