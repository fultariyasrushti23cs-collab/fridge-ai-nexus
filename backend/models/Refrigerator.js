/**
 * Refrigerator Model
 * Represents the smart refrigerator unit with sensor data
 */

const mongoose = require('mongoose');

const RefrigeratorSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'My FridgeAI Nexus'
  },
  model: {
    type: String,
    default: 'FridgeAI Pro X1'
  },
  // Current temperature readings
  temperature: {
    main: { type: Number, default: 4 },    // Celsius
    freezer: { type: Number, default: -18 },
    crisper: { type: Number, default: 2 }
  },
  // Target temperature settings
  targetTemperature: {
    main: { type: Number, default: 4 },
    freezer: { type: Number, default: -18 }
  },
  humidity: {
    type: Number,
    default: 45, // percentage
    min: 0,
    max: 100
  },
  // Energy consumption in kWh
  energyConsumption: {
    current: { type: Number, default: 1.2 },
    daily: { type: Number, default: 1.5 },
    monthly: { type: Number, default: 45 }
  },
  energyMode: {
    type: String,
    enum: ['eco', 'normal', 'boost'],
    default: 'normal'
  },
  // Door status
  doorStatus: {
    main: { type: Boolean, default: false },   // false = closed
    freezer: { type: Boolean, default: false }
  },
  // Capacity
  capacity: {
    total: { type: Number, default: 450 },     // liters
    used: { type: Number, default: 180 }
  },
  // Filter status
  waterFilter: {
    lastChanged: { type: Date, default: Date.now },
    nextChange: { type: Date }
  },
  // Alert settings
  alerts: {
    temperatureWarning: { type: Boolean, default: true },
    expiryWarning: { type: Boolean, default: true },
    doorOpenWarning: { type: Boolean, default: true },
    lowStockWarning: { type: Boolean, default: true }
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  lastSync: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Refrigerator', RefrigeratorSchema);
