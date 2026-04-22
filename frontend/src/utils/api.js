  /**
   * API Utility
   * Centralized axios configuration for all backend calls
   */

  import axios from 'axios';

  const API_BASE = 'https://fridge-ai-nexus.vercel.app/api';

  const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  });

  // ─── Food Items ───────────────────────────────────────────────────────────────
  export const foodItemsAPI = {
    getAll:  (params) => api.get('/food-items', { params }),
    getById: (id)     => api.get(`/food-items/${id}`),
    add:     (data)   => api.post('/food-items/add-item', data),
    update:  (id, d)  => api.put(`/food-items/${id}`, d),
    remove:  (id)     => api.delete(`/food-items/remove-item/${id}`),
    getStats:()       => api.get('/food-items/stats/summary')
  };

  // ─── Recipes ─────────────────────────────────────────────────────────────────
  export const recipesAPI = {
    getAll:   (match) => api.get('/recipes', { params: { match } }),
    getById:  (id)    => api.get(`/recipes/${id}`),
    add:      (data)  => api.post('/recipes', data)
  };

  // ─── Grocery Alerts ───────────────────────────────────────────────────────────
  export const groceryAPI = {
    getAll:   (status) => api.get('/grocery-alerts', { params: { status } }),
    add:      (data)   => api.post('/grocery-alerts', data),
    update:   (id, d)  => api.put(`/grocery-alerts/${id}`, d),
    remove:   (id)     => api.delete(`/grocery-alerts/${id}`)
  };

  // ─── Compatibility ─────────────────────────────────────────────────────────────
  export const compatibilityAPI = {
    check:      ()     => api.get('/compatibility-check'),
    checkItems: (items) => api.post('/compatibility-check', { items })
  };

  // ─── Refrigerator ─────────────────────────────────────────────────────────────
  export const fridgeAPI = {
    get:        ()     => api.get('/refrigerator'),
    update:     (data) => api.put('/refrigerator', data),
    setEnergyMode: (mode) => api.put('/refrigerator/energy-mode', { mode })
  };

  // ─── AI Modules ───────────────────────────────────────────────────────────────
  export const aiAPI = {
    detectItems:         (imageData) => api.post('/ai/detect-items', { imageData }),
    freshnessPrediction: ()          => api.get('/ai/freshness-prediction'),
    energyOptimization:  ()          => api.get('/ai/energy-optimization')
  };

  export default api;
