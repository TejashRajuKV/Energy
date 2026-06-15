# GhostLoad 👻⚡

**GhostLoad** is an intelligent, zero-hardware energy estimation engine that helps commercial spaces uncover and eliminate hidden after-hours energy waste (the "Ghost Load"). 

Designed for facility managers, GhostLoad provides actionable insights in under 8 minutes without requiring expensive IoT sensors or sub-metering hardware. By analyzing basic utility bills and high-level office heuristics, GhostLoad visualizes where power is bleeding overnight and provides a prioritized "Kill List" of actions to capture immediate ROI.

---

## 🌟 Key Features

* **Instant Estimation Engine**: Upload your utility bill and basic office dimensions. Our heuristic math model estimates your baseline load vs. after-hours ghost load.
* **24-Hour Load Curve Visualization**: A beautiful interactive chart that maps standard operational base load against wasted after-hours load, making the problem undeniably visible.
* **Ranked Action Kill List**: It doesn't just show you what's wrong; it tells you how to fix it. Recommendations are prioritized by ROI (estimated savings ÷ effort).
* **Category Breakdown**: Understand exactly which systems (HVAC, Compute, Lighting, Network, Kitchen, Misc) are contributing most to the waste.
* **Scenario Simulator**: An interactive slider interface that lets you instantly see how changing variables (like shifting office hours or shutting down AC earlier) impacts your projected bill.
* **Multi-Site Comparison**: Manage an entire portfolio of offices. View a visual leaderboard to instantly identify which location is bleeding the most energy and requires immediate intervention.
* **Confidence Score & Assumptions Panel**: Full transparency. The engine shows you exactly how confident it is in its estimates based on the data you provided, and lists every heuristic assumption it used to reach its conclusions.
* **One-Click Export**: Easily export your analysis to a formatted PDF or CSV to share with executives or sustainability teams.

---

## 🛠️ Technology Stack

GhostLoad is built as a modern, high-performance monorepo utilizing the following stack:

### Frontend (`/ghostload-frontend`)
* **Framework**: React 19 (via Vite)
* **Routing**: React Router DOM v7
* **State Management**: Zustand
* **Styling**: Pure CSS with CSS Variables & modern glassmorphism UI
* **Animations**: Framer Motion
* **Charts & Data Viz**: Recharts
* **Icons**: Lucide React
* **Forms & Validation**: React Hook Form + Zod
* **PDF Export**: react-to-print

### Backend (`/ghostload-backend`)
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: PostgreSQL
* **ORM**: Prisma
* **Authentication**: JWT (JSON Web Tokens) with secure cookie/local-storage handling
* **Architecture**: RESTful API design with dedicated controller and routing layers

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* PostgreSQL database

### 1. Backend Setup
Navigate to the backend directory:
```bash
cd ghostload-backend
```
Install dependencies:
```bash
npm install
```
Set up your `.env` file with your Database URL and JWT Secret:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ghostload?schema=public"
JWT_SECRET="your-super-secret-key"
PORT=5000
```
Run database migrations to initialize the schema:
```bash
npx prisma migrate dev
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd ghostload-frontend
```
Install dependencies:
```bash
npm install
```
Set up your `.env` file to point to your local backend:
```env
VITE_API_URL="http://localhost:5000"
```
Start the frontend development server:
```bash
npm run dev
```

The app will now be running at `http://localhost:5173`. 

---

## 💡 How It Works (The Estimation Model)

GhostLoad avoids "black-box AI" in favor of a transparent, math-based heuristic engine. 

1. **The Baseline**: It takes your total utility bill and region's average tariff rate to calculate total kWh.
2. **The Schedule**: It uses your stated office hours to calculate "Operational Hours" vs. "Unoccupied Hours".
3. **The Split**: Based on the industry average that ~30% of commercial energy is consumed while the building is empty, it models an hourly distribution.
4. **The Breakdown**: It allocates the Ghost Load across standard categories (e.g., HVAC usually accounts for 40% of after-hours load if left on schedule, whereas compute and lighting scale differently).
5. **The Confidence**: The more exact data you provide (precise kWh, specific equipment lists), the higher the engine's confidence score scales.

---

## 📄 License
© 2026 GhostLoad. Estimated insights, real savings.
