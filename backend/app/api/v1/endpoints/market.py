from fastapi import APIRouter, Query, Depends
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.providers.market_provider import market_provider
from app.providers.macro_provider import macro_provider
from app.providers.calendar_provider import calendar_provider
from app.engines.technical_engine import TechnicalEngine
from app.engines.liquidity_engine import LiquidityEngine
from app.engines.macro_engine import MacroEngine
from app.engines.verdict_engine import VerdictEngine

router = APIRouter()

@router.get("/quote")
def get_quote():
    return market_provider.get_live_quote()

@router.get("/sessions")
def get_sessions():
    return market_provider.get_active_sessions()

@router.get("/candles")
def get_candles(timeframe: str = Query("15m", pattern="^(1m|5m|15m|1h|4h|1d)$"), count: int = Query(100, ge=10, le=500)):
    return market_provider.generate_historical_candles(timeframe=timeframe, count=count)

@router.get("/multitimeframe")
@router.get("/multi-timeframe")
def get_multitimeframe():
    return market_provider.get_multi_timeframe_matrix()

@router.get("/verdict")
def get_verdict():
    quote = market_provider.get_live_quote()
    candles_15m = market_provider.generate_historical_candles("15m", 50)
    structure = TechnicalEngine.detect_swings_and_structure(candles_15m)
    
    drivers = macro_provider.get_macro_drivers()
    macro_res = MacroEngine.evaluate_macro_bias(drivers)
    
    pdh = quote["high"]
    pdl = quote["low"]
    recent_highs = [c["high"] for c in candles_15m[-24:]] if candles_15m else [quote["high"]]
    recent_lows = [c["low"] for c in candles_15m[-24:]] if candles_15m else [quote["low"]]
    asia_high = round(max(recent_highs), 2)
    asia_low = round(min(recent_lows), 2)

    nearest_liq = LiquidityEngine.identify_levels(
        current_price=quote["price"],
        candles=candles_15m,
        pdh=pdh,
        pdl=pdl,
        pwh=round(pdh + 25.0, 2),
        pwl=round(pdl - 25.0, 2),
        asia_high=asia_high,
        asia_low=asia_low,
        london_high=round(pdh, 2),
        london_low=round(pdl, 2)
    )
    
    events = calendar_provider.get_calendar_events()
    next_event = next((e for e in events if e.get("country") == "USD" and e.get("importance") in ("HIGH", "CRITICAL") and e.get("minutes_until", 0) > 0), None)
    if not next_event:
        next_event = next((e for e in events if e.get("importance") in ("HIGH", "CRITICAL") and e.get("minutes_until", 0) > 0), None)
    lockout_status = calendar_provider.get_lockout_status()
    
    verdict = VerdictEngine.generate_verdict(
        tech_structure=structure,
        macro_result=macro_res,
        nearest_liquidity=nearest_liq,
        upcoming_high_impact_event=next_event,
        current_spread=quote["spread_points"],
        is_news_blackout=lockout_status["is_locked_out"]
    )
    
    return {
        "verdict": verdict,
        "market_snapshot": quote,
        "active_session": market_provider.get_active_sessions(),
        "next_catalyst": next_event,
        "lockout_status": lockout_status
    }
