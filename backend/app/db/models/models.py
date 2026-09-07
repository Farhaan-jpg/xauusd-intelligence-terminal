import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, default="trader@xauusd-intel.internal")
    hashed_password = Column(String, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    timezone = Column(String, default="Asia/Kolkata")
    theme = Column(String, default="dark-bloomberg")
    default_risk_pct = Column(Float, default=1.0)
    sound_alerts_enabled = Column(Boolean, default=True)
    news_lockout_minutes = Column(Integer, default=15)

class BrokerProfile(Base):
    __tablename__ = "broker_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    broker_name = Column(String, default="Standard ECN Gold")
    contract_size = Column(Float, default=100.0)  # 100 oz per standard lot
    tick_size = Column(Float, default=0.01)       # $0.01
    tick_value = Column(Float, default=1.00)      # $1.00 for 0.01 move on 1 lot
    commission_per_lot = Column(Float, default=6.00)
    typical_spread = Column(Float, default=1.8)    # in points ($0.18)
    swap_long = Column(Float, default=-14.2)
    swap_short = Column(Float, default=8.5)

class RiskProfile(Base):
    __tablename__ = "risk_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1)
    account_balance = Column(Float, default=10000.0)
    current_equity = Column(Float, default=10000.0)
    max_daily_loss_pct = Column(Float, default=3.0)
    max_trade_risk_pct = Column(Float, default=1.0)
    max_daily_trades = Column(Integer, default=5)
    today_realized_loss = Column(Float, default=0.0)
    today_trades_count = Column(Integer, default=0)
    is_locked_out = Column(Boolean, default=False)

class MarketQuote(Base):
    __tablename__ = "market_quotes"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, default="XAUUSD", index=True)
    bid = Column(Float, nullable=False)
    ask = Column(Float, nullable=False)
    spread = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    open = Column(Float, nullable=False)
    prev_close = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    source = Column(String, default="SIMULATED_FEED")
    is_stale = Column(Boolean, default=False)

class OhlcvCandle(Base):
    __tablename__ = "ohlcv_candles"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, default="XAUUSD", index=True)
    timeframe = Column(String, index=True) # 1m, 5m, 15m, 1h, 4h, 1d
    timestamp = Column(DateTime, index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, default=0.0)

class TechnicalSnapshot(Base):
    __tablename__ = "technical_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    timeframe = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    ema20 = Column(Float)
    ema50 = Column(Float)
    ema100 = Column(Float)
    ema200 = Column(Float)
    rsi14 = Column(Float)
    macd = Column(Float)
    macd_signal = Column(Float)
    macd_hist = Column(Float)
    atr14 = Column(Float)
    adx = Column(Float)
    trend = Column(String) # BULLISH, BEARISH, RANGING
    structure = Column(String) # HH_HL, LH_LL, BOS_BULL, BOS_BEAR, CHOCH

class LiquidityLevel(Base):
    __tablename__ = "liquidity_levels"
    id = Column(Integer, primary_key=True, index=True)
    price = Column(Float, index=True)
    level_type = Column(String) # ASIA_HIGH, ASIA_LOW, PDH, PDL, PWH, PWL, EQUAL_HIGHS, EQUAL_LOWS, ROUND_NUMBER
    timeframe = Column(String, default="15m")
    strength = Column(Integer, default=80)
    confirmations = Column(Integer, default=3)
    reaction_count = Column(Integer, default=1)
    is_swept = Column(Boolean, default=False)
    notes = Column(String)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class MacroObservation(Base):
    __tablename__ = "macro_observations"
    id = Column(Integer, primary_key=True, index=True)
    metric = Column(String, index=True) # DXY, US10Y, US02Y, REAL_YIELD, SPX, CRUDE, VIX, GOLD_ETF_TONS, COT_NET
    value = Column(Float)
    change_1d = Column(Float)
    change_1w = Column(Float)
    correlation_30d = Column(Float)
    sentiment_impact = Column(String) # SUPPORTIVE, NEGATIVE, NEUTRAL, DECOUPLED
    interpretation = Column(String)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class EconomicEvent(Base):
    __tablename__ = "economic_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    country = Column(String, default="USD")
    scheduled_utc = Column(DateTime, index=True)
    importance = Column(String) # LOW, MED, HIGH, CRITICAL
    actual = Column(String, nullable=True)
    forecast = Column(String, nullable=True)
    previous = Column(String, nullable=True)
    surprise = Column(Float, nullable=True)
    historical_avg_5m_pips = Column(Float, default=18.5)
    historical_avg_1h_pips = Column(Float, default=45.0)
    impact_explanation = Column(Text)

