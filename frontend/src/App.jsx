/**
 * FridgeAI Nexus — Root Application
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FoodItems from './pages/FoodItems';
import Recipes from './pages/Recipes';
import GroceryAlerts from './pages/GroceryAlerts';
import Settings from './pages/Settings';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        {/* Ambient glow orbs */}
        <div className="glow-orb w-96 h-96 bg-blue-500" style={{ top: '-10%', left: '-5%' }} />
        <div className="glow-orb w-80 h-80 bg-cyan-500"  style={{ bottom: '10%', right: '5%' }} />

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif'
            }
          }}
        />

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard />} />
            <Route path="food-items"     element={<FoodItems />} />
            <Route path="recipes"        element={<Recipes />} />
            <Route path="grocery-alerts" element={<GroceryAlerts />} />
            <Route path="settings"       element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
