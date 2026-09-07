export interface MarketQuote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread_points: number;
  spread_usd: number;
  open: number;
  high: number;
  low: number;
  prev_close: number;
  change_points: number;
  change_pct: number;
  timestamp_utc: string;
  timestamp_ist: string;
  source: string;
  is_stale: boolean;
  freshness_seconds: number;
}

export interface SessionInfo {
  current_session: string;
  session_quality: string;
  is_overlap: boolean;
  is_rollover: boolean;
  time_utc: string;
  time_ist: string;
  sessions_info: Array<{
    name: string;
    hours_ist: string;
    status: "ACTIVE" | "CLOSED";
  }>;
}

export interface ExecutiveVerdict {
  directional_bias: "BULLISH" | "BEARISH" | "NEUTRAL" | "MIXED_WAIT" | "STAND_ASIDE";
  market_regime: string;
  conviction_score: number;
  confidence_band: "LOW" | "MODERATE" | "HIGH";
  volatility_score: number;
  risk_environment: "NORMAL" | "ELEVATED" | "EXTREME";
  one_sentence_thesis: string;
  supporting_factors: string[];
  invalidation_factors: string[];
  what_changes_mind: string;
  best_action_now: string;
  is_lockout: boolean;
}

export interface TimeframeAlignment {
  tf: string;
  trend: string;
  ema_align: string;
  rsi: number;
  structure: string;
  score: number;
  support: number;
  resistance: number;
}

export interface MultiTimeframeData {
  timeframes: TimeframeAlignment[];
  intraday_bias: string;
  htf_bias: string;
  alignment_status: string;
  agreement_summary: string;
  overall_score: number;
}

export interface LiquidityLevel {
  price: number;
  type: string;
  label: string;
  category: "SUPPORT" | "RESISTANCE";
  strength: number;
  distance_usd: number;
  distance_pips: number;
  status: "IMMINENT" | "NEAR" | "UNTESTED";
  notes: string;
}

export interface MacroDriver {
  name: string;
  value: number | string;
  unit?: string;
  change_1h?: number;
  change_1d?: number;
  change_1w?: number;
  correlation_30d?: number;
  relationship: string;
  status: string;
  source: string;
  updated_at: string;
  weekly_change?: number;
  percentile_3yr?: number;
  crowding_warning?: string;
}

export interface MacroScoreResult {
  score: number;
  verdict: string;
  components: Array<{
    driver: string;
    value: string | number;
    change: string;
    weight_pct: number;
    bias: string;
    impact: number;
    explanation: string;
  }>;
  formula_summary: string;
  updated_at: string;
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  importance: "LOW" | "MED" | "HIGH" | "CRITICAL";
  time_utc: string;
  time_ist: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  minutes_until: number;
  countdown: string;
  historical_pips: {
    avg_5m: number;
    avg_15m: number;
    avg_1h: number;
  };
  impact_explanation: string;
}

export interface NewsCatalyst {
  id: string;
  headline: string;
  source: string;
  category: string;
  published_ago: string;
  sentiment: "GOLD_POSITIVE" | "GOLD_NEGATIVE" | "NEUTRAL" | "UNCLEAR";
  relevance_score: number;
  is_verified: boolean;
  ai_summary: string[];
  why_it_matters: string;
  priced_in: string;
}

export interface RiskCalculationResult {
  is_valid: boolean;
  violations: string[];
  direction: "LONG" | "SHORT";
  recommended_lot_size: number;
  cash_at_risk: number;
  estimated_costs: {
    spread: number;
    commission: number;
    slippage: number;
    total_friction: number;
  };
  effective_total_risk: number;
  effective_risk_pct: number;
  net_reward_tp1: number;
  risk_to_reward_ratio: number;
  breakeven_win_rate_pct: number;
  distances: {
    stop_loss_dollars: number;
    stop_loss_points: number;
    stop_loss_pips: number;
    stop_loss_atr_multiples: number;
    target_1_dollars: number;
    target_1_atr_multiples: number;
  };
  account_utilization: {
    daily_loss_utilized_pct: number;
    trades_remaining_today: number;
  };
  formula_breakdown: {
    lot_formula: string;
    example: string;
    net_rr_formula: string;
    contract_specs_used: string;
  };
}

export interface JournalTrade {
  id: number;
  symbol: string;
  direction: "LONG" | "SHORT";
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  lot_size: number;
  fees_and_swap: number;
  gross_pnl: number;
  net_pnl: number;
  pips: number;
  r_multiple: number;
  setup_tag: string;
  session: string;
  regime: string;
  rule_adherence: boolean;
  mistake_tag?: string;
  emotional_state: string;
  notes?: string;
}
