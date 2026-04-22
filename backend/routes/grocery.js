/**
 * Grocery Alert Routes
 * Manages grocery reminders and auto-generated low-stock alerts
 */

const express = require('express');
const router  = express.Router();
const GroceryAlert = require('../models/GroceryAlert');
const FoodItem     = require('../models/FoodItem');

// GET /api/grocery-alerts — Get all grocery alerts + auto-generate from food items
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // Auto-generate alerts for expiring/expired items not yet in grocery list
    const expiring = await FoodItem.find({ status: { $in: ['expiring-soon', 'expired'] } });

    for (const item of expiring) {
      const existing = await GroceryAlert.findOne({
        itemName: item.name,
        status: 'pending',
        reason: { $in: ['expiring-soon', 'out-of-stock'] }
      });
      if (!existing) {
        await GroceryAlert.create({
          itemName:    item.name,
          category:    item.category,
          reason:      item.status === 'expired' ? 'out-of-stock' : 'expiring-soon',
          priority:    item.status === 'expired' ? 'high' : 'medium',
          relatedFoodItemId: item._id,
          suggestedQuantity: item.quantity || 1,
          unit: item.unit || 'pieces'
        });
      }
    }

    const alerts = await GroceryAlert.find(filter)
      .populate('relatedFoodItemId', 'name expiryDate status')
      .sort({ priority: 1, createdAt: -1 });

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/grocery-alerts — Create manual grocery alert
router.post('/', async (req, res) => {
  try {
    const alert = new GroceryAlert({ ...req.body, reason: 'manual' });
    await alert.save();
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/grocery-alerts/:id — Update alert (mark as bought/dismissed)
router.put('/:id', async (req, res) => {
  try {
    const alert = await GroceryAlert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/grocery-alerts/:id
router.delete('/:id', async (req, res) => {
  try {
    await GroceryAlert.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Alert removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