class NewsItem(Base):
    __tablename__ = "news_items"
    id = Column(Integer, primary_key=True, index=True)
    headline = Column(String, index=True)
    source = Column(String)
    url = Column(String, nullable=True)
    category = Column(String) # FED, INFLATION, EMPLOYMENT, GEOPOLITICS, CENTRAL_BANKS
    published_utc = Column(DateTime, index=True)
    sentiment = Column(String) # GOLD_POSITIVE, GOLD_NEGATIVE, NEUTRAL, UNCLEAR
    relevance_score = Column(Integer, default=8)
    ai_summary = Column(JSON) # List of bullet points
    why_it_matters = Column(Text)
    is_priced_in = Column(String)
    is_verified = Column(Boolean, default=True)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    alert_type = Column(String) # PRICE_CROSS, LIQUIDITY_SWEEP, SPREAD_SPIKE, NEWS_COUNTDOWN, RISK_LIMIT
    condition_json = Column(JSON)
    is_active = Column(Boolean, default=True)
    cooldown_minutes = Column(Integer, default=15)
    last_triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AlertDelivery(Base):
    __tablename__ = "alert_deliveries"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    triggered_at = Column(DateTime, default=datetime.datetime.utcnow)
    triggered_value = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)

class TradePlan(Base):
    __tablename__ = "trade_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    name = Column(String, default="Intraday Pullback")
    direction = Column(String) # LONG, SHORT
    entry_price = Column(Float)
    stop_loss = Column(Float)
    take_profit_1 = Column(Float)
    take_profit_2 = Column(Float, nullable=True)
    lot_size = Column(Float)
    cash_at_risk = Column(Float)
    effective_risk_with_costs = Column(Float)
    rr_ratio = Column(Float)
    breakeven_win_rate = Column(Float)
    checklist_json = Column(JSON)
    status = Column(String, default="PLANNED") # PLANNED, EXECUTED, REJECTED, CANCELLED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class JournalTrade(Base):
    __tablename__ = "journal_trades"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    trade_plan_id = Column(Integer, nullable=True)
    symbol = Column(String, default="XAUUSD")
    direction = Column(String) # LONG, SHORT
    entry_price = Column(Float)
    exit_price = Column(Float)
    entry_time = Column(DateTime)
    exit_time = Column(DateTime)
    lot_size = Column(Float)
    fees_and_swap = Column(Float, default=6.0)
    gross_pnl = Column(Float)
    net_pnl = Column(Float)
    pips = Column(Float)
    r_multiple = Column(Float)
    setup_tag = Column(String) # ASIA_SWEEP, PULLBACK, BREAKOUT_RETEST, NEWS_FADE
    session = Column(String) # ASIA, LONDON, NEW_YORK, OVERLAP
    regime = Column(String) # TREND, RANGE, VOLATILE
    rule_adherence = Column(Boolean, default=True)
    mistake_tag = Column(String, nullable=True)
    emotional_state = Column(String, default="Disciplined")
    screenshot_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PerformanceSnapshot(Base):
    __tablename__ = "performance_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    snapshot_date = Column(DateTime, default=datetime.datetime.utcnow)
    total_trades = Column(Integer, default=0)
    win_rate = Column(Float, default=0.0)
    profit_factor = Column(Float, default=0.0)
    expectancy = Column(Float, default=0.0)
    average_r = Column(Float, default=0.0)
    max_drawdown_pct = Column(Float, default=0.0)
    rule_adherence_pct = Column(Float, default=100.0)

class AiConversation(Base):
    __tablename__ = "ai_conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    query = Column(Text)
    context_used = Column(JSON)
    response = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DataSourceStatus(Base):
    __tablename__ = "data_source_status"
    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String, unique=True)
    status = Column(String, default="OK") # OK, DEGRADED, STALE, OFFLINE
    last_fetched_utc = Column(DateTime, default=datetime.datetime.utcnow)
    latency_ms = Column(Integer, default=45)
    details = Column(String, default="Operational")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    details = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
