# ❄️ FridgeAI Nexus — Smart Refrigerator AI System

A full-stack AI-enabled smart refrigerator web app built with **React.js**, **Node.js/Express**, and **MongoDB**, featuring simulated AI modules for food detection, freshness prediction, recipe recommendations, and energy optimization.

---

## 🗂️ Project Structure

```
fridgeai-nexus/
├── backend/
│   ├── models/
│   │   ├── FoodItem.js          # Food item schema (freshness auto-calc)
│   │   ├── Refrigerator.js      # Fridge unit / sensor data schema
│   │   ├── Recipe.js            # Recipe schema
│   │   └── GroceryAlert.js      # Grocery reminder schema
│   ├── routes/
│   │   ├── foodItems.js         # CRUD: /api/food-items
│   │   ├── recipes.js           # NLP matching: /api/recipes
│   │   ├── grocery.js           # Alerts: /api/grocery-alerts
│   │   ├── compatibility.js     # Rules engine: /api/compatibility-check
│   │   ├── refrigerator.js      # Fridge settings: /api/refrigerator
│   │   └── ai.js                # AI modules: /api/ai/*
│   ├── data/
│   │   └── seed.js              # Database seeder (12 items, 5 recipes)
│   ├── server.js                # Express app entry
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Sidebar + navigation shell
│   │   │   └── UI.jsx           # Shared components (badges, modals, cards)
│   │   ├── context/
│   │   │   └── AppContext.jsx   # Global state management
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Stats, charts, temperature, energy
│   │   │   ├── FoodItems.jsx    # Item list, add/remove, AI detection
│   │   │   ├── Recipes.jsx      # Recipe suggestions with NLP matching
│   │   │   ├── GroceryAlerts.jsx # Grocery reminders management
│   │   │   └── Settings.jsx     # Fridge settings and preferences
│   │   ├── utils/
│   │   │   └── api.js           # Axios API client
│   │   ├── App.jsx              # Router setup
│   │   ├── index.js             # React entry
│   │   └── index.css            # Global styles + design system
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                 # Root scripts
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (VS Code)

### Prerequisites

- **Node.js** v18+  ([nodejs.org](https://nodejs.org))
- **MongoDB** running locally ([mongodb.com/try/download/community](https://www.mongodb.com/try/download/community))
- **npm** v9+

> ⚠️ MongoDB must be running on `localhost:27017`.  
> Start it with: `mongod` or via MongoDB Compass.

---

### Step 1 — Install dependencies

Open **two terminals** in VS Code:

**Terminal 1 — Backend:**
```bash
cd fridgeai-nexus/backend
npm install
```

**Terminal 2 — Frontend:**
```bash
cd fridgeai-nexus/frontend
npm install
```

---

### Step 2 — Seed the database

```bash
cd fridgeai-nexus/backend
npm run seed
```

This seeds:
- 12 food items (fresh, expiring, expired)
- 5 recipes with ingredients
- 3 grocery alerts
- 1 refrigerator profile

---

### Step 3 — Start the backend

```bash
cd fridgeai-nexus/backend
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### Step 4 — Start the frontend

```bash
cd fridgeai-nexus/frontend
npm start
```

Frontend opens at: **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food-items` | List all food items |
| POST | `/api/food-items/add-item` | Add new food item |
| DELETE | `/api/food-items/remove-item/:id` | Remove food item |
| GET | `/api/food-items/stats/summary` | Dashboard stats |
| GET | `/api/recipes?match=true` | AI-matched recipes |
| GET | `/api/grocery-alerts` | All grocery alerts |
| POST | `/api/grocery-alerts` | Add grocery reminder |
| PUT | `/api/grocery-alerts/:id` | Update alert status |
| GET | `/api/compatibility-check` | Food compatibility analysis |
| GET | `/api/refrigerator` | Fridge status & sensors |
| PUT | `/api/refrigerator/energy-mode` | Set energy mode |
| POST | `/api/ai/detect-items` | Simulate food detection |
| GET | `/api/ai/freshness-prediction` | ML freshness scores |
| GET | `/api/ai/energy-optimization` | Energy saving tips |
| GET | `/api/health` | Health check |

---

## 🤖 AI Modules (Simulated)

| Module | Simulation |
|--------|-----------|
| **Food Detection** | Simulates YOLO/CNN — returns random items with confidence scores and bounding boxes |
| **Freshness Prediction** | Calculates score from expiry date, adds ML-style variance |
| **Recipe NLP Matching** | Jaccard similarity between available ingredients and recipe requirements |
| **Compatibility Check** | 8 rules-based checks (e.g., apple + banana = ❌ ethylene conflict) |
| **Energy Optimization** | Time-of-day + item count analysis with specific tips |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Fonts | DM Sans (UI) + JetBrains Mono (data) |

---

## 📱 Pages Overview

- **Dashboard** — Stats overview, freshness trend chart, category pie, temperature panel, energy mode controls, expiry alerts
- **Food Items** — Card grid with freshness bars, status badges, category filters, search, add form, AI detection modal
- **Recipes** — AI-matched recipe cards with ingredient overlap scoring, nutrition info, step-by-step instructions, compatibility alerts
- **Grocery Alerts** — Auto-generated + manual reminders with priority badges, cost estimation, bought/dismiss workflow
- **Settings** — Temperature sliders, energy mode, alert toggles, capacity meter, fridge profile

---

## 🛠️ Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running: `mongod --dbpath /data/db`
- Or install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
- The app will start in "demo mode" without DB (limited functionality)

**Port already in use:**
- Backend port: edit `backend/.env` → change `PORT=5001`
- Frontend port: set `PORT=3001` before `npm start`

**Frontend proxy not working:**
- Ensure backend is running before starting frontend
- Check `frontend/package.json` has `"proxy": "http://localhost:5000"`
