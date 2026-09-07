# XAUUSD Intelligence Terminal

> **Institutional-Grade Discretionary Decision-Support Terminal for Gold Scalpers, Intraday, and Swing Traders.**
>
> *Educational decision-support tool only. Not financial advice. Trading leveraged products carries severe risk of substantial capital loss.*

---

## 📌 Core Features

1. **Executive Verdict Matrix**: Algorithmic directional bias (Bullish, Bearish, Neutral, Mixed/Wait) with conviction scores (0-100), 1-sentence thesis, 3 supporting factors, 3 invalidation criteria, and discipline action recommendations.
2. **Multi-Timeframe Alignment Engine**: Simultaneous monitoring across 1m, 5m, 15m, 1h, 4h, and 1D timeframes.
3. **Interactive Candlestick Engine**: TradingView-inspired candlestick charts with EMAs (20, 50), RSI (14) sub-chart, and session ranges.
4. **Liquidity Radar & Inferred Stop Pools**: Transparent tracking of Asia, London, New York highs/lows, Prior Day High/Low, equal highs/lows, and sweep-and-reclaim alerts.
5. **Macro & Drivers Dashboard**: Real-time evaluation of DXY, US 10Y Yield, Real Yield proxies, VIX, Oil, COT positioning, and institutional Gold ETF flows with an aggregated weighted macro score (-100 to +100).
6. **Economic Catalyst Calendar**: Focuses on XAUUSD market movers (FOMC, CPI, NFP, PCE, PMI) with countdown timers and automated **±15m News Lockout Guardrail alerts**.
7. **Institutional Position Sizing & Trade Planner**: Broker-specific contract calculations factoring in spread, commission, and slippage friction with mathematical formula transparency.
8. **Personal Trade Journal & Performance Analytics**: Trade log, win rate, expectancy, average R, session matrix, and weekly process reviews.
9. **Grounded AI Gold Analyst**: 9-section structured market scenario synthesis grounded in live telemetry data.
10. **Dual-Timezone Clock**: Tailored for Indian traders with IST (`Asia/Kolkata`) timestamps by default alongside global UTC sessions.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, TradingView Lightweight Charts, Lucide Icons.
- **Backend**: Python FastAPI, SQLAlchemy (SQLite zero-cost default / PostgreSQL supported), Pydantic v2.
- **Deployment**: Docker Compose, Render Blueprint (`render.yaml`), GitHub Actions keep-alive workflow.

---

## 🚀 Local Development Quickstart

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### 1. Start the FastAPI Backend
```bash
# In project root
python -m pip install -r backend/requirements.txt
python backend/run.py
```
The backend will start at `http://localhost:8000` with Swagger docs available at `http://localhost:8000/docs`.

### 2. Start the Next.js Frontend
```bash
# In a new terminal window
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser. The terminal is 100% functional out of the box in Demo Mode without requiring any paid API keys.

---

## 🌐 100% Free Hosting Guide (GitHub + Render + CronJob)

You can host this entire terminal **completely free** on Render using GitHub and a free cron-job to keep the instance awake 24/7.

### Step 1: Push Code to GitHub
1. Open terminal in the project directory:
   ```bash
   git init
   git add .
   git commit -m "feat: XAUUSD Intelligence Terminal production release"
   ```
2. Create a new repository on [GitHub](https://github.com) named `xauusd-intelligence-terminal`.
3. Push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/xauusd-intelligence-terminal.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy Free Backend on Render
1. Go to [Render](https://render.com) and create a free account (or log in with GitHub).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `xauusd-intelligence-terminal` repo.
4. Configure the settings:
   - **Name**: `xauusd-intelligence-backend`
   - **Region**: Oregon (or nearest)
   - **Branch**: `main`
   - **Root Directory**: (Leave blank)
   - **Runtime**: **Python**
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python backend/run.py`
   - **Instance Type**: **Free** (512 MB RAM, 0.1 CPU)
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `PORT` | `8000` | Port for FastAPI |
   | `ENVIRONMENT` | `production` | Production environment |
   | `DEMO_MODE` | `true` | Enables zero-cost demo telemetry |
   | `TIMEZONE` | `Asia/Kolkata` | IST Timezone default |
   | `DATABASE_URL` | `sqlite:///./terminal.db` | Embedded persistence |
   | `SECRET_KEY` | `generate_any_random_string` | Session security |
6. Click **Create Web Service**. Wait 2-3 minutes until deployment succeeds.
7. Copy your backend URL: e.g. `https://xauusd-intelligence-backend.onrender.com`.

---

### Step 3: Deploy Free Frontend on Render
1. Click **New +** -> **Web Service**.
2. Select the same repository.
3. Configure the settings:
   - **Name**: `xauusd-intelligence-terminal`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: **Node**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `BACKEND_URL` | `https://xauusd-intelligence-backend.onrender.com` *(use your backend URL from Step 2)* |
   | `NEXT_PUBLIC_API_URL` | `https://xauusd-intelligence-backend.onrender.com` |
5. Click **Create Web Service**. Once built, you will receive your live terminal URL (e.g. `https://xauusd-intelligence-terminal.onrender.com`).

---

### Step 4: Keep Free Tier Awake (Prevent 15-Minute Sleep)

Render's free web services sleep after 15 minutes of inactivity, causing a 30-50 second delay on waking up. You can prevent this completely for free using either of the following methods:

#### Method A: Free Cron via [cron-job.org](https://cron-job.org) (Recommended)
1. Sign up for a free account at [cron-job.org](https://cron-job.org).
2. Click **Create Cronjob**.
3. Fill in:
   - **Title**: `XAUUSD Terminal Keepalive`
   - **URL**: `https://xauusd-intelligence-backend.onrender.com/api/v1/health`
   - **Execution Schedule**: **Every 10 minutes** (`*/10 * * * *`)
4. Click **Create**.
*Result:* cron-job.org will ping your backend every 10 minutes. Render detects incoming traffic and will **never put your free instance to sleep**.

#### Method B: Built-in GitHub Actions Workflow
This repository already includes `.github/workflows/keepalive.yml`:
1. In your GitHub repository, go to **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Name: `RENDER_APP_URL`.
4. Value: `https://xauusd-intelligence-backend.onrender.com`.
5. GitHub Actions will automatically run every 10 minutes to ping your health endpoint.

---

## 🧪 Running Automated Tests

```bash
# Backend unit tests (Risk Engine, Technical Indicators, Verdicts)
python -m pytest backend/app/tests/test_engines.py -v
```

---

## 🛡️ Responsible Trading & Safeguards

- **Discretionary Support Only**: This terminal never executes orders directly to a broker.
- **Data Integrity**: Clearly separates live ticks, estimated structural zones, and mathematical formulas.
- **News Lockout Window**: Automatically flags high-risk volatility windows before major economic prints.
- **Risk Limits**: Built-in maximum daily loss and trade count guardrails encourage standing aside when market conditions are suboptimal.
