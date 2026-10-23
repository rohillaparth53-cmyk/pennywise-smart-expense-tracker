# PennyWise AI — Personal Finance Intelligence Platform

> **"PennyWise doesn't just tell you where your money went. It helps you understand where your money is going next."**

PennyWise AI transforms traditional expense tracking into a polished, futuristic, AI-powered personal finance intelligence platform. It features conversational financial AI, stochastic runway forecasting, gamified savings battles, behavioral spending autopsies, and proactive budget protection.

---

## 🌟 Key Features

### 1. ✦ Ask PennyWise AI (Conversational Copilot)
- **Real-Data Grounded**: Understands your actual recorded transactions, daily burn rate, and runway—never hallucinates or invents fake balances.
- **Interactive Prompts**:
  - *"Where did most of my money go this month?"*
  - *"Why am I spending more than last month?"*
  - *"How much can I safely spend this weekend?"*
  - *"Can I afford something worth ₹3,000?"*
  - *"Which category should I reduce?"*
  - *"Predict my expenses for the next 30 days."*
  - *"How much could I save if I reduce food spending by 20%?"*
- **Hybrid Intelligence Architecture**:
  - Client-side deterministic analytics engine responds with microsecond latency.
  - Optional secure backend endpoint (`/api/chat`) connects with Google Gemini or OpenAI when API keys are configured in `.env`.

### 2. ⌁ Future Wallet Simulator
- **Multi-Horizon Projections**: Live estimates for your balance in 7, 30, and 90 days.
- **Interactive Purchase Check**: Simulate any purchase before buying; instantly view new balance, runway reduction, and safety verdicts (Safe / Caution / High Risk).
- **Pace Shift Scenario Modeling**: Dynamic slider to simulate 0% to 50% spending cuts with interactive dual-trajectory comparison charts.
- **Savings Target Date Estimator**: Computes exact goal achievement dates based on recorded net monthly surplus.

### 3. ⚔️ Financial Boss Battles (Gamification)
- **XP Points & Player Tiers**: Level up from *Penny Scout* to *Financial Grandmaster*.
- **Daily Quests & Weekly Boss Raids**: Real challenges linked to live spending patterns (*Dining Defense*, *Weekend Vault*, *Zero-Drain Shield*).
- **Savings Streaks**: Tracks consecutive days operating within daily budget limits.
- **Trophy Cabinet**: Unlockable badges (*First Entry*, *Shield Bearer*, *Streak Legend*, *Forensic Analyst*, *10K Reserve*, *Boss Slayer*).

### 4. ◌ Spending Autopsy
- **"If your money could talk, what would it say?"**: Witty, honest monthly behavioral analysis.
- **Micro-Drain Detector**: Scans and aggregates frequent repeat purchases under ₹500 (Swiggy snacks, coffee, cab rides) that quietly drain reserves.
- **Largest Capital Moves**: Highest outflow transactions ranked.
- **Shareable Report Card**: Export and print privacy-conscious summary cards without exposing individual merchant names or raw timestamps.

### 5. ◎ Smart Budget Guardian
- **Proactive Risk Warnings**: Configurable thresholds (50% notice, 75% caution, 90% critical).
- **Burn-Rate Depletion Forecast**: Projects the exact day of the month a budget will run out based on current velocity.
- **Surge Detection**: Identifies abnormal category spending spikes.

### 6. ÷ Split Expenses & Transaction Ledger
- Full group expense splitting with net debt settlement (*Who owes what*).
- Search, filter by category and type, instant keyword autocomplete (*Swiggy*, *Netflix*, *Uber*, *BigBasket*).

---

## 🚀 Getting Started

### Option 1: Standalone Browser (Zero Installation)
No server, runtime, or dependencies required!
1. Double-click `index.html` in any modern web browser, or:
2. In VS Code, right-click `index.html` and select **Open with Live Server**.

### Option 2: Python Full-Stack Server (Recommended)
PennyWise includes a lightweight server (`server.py`) using Python's standard library:
```bash
# Start the server
python3 server.py
```
Open **`http://localhost:8000`** in your browser.

---

## ⚙️ Environment Variables (Optional)

Copy `.env.example` to `.env` to configure optional cloud LLM providers:
```bash
cp .env.example .env
```

| Variable | Description |
| :--- | :--- |
| `PORT` | Local server port (Default: `8000`) |
| `GEMINI_API_KEY` | Google Gemini API key for cloud LLM copilot |
| `OPENAI_API_KEY` | OpenAI API key for alternative cloud copilot |

> **Privacy Guarantee**: If no API keys are provided, PennyWise runs 100% locally in your browser using deterministic algorithms. No financial credentials, PINs, or bank accounts are ever required.

---

## 🎨 Design Direction: Soft Aesthetic Pastel Theme
- **Warm Linen & Pastel Canvas**: Soft warm aesthetic cream background (`#F9F8F5`), clean white cards (`#FFFFFF`), and soft linen borders (`#EAE4DA`).
- **Pastel Color Harmonies**:
  - Soft Pastel Mint (`#86EFAC` / `#34D399`) for positive cash flow, income, and safe budgets.
  - Soft Pastel Coral & Peach (`#FDA4AF` / `#F87171`) for expenses and risk warnings.
  - Soft Pastel Lavender (`#C4B5FD` / `#A78BFA`) for intelligence prompts and copilot tags.
  - Soft Pastel Sky Blue (`#7DD3FC` / `#38BDF8`) for burn trajectory curves.
  - Soft Pastel Butter Yellow (`#FDE047` / `#FBBF24`) for caution alerts and targets.
- **Zero Neon Lights**: Replaced harsh dark obsidian backgrounds and glowing neon green outlines with natural, gentle drop shadows and high-legibility typography.
- **Rich Visual Pies, Charts & Graphs**:
  - Interactive Donut & Pie spending breakdown chart with instant toggle.
  - Monthly Cash Flow Bar Chart (Income vs. Expenses vs. Net Surplus).
  - Daily Spending Velocity Curve with cumulative spend vs. planned burn pace.
  - Category Budget vs. Actual Spend visual comparison bar graph.

---

## 🧪 Demo Presets

Use the sidebar preset switcher to immediately test scenarios:
- **👤 Standard**: Balanced lifestyle with salary, groceries, dinner, and bills.
- **⚡ High Burn**: High dining and retail spend that triggers Guardian alerts and tight runway.
- **✨ Fresh Slate**: Empty state demonstrating polished onboarding for new users.
