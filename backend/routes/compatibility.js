/**
 * Food Compatibility Check Routes
 * Rules-based compatibility checking between food items
 */

const express = require('express');
const router  = express.Router();
const FoodItem = require('../models/FoodItem');

// ─── Compatibility Rules Database ────────────────────────────────────────────
// Each rule: { items[], compatible: bool, reason, tip }
const COMPATIBILITY_RULES = [
  {
    items: ['apple', 'banana', 'avocado'],
    compatible: false,
    reason: 'Apples emit ethylene gas that accelerates ripening/decay of bananas and avocados',
    tip: 'Store apples separately in a sealed bag or different drawer'
  },
  {
    items: ['milk', 'fish', 'seafood'],
    compatible: false,
    reason: 'Raw fish can contaminate dairy products with bacteria and strong odors',
    tip: 'Store fish on the bottom shelf in sealed containers, dairy on upper shelves'
  },
  {
    items: ['onion', 'potato'],
    compatible: false,
    reason: 'Onions emit gases that cause potatoes to sprout faster',
    tip: 'Store onions and potatoes in separate cool, dry locations outside fridge'
  },
  {
    items: ['strawberry', 'melon', 'watermelon'],
    compatible: false,
    reason: 'Melons release ethylene that accelerates strawberry decay',
    tip: 'Keep melons sealed and away from strawberries'
  },
  {
    items: ['butter', 'cheese'],
    compatible: true,
    reason: 'Both dairy products store well together in the same temperature range',
    tip: 'Keep both in the dairy drawer for optimal freshness'
  },
  {
    items: ['carrot', 'celery', 'cucumber'],
    compatible: true,
    reason: 'These vegetables have similar humidity requirements and do not interfere with each other',
    tip: 'Store together in the crisper drawer with high humidity setting'
  },
  {
    items: ['chicken', 'beef', 'pork'],
    compatible: true,
    reason: 'Raw meats can be stored together on the lowest shelf, safely separated from other foods',
    tip: 'Keep in sealed containers on the bottom shelf to prevent drip contamination'
  },
  {
    items: ['yogurt', 'milk'],
    compatible: true,
    reason: 'Both are dairy and store well in similar conditions',
    tip: 'Store together in the main compartment at 2-4°C'
  }
];

// GET /api/compatibility-check — Check compatibility of items in fridge
router.get('/', async (req, res) => {
  try {
    const { items } = req.query; // comma-separated item names
    const itemNames = items ? items.split(',').map(i => i.trim().toLowerCase()) : null;

    // Get current fridge items if no specific items passed
    let fridgeItems;
    if (itemNames) {
      fridgeItems = itemNames;
    } else {
      const dbItems = await FoodItem.find({ status: { $ne: 'expired' } }).select('name');
      fridgeItems = dbItems.map(i => i.name.toLowerCase());
    }

    const issues   = [];
    const okPairs  = [];
    const warnings = [];

    // Check each compatibility rule against current items
    for (const rule of COMPATIBILITY_RULES) {
      const matchedItems = rule.items.filter(ruleItem =>
        fridgeItems.some(fi => fi.includes(ruleItem) || ruleItem.includes(fi))
      );

      if (matchedItems.length >= 2) {
        const result = {
          items:      matchedItems,
          compatible: rule.compatible,
          reason:     rule.reason,
          tip:        rule.tip
        };

        if (!rule.compatible) {
          issues.push(result);
        } else {
          okPairs.push(result);
        }
      }
    }

    // General warnings based on item count
    if (fridgeItems.length > 20) {
      warnings.push({
        type: 'overcrowding',
        message: 'Fridge appears overfull — reduced airflow can affect all item freshness',
        tip: 'Remove expired items and reorganize for 75% max capacity'
      });
    }

    res.json({
      success: true,
      itemsChecked: fridgeItems.length,
      compatibilityScore: Math.max(0, 100 - issues.length * 15),
      issues,
      compatiblePairs: okPairs,
      warnings,
      summary: issues.length === 0
        ? '✅ All items are stored compatibly!'
        : `⚠️ Found ${issues.length} compatibility issue(s) to address`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/compatibility-check — Check specific items list
router.post('/', async (req, res) => {
  try {
    const { items } = req.body; // array of item names
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'items array required' });
    }

    const itemNames = items.map(i => i.toLowerCase());
    const issues = [];
    const okPairs = [];

    for (const rule of COMPATIBILITY_RULES) {
      const matched = rule.items.filter(r =>
        itemNames.some(i => i.includes(r) || r.includes(i))
      );
      if (matched.length >= 2) {
        (rule.compatible ? okPairs : issues).push({
          items: matched, compatible: rule.compatible,
          reason: rule.reason, tip: rule.tip
        });
      }
    }

    res.json({
      success: true,
      compatibilityScore: Math.max(0, 100 - issues.length * 15),
      issues, compatiblePairs: okPairs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
