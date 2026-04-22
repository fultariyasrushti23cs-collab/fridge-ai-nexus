/**
 * AppContext — Global state management for FridgeAI Nexus
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { foodItemsAPI, fridgeAPI, groceryAPI } from '../utils/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [foodItems,   setFoodItems]   = useState([]);
  const [fridge,      setFridge]      = useState(null);
  const [groceryAlerts, setGroceryAlerts] = useState([]);
  const [stats,       setStats]       = useState({ total: 0, fresh: 0, good: 0, expiringSoon: 0, expired: 0 });
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ─── Fetch all food items ──────────────────────────────────────────────────
  const fetchFoodItems = useCallback(async () => {
    try {
      const res = await foodItemsAPI.getAll();
      setFoodItems(res.data.data || []);
    } catch { setFoodItems([]); }
  }, []);

  // ─── Fetch fridge status ───────────────────────────────────────────────────
  const fetchFridge = useCallback(async () => {
    try {
      const res = await fridgeAPI.get();
      setFridge(res.data.data);
    } catch { /* use null */ }
  }, []);

  // ─── Fetch grocery alerts ─────────────────────────────────────────────────
  const fetchGrocery = useCallback(async () => {
    try {
      const res = await groceryAPI.getAll('pending');
      setGroceryAlerts(res.data.data || []);
    } catch { setGroceryAlerts([]); }
  }, []);

  // ─── Compute stats from items ─────────────────────────────────────────────
  useEffect(() => {
    setStats({
      total:        foodItems.length,
      fresh:        foodItems.filter(i => i.status === 'fresh').length,
      good:         foodItems.filter(i => i.status === 'good').length,
      expiringSoon: foodItems.filter(i => i.status === 'expiring-soon').length,
      expired:      foodItems.filter(i => i.status === 'expired').length,
    });
  }, [foodItems]);

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchFoodItems(), fetchFridge(), fetchGrocery()]);
      setLoading(false);
    };
    init();
    // Refresh fridge sensors every 30s
    const interval = setInterval(fetchFridge, 30000);
    return () => clearInterval(interval);
  }, [fetchFoodItems, fetchFridge, fetchGrocery]);

  return (
    <AppContext.Provider value={{
      foodItems, setFoodItems, fetchFoodItems,
      fridge, setFridge, fetchFridge,
      groceryAlerts, setGroceryAlerts, fetchGrocery,
      stats, loading,
      sidebarOpen, setSidebarOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
