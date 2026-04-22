/**
 * AI Routes — Simulated ML/AI Modules
 * Simulates: YOLO food detection, freshness prediction, NLP recipe matching
 */

const express = require('express');
const router  = express.Router();
const FoodItem = require('../models/FoodItem');

// ─── Simulated Food Database (for AI detection) ───────────────────────────────
const FOOD_DETECTION_DB = [
  { name: 'Apple',       category: 'fruits',      avgShelfDays: 14, confidence: 0.94 },
  { name: 'Milk',        category: 'dairy',       avgShelfDays: 7,  confidence: 0.97 },
  { name: 'Eggs',        category: 'dairy',       avgShelfDays: 21, confidence: 0.96 },
  { name: 'Carrot',      category: 'vegetables',  avgShelfDays: 21, confidence: 0.91 },
  { name: 'Chicken',     category: 'meat',        avgShelfDays: 3,  confidence: 0.89 },
  { name: 'Yogurt',      category: 'dairy',       avgShelfDays: 14, confidence: 0.93 },
  { name: 'Orange Juice',category: 'beverages',   avgShelfDays: 10, confidence: 0.88 },
  { name: 'Cheese',      category: 'dairy',       avgShelfDays: 30, confidence: 0.92 },
  { name: 'Tomato',      category: 'vegetables',  avgShelfDays: 7,  confidence: 0.90 },
  { name: 'Lettuce',     category: 'vegetables',  avgShelfDays: 7,  confidence: 0.87 },
  { name: 'Beef',        category: 'meat',        avgShelfDays: 4,  confidence: 0.85 },
  { name: 'Butter',      category: 'dairy',       avgShelfDays: 90, confidence: 0.95 },
  { name: 'Strawberry',  category: 'fruits',      avgShelfDays: 5,  confidence: 0.92 },
  { name: 'Broccoli',    category: 'vegetables',  avgShelfDays: 5,  confidence: 0.88 },
  { name: 'Lemon',       category: 'fruits',      avgShelfDays: 21, confidence: 0.91 }
];

// POST /api/ai/detect-items — Simulates YOLO/CNN food detection from image
router.post('/detect-items', async (req, res) => {
  try {
    const { imageData } = req.body; // base64 image (simulated)

    // Simulate processing delay (like a real ML model would have)
    await new Promise(r => setTimeout(r, 800));

    // Simulate detecting 2-5 random items (as a real YOLO model would)
    const shuffled = [...FOOD_DETECTION_DB].sort(() => Math.random() - 0.5);
    const detectedCount = Math.floor(Math.random() * 4) + 2;
    const detected = shuffled.slice(0, detectedCount);

    const results = detected.map(food => {
      const addedDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + food.avgShelfDays);

      return {
        name:         food.name,
        category:     food.category,
        confidence:   (food.confidence + (Math.random() * 0.05 - 0.025)).toFixed(2),
        suggestedExpiry: expiryDate.toISOString().split('T')[0],
        avgShelfLife: `${food.avgShelfDays} days`,
        boundingBox: {
          x: Math.floor(Math.random() * 400),
          y: Math.floor(Math.random() * 300),
          width:  Math.floor(Math.random() * 100) + 80,
          height: Math.floor(Math.random() * 100) + 80
        }
      };
    });

    res.json({
      success: true,
      message: `Detected ${results.length} food items`,
      model:   'FridgeAI-YOLO-v3 (simulated)',
      processingTime: '0.8s',
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ai/freshness-prediction — Predict freshness trends
router.get('/freshness-prediction', async (req, res) => {
  try {
    const items = await FoodItem.find({});

    const predictions = items.map(item => {
      const now        = new Date();
      const daysLeft   = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
      const degradeRate = item.category === 'meat' ? 15 : item.category === 'dairy' ? 10 : 7;

      // Simulate ML freshness score with slight random variance
      const mlScore = Math.max(0, Math.min(100,
        item.freshnessScore + (Math.random() * 4 - 2)
      )).toFixed(1);

      return {
        id:             item._id,
        name:           item.name,
        currentFreshness: Number(mlScore),
        daysUntilExpiry: daysLeft,
        degradationRate: `${degradeRate}% per day`,
        predictedStatusIn3Days: daysLeft <= 3 ? 'expired' : daysLeft <= 6 ? 'critical' : 'good',
        recommendation: daysLeft <= 2 ? 'Use immediately or discard'
          : daysLeft <= 5 ? 'Use within the next few days'
          : 'Properly stored, will remain fresh'
      };
    });

    res.json({ success: true, data: predictions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ai/energy-optimization — Smart energy usage recommendations
router.get('/energy-optimization', async (req, res) => {
  try {
    const itemCount = await FoodItem.countDocuments();
    const hour = new Date().getHours();
    const isPeakHour = hour >= 8 && hour <= 22;

    const tips = [
      {
        id: 1,
        type: 'temperature',
        suggestion: 'Raise freezer temp by 1°C during night hours',
        potentialSaving: '8% energy reduction',
        impact: 'low'
      },
      {
        id: 2,
        type: 'organization',
        suggestion: `You have ${itemCount} items — optimal is 75% capacity for airflow`,
        potentialSaving: '5% energy reduction',
        impact: 'medium'
      },
      {
        id: 3,
        type: 'schedule',
        suggestion: isPeakHour ? 'Switch to Eco mode during off-peak hours (10PM-6AM)' : 'Great! Operating in off-peak hours',
        potentialSaving: '12% energy reduction',
        impact: 'high'
      },
      {
        id: 4,
        type: 'maintenance',
        suggestion: 'Clean condenser coils — estimated 15% efficiency loss detected',
        potentialSaving: '15% energy reduction',
        impact: 'high'
      }
    ];

    res.json({
      success: true,
      currentUsage: { daily: '1.5 kWh', monthly: '45 kWh', cost: '₹135/month' },
      optimizedUsage: { daily: '1.1 kWh', monthly: '33 kWh', cost: '₹99/month' },
      potentialSavings: '26%',
      tips
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
