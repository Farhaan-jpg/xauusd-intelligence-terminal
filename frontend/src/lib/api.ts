const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status} on ${endpoint}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Fetch failed for ${endpoint}, returning fallback demo response:`, err);
    throw err;
  }
}

export const terminalApi = {
  getQuote: () => fetchJson<any>("/api/v1/market/quote"),
  getSessions: () => fetchJson<any>("/api/v1/market/sessions"),
  getVerdict: () => fetchJson<any>("/api/v1/market/verdict"),
  getCandles: (timeframe = "15m", count = 100) => 
    fetchJson<any[]>(`/api/v1/market/candles?timeframe=${timeframe}&count=${count}`),
  getMultiTimeframe: () => fetchJson<any>("/api/v1/market/multitimeframe"),
  getIndicators: (timeframe = "15m") => 
    fetchJson<any>(`/api/v1/technicals/indicators?timeframe=${timeframe}`),
  getStructure: (timeframe = "15m") => 
    fetchJson<any>(`/api/v1/technicals/structure?timeframe=${timeframe}`),
  getLiquidityLevels: () => fetchJson<any>("/api/v1/liquidity/levels"),
  getMacroDrivers: () => fetchJson<Record<string, any>>("/api/v1/macro/drivers"),
  getMacroScore: () => fetchJson<any>("/api/v1/macro/score"),
  getCalendarEvents: () => fetchJson<any[]>("/api/v1/calendar/events"),
  getLockoutStatus: () => fetchJson<any>("/api/v1/calendar/lockout"),
  getNewsCatalysts: () => fetchJson<any[]>("/api/v1/news/catalysts"),
  calculateRisk: (data: any) => 
    fetchJson<any>("/api/v1/planner/calculate", { method: "POST", body: JSON.stringify(data) }),
  saveTradePlan: (data: any) => 
    fetchJson<any>("/api/v1/planner/save", { method: "POST", body: JSON.stringify(data) }),
  getTradePlans: () => fetchJson<any[]>("/api/v1/planner/plans"),
  getJournalTrades: () => fetchJson<any[]>("/api/v1/journal/trades"),
  createJournalTrade: (data: any) => 
    fetchJson<any>("/api/v1/journal/trades", { method: "POST", body: JSON.stringify(data) }),
  getJournalAnalytics: () => fetchJson<any>("/api/v1/journal/analytics"),
  getWeeklyReview: () => fetchJson<any>("/api/v1/journal/weekly-review"),
  getAlerts: () => fetchJson<any[]>("/api/v1/alerts/list"),
  getAlertHistory: () => fetchJson<any[]>("/api/v1/alerts/history"),
  getProfileSettings: () => fetchJson<any>("/api/v1/settings/profile"),
  updateProfileSettings: (data: any) => 
    fetchJson<any>("/api/v1/settings/profile", { method: "POST", body: JSON.stringify(data) }),
  runAiAnalysis: (prompt?: string) => 
    fetchJson<any>("/api/v1/ai/analyze", { method: "POST", body: JSON.stringify({ prompt }) }),
  healthCheck: () => fetchJson<any>("/api/v1/health")
};
