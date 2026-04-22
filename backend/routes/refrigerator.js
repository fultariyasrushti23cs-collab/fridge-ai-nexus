/**
 * Refrigerator Routes
 * Manage refrigerator settings, temperature, energy mode
 */

const express = require('express');
const router  = express.Router();
const Refrigerator = require('../models/Refrigerator');

// GET /api/refrigerator — Get refrigerator status
router.get('/', async (req, res) => {
  try {
    let fridge = await Refrigerator.findOne();

    // Create default if none exists
    if (!fridge) {
      fridge = await Refrigerator.create({});
    }

    // Simulate slight temperature fluctuation (real sensor behavior)
    fridge.temperature.main    = parseFloat((fridge.temperature.main    + (Math.random() * 0.4 - 0.2)).toFixed(1));
    fridge.temperature.freezer = parseFloat((fridge.temperature.freezer + (Math.random() * 0.4 - 0.2)).toFixed(1));
    fridge.lastSync = new Date();
    await fridge.save();

    res.json({ success: true, data: fridge });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/refrigerator — Update refrigerator settings
router.put('/', async (req, res) => {
  try {
    let fridge = await Refrigerator.findOne();
    if (!fridge) fridge = new Refrigerator();

    Object.assign(fridge, req.body);
    fridge.lastSync = new Date();
    await fridge.save();

    res.json({ success: true, data: fridge, message: 'Settings updated' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/refrigerator/energy-mode — Toggle energy mode
router.put('/energy-mode', async (req, res) => {
  try {
    const { mode } = req.body;
    if (!['eco', 'normal', 'boost'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'Invalid mode. Use: eco, normal, boost' });
    }

    let fridge = await Refrigerator.findOne();
    if (!fridge) fridge = new Refrigerator();

    fridge.energyMode = mode;

    // Adjust temperatures based on mode
    if (mode === 'eco') {
      fridge.targetTemperature.main    = 5;
      fridge.targetTemperature.freezer = -16;
    } else if (mode === 'boost') {
      fridge.targetTemperature.main    = 2;
      fridge.targetTemperature.freezer = -20;
    } else {
      fridge.targetTemperature.main    = 4;
      fridge.targetTemperature.freezer = -18;
    }

    await fridge.save();
    res.json({ success: true, data: fridge, message: `Energy mode set to ${mode}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
