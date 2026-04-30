/**
 * FridgeAI Nexus - Database Seeder
 * Run with: npm run seed
 * Seeds MongoDB with sample data for development
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const FoodItem = require('../models/FoodItem');
const Recipe = require('../models/Recipe');
const GroceryAlert = require('../models/GroceryAlert');
const Refrigerator = require('../models/Refrigerator');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fridgeai_nexus';

// ─── Sample Food Items ────────────────────────────────────────────────────────
const foodItems = [
  {
    name: 'Whole Milk', category: 'dairy', quantity: 2, unit: 'liters',
    addedDate: new Date(Date.now() - 5 * 86400000),
    expiryDate: new Date(Date.now() + 4 * 86400000),
    storageLocation: 'door', detectedBy: 'manual',
    nutritionInfo: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 }
  },
  {
    name: 'Eggs', category: 'dairy', quantity: 12, unit: 'pieces',
    addedDate: new Date(Date.now() - 3 * 86400000),
    expiryDate: new Date(Date.now() + 18 * 86400000),
    storageLocation: 'door', detectedBy: 'ai-detection',
    nutritionInfo: { calories: 155, protein: 13, carbs: 1.1, fat: 11 }
  },
  {
    name: 'Chicken Breast', category: 'meat', quantity: 500, unit: 'g',
    addedDate: new Date(Date.now() - 1 * 86400000),
    expiryDate: new Date(Date.now() + 1 * 86400000),
    storageLocation: 'main-shelf', detectedBy: 'manual',
    tags: ['protein', 'lean']
  },
  {
    name: 'Cheddar Cheese', category: 'dairy', quantity: 250, unit: 'g',
    addedDate: new Date(Date.now() - 7 * 86400000),
    expiryDate: new Date(Date.now() + 23 * 86400000),
    storageLocation: 'dairy-drawer', detectedBy: 'manual'
  },
  {
    name: 'Carrot', category: 'vegetables', quantity: 6, unit: 'pieces',
    addedDate: new Date(Date.now() - 4 * 86400000),
    expiryDate: new Date(Date.now() + 17 * 86400000),
    storageLocation: 'crisper', detectedBy: 'ai-detection'
  },
  {
    name: 'Spinach', category: 'vegetables', quantity: 200, unit: 'g',
    addedDate: new Date(Date.now() - 6 * 86400000),
    expiryDate: new Date(Date.now() - 1 * 86400000), // EXPIRED
    storageLocation: 'crisper', detectedBy: 'manual'
  },
  {
    name: 'Apple', category: 'fruits', quantity: 5, unit: 'pieces',
    addedDate: new Date(Date.now() - 3 * 86400000),
    expiryDate: new Date(Date.now() + 11 * 86400000),
    storageLocation: 'crisper', detectedBy: 'ai-detection',
    nutritionInfo: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 }
  },
  {
    name: 'Orange Juice', category: 'beverages', quantity: 1, unit: 'liters',
    addedDate: new Date(Date.now() - 2 * 86400000),
    expiryDate: new Date(Date.now() + 8 * 86400000),
    storageLocation: 'door', detectedBy: 'manual'
  },
  {
    name: 'Greek Yogurt', category: 'dairy', quantity: 3, unit: 'pieces',
    addedDate: new Date(Date.now() - 1 * 86400000),
    expiryDate: new Date(Date.now() + 13 * 86400000),
    storageLocation: 'main-shelf', detectedBy: 'ai-detection',
    nutritionInfo: { calories: 100, protein: 17, carbs: 6, fat: 0.7 }
  },
  {
    name: 'Tomato', category: 'vegetables', quantity: 4, unit: 'pieces',
    addedDate: new Date(Date.now() - 2 * 86400000),
    expiryDate: new Date(Date.now() + 5 * 86400000),
    storageLocation: 'crisper', detectedBy: 'ai-detection'
  },
  {
    name: 'Butter', category: 'dairy', quantity: 250, unit: 'g',
    addedDate: new Date(Date.now() - 14 * 86400000),
    expiryDate: new Date(Date.now() + 76 * 86400000),
    storageLocation: 'door', detectedBy: 'manual'
  },
  {
    name: 'Strawberry', category: 'fruits', quantity: 300, unit: 'g',
    addedDate: new Date(),
    expiryDate: new Date(Date.now() + 2 * 86400000),
    storageLocation: 'crisper', detectedBy: 'ai-detection',
    tags: ['antioxidant', 'vitamin-c']
  }
];

// ─── Sample Recipes ────────────────────────────────────────────────────────────
const recipes = [
  {
    name: 'Classic Omelette',
    description: 'Fluffy eggs with cheese and fresh vegetables — a perfect breakfast',
    ingredients: [
      { name: 'Eggs', amount: '3 pieces', required: true },
      { name: 'Butter', amount: '1 tbsp', required: true },
      { name: 'Cheddar Cheese', amount: '30g', required: false },
      { name: 'Tomato', amount: '1 piece', required: false }
    ],
    instructions: [
      'Beat eggs in a bowl until smooth', 'Melt butter in a non-stick pan',
      'Pour eggs, tilt pan to spread evenly', 'Add cheese and tomato slices',
      'Fold and serve immediately'
    ],
    prepTime: 5, cookTime: 10, servings: 1,
    difficulty: 'easy', category: 'breakfast',
    nutritionPerServing: { calories: 320, protein: 22, carbs: 3, fat: 24 },
    tags: ['quick', 'protein-rich', 'vegetarian'], rating: 4.5, youtubeUrl: 'https://youtube.com/shorts/mvqHJK6NMxs?si=oB9islx8pT9oHRK_'
  },
  {
    name: 'Chicken Salad',
    description: 'Light and healthy grilled chicken with fresh vegetables',
    ingredients: [
      { name: 'Chicken Breast', amount: '200g', required: true },
      { name: 'Carrot', amount: '2 pieces', required: true },
      { name: 'Tomato', amount: '2 pieces', required: false },
      { name: 'Spinach', amount: '100g', required: false }
    ],
    instructions: [
      'Grill chicken until cooked through', 'Slice chicken into strips',
      'Chop vegetables', 'Combine and dress with olive oil and lemon'
    ],
    prepTime: 10, cookTime: 20, servings: 2,
    difficulty: 'easy', category: 'lunch',
    nutritionPerServing: { calories: 280, protein: 36, carbs: 8, fat: 10 },
    tags: ['healthy', 'high-protein', 'gluten-free'], rating: 4.3, youtubeUrl: 'https://youtube.com/shorts/bi3MzHfCTFQ?si=cF29UIsNTW7-H1AW'
  },
  {
    name: 'Strawberry Smoothie',
    description: 'Refreshing strawberry and yogurt smoothie packed with vitamins',
    ingredients: [
      { name: 'Strawberry', amount: '150g', required: true },
      { name: 'Greek Yogurt', amount: '1 cup', required: true },
      { name: 'Whole Milk', amount: '100ml', required: false }
    ],
    instructions: [
      'Wash and hull strawberries', 'Blend all ingredients until smooth',
      'Adjust consistency with milk', 'Serve chilled'
    ],
    prepTime: 5, cookTime: 0, servings: 1,
    difficulty: 'easy', category: 'breakfast',
    nutritionPerServing: { calories: 180, protein: 12, carbs: 22, fat: 3 },
    tags: ['smoothie', 'quick', 'vitamin-c'], rating: 4.8, youtubeUrl: 'https://youtube.com/shorts/yH2EigcECpc?si=xPOCzQ-GnT3ZuY6g'
  },
  {
    name: 'Cheese Omelette Wrap',
    description: 'Hearty cheese-filled egg wrap with vegetables',
    ingredients: [
      { name: 'Eggs', amount: '4 pieces', required: true },
      { name: 'Cheddar Cheese', amount: '60g', required: true },
      { name: 'Butter', amount: '2 tbsp', required: true },
      { name: 'Tomato', amount: '1 piece', required: false },
      { name: 'Spinach', amount: '50g', required: false }
    ],
    instructions: [
      'Beat eggs', 'Cook eggs flat in buttered pan',
      'Add cheese and veggies', 'Roll into wrap shape'
    ],
    prepTime: 5, cookTime: 12, servings: 2,
    difficulty: 'easy', category: 'breakfast',
    nutritionPerServing: { calories: 380, protein: 25, carbs: 4, fat: 30 },
    rating: 4.2, youtubeUrl: 'https://youtube.com/shorts/9Pig4q0CCsA?si=z9l2sEgZopgzrG9h'
  },
  {
    name: 'Carrot Yogurt Dip',
    description: 'Simple healthy snack with carrot sticks and seasoned yogurt',
    ingredients: [
      { name: 'Carrot', amount: '4 pieces', required: true },
      { name: 'Greek Yogurt', amount: '1 cup', required: true }
    ],
    instructions: [
      'Peel and cut carrots into sticks', 'Mix yogurt with herbs',
      'Serve together as snack'
    ],
    prepTime: 5, cookTime: 0, servings: 2,
    difficulty: 'easy', category: 'snack',
    nutritionPerServing: { calories: 120, protein: 8, carbs: 14, fat: 2 },
    rating: 4.0, youtubeUrl: 'https://youtube.com/shorts/YHUL2d_AwAc?si=LgS8DyxhtsXt3_V5'
  }
];

// ─── Sample Grocery Alerts ────────────────────────────────────────────────────
const groceryAlerts = [
  {
    itemName: 'Bread', category: 'other', reason: 'out-of-stock',
    priority: 'high', suggestedQuantity: 1, unit: 'packs',
    estimatedCost: 45, store: 'Local Supermarket'
  },
  {
    itemName: 'Onion', category: 'vegetables', reason: 'out-of-stock',
    priority: 'medium', suggestedQuantity: 4, unit: 'pieces', estimatedCost: 20
  },
  {
    itemName: 'Chicken', category: 'meat', reason: 'low-quantity',
    priority: 'medium', suggestedQuantity: 500, unit: 'g', estimatedCost: 120
  }
];

// ─── Seed Function ─────────────────────────────────────────────────────────────
async function seed() {
  try {
    // await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await FoodItem.deleteMany({});
    await Recipe.deleteMany({});
    await GroceryAlert.deleteMany({});
    await Refrigerator.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed food items
    await FoodItem.insertMany(foodItems);
    console.log(`🥗 Seeded ${foodItems.length} food items`);

    // Seed recipes
    await Recipe.insertMany(recipes);
    console.log(`📖 Seeded ${recipes.length} recipes`);

    // Seed grocery alerts
    await GroceryAlert.insertMany(groceryAlerts);
    console.log(`🛒 Seeded ${groceryAlerts.length} grocery alerts`);

    // Create default refrigerator
    await Refrigerator.create({
      name: 'FridgeAI Nexus Pro',
      model: 'FX-2024-Smart',
      energyMode: 'normal'
    });
    console.log('🌡️  Created refrigerator profile');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

module.exports = seed;
