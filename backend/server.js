/**
 * FridgeAI Nexus - Main Server Entry Point
 * Express.js backend with MongoDB integration
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
const foodItemRoutes     = require('./routes/foodItems');
const recipeRoutes       = require('./routes/recipes');
const groceryRoutes      = require('./routes/grocery');
const compatibilityRoutes = require('./routes/compatibility');
const refrigeratorRoutes = require('./routes/refrigerator');
const aiRoutes           = require('./routes/ai');

app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/food-items',    foodItemRoutes);
app.use('/api/recipes',       recipeRoutes);
app.use('/api/grocery-alerts', groceryRoutes);
app.use('/api/compatibility-check', compatibilityRoutes);
app.use('/api/refrigerator',  refrigeratorRoutes);
app.use('/api/ai',            aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FridgeAI Nexus API is running', timestamp: new Date() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fridgeai_nexus')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 FridgeAI Nexus server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Starting server without database (demo mode)...');
    app.listen(PORT, () => {
      console.log(`🚀 FridgeAI Nexus server running on http://localhost:${PORT} (demo mode)`);
    });
  });

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
