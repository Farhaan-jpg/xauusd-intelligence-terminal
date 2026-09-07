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
def get_multitimeframe():
    return market_provider.get_multi_timeframe_matrix()

@router.get("/verdict")
def get_verdict():
    quote = market_provider.get_live_quote()
    candles_15m = market_provider.generate_historical_candles("15m", 50)
    structure = TechnicalEngine.detect_swings_and_structure(candles_15m)
    
    drivers = macro_provider.get_macro_drivers()
    macro_res = MacroEngine.evaluate_macro_bias(drivers)
    
    nearest_liq = LiquidityEngine.identify_levels(
        current_price=quote["price"],
        candles=candles_15m,
        pdh=4460.0,
        pdl=4375.0,
        pwh=4485.0,
        pwl=4340.0,
        asia_high=4432.0,
        asia_low=4395.0,
        london_high=4448.0,
        london_low=4382.0
    )
    
    events = calendar_provider.get_calendar_events()
    next_event = next((e for e in events if e["importance"] in ("HIGH", "CRITICAL")), None)
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
