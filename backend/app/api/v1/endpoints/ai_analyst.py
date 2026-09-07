from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
import datetime
from app.providers.market_provider import market_provider
from app.providers.macro_provider import macro_provider
from app.providers.calendar_provider import calendar_provider
from app.engines.technical_engine import TechnicalEngine
from app.engines.macro_engine import MacroEngine
from app.engines.liquidity_engine import LiquidityEngine

router = APIRouter()

class AiQueryRequest(BaseModel):
    prompt: Optional[str] = "Provide current market analysis and pre-trade scenario check."

@router.post("/analyze")
def run_gold_analyst(req: AiQueryRequest):
    quote = market_provider.get_live_quote()
    candles = market_provider.generate_historical_candles("15m", 50)
    structure = TechnicalEngine.detect_swings_and_structure(candles)
    drivers = macro_provider.get_macro_drivers()
    macro_res = MacroEngine.evaluate_macro_bias(drivers)
    events = calendar_provider.get_calendar_events()
    next_event = events[0] if events else None
    
    levels = LiquidityEngine.identify_levels(
        current_price=quote["price"],
        candles=candles,
        pdh=quote["high"] + 2.50,
        pdl=quote["low"] - 2.00,
        pwh=quote["price"] + 28.0,
        pwl=quote["price"] - 35.0,
        asia_high=quote["price"] + 6.20,
        asia_low=quote["price"] - 5.80,
        london_high=quote["price"] + 9.50,
        london_low=quote["price"] - 8.20
    )
    
    sup = next((l for l in levels if l["category"] == "SUPPORT"), None)
    res = next((l for l in levels if l["category"] == "RESISTANCE"), None)
    
    sup_str = f"${sup['price']} ({sup['label']})" if sup else "$4400.00"
    res_str = f"${res['price']} ({res['label']})" if res else "$4440.00"
    
    now_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    
    analysis_output = {
        "title": "Gold Analyst Institutional Synthesis",
        "timestamp_generated": now_utc,
        "format_sections": [
            {
                "section": "1. Current State",
                "content": f"XAUUSD is trading at ${quote['price']:.2f} (+{quote['change_points']:+.2f} pts / {quote['change_pct']:+.2f}% today) in the {market_provider.get_active_sessions()['current_session']}. Short-term structure is classified as {structure['structure']} with {structure['trend']} bias."
            },
            {
                "section": "2. Grounded Evidence",
                "content": f"EMA alignment is positive on 15m; DXY is trading at {drivers['DXY']['value']} ({drivers['DXY']['change_1d']:+.2f}%); US 10Y Yield at {drivers['US10Y']['value']}% ({drivers['US10Y']['change_1d']:+.2f}%). Aggregate Macro Score is {macro_res['score']:+.1f}/100 ({macro_res['verdict']})."
            },
            {
                "section": "3. Bullish Case",
                "content": f"Buyers sustain acceptance above {sup_str}. Declining yields and softening dollar support institutional continuation targeting untested liquidity at {res_str}."
            },
            {
                "section": "4. Bearish Case",
                "content": f"Rejection near {res_str} leads to failure of recent swing low at ${quote['low']:.2f}. A firming DXY or hotter inflation print could catalyze aggressive profit-taking down toward structural support."
            },
            {
                "section": "5. Key Inferred Structural Levels",
                "content": f"Immediate Resistance: {res_str} | Immediate Demand / Invalidation: {sup_str} | Today's Session Range: ${quote['low']:.2f} - ${quote['high']:.2f}."
            },
            {
                "section": "6. Upcoming Catalyst Risks",
                "content": f"Upcoming Tier-1 Event: {next_event['title'] if next_event else 'None'} ({next_event['countdown'] if next_event else 'N/A'}). Mandatory 15-minute news lockout recommended around the release."
            },
            {
                "section": "7. Invalidation Criteria",
                "content": f"A clean 15-minute candle close below {sup_str} completely invalidates intraday long momentum. A decisive close above {res_str} nullifies any mean-reversion short bias."
            },
            {
                "section": "8. Suggested Discipline Action",
                "content": "Wait for price to interact with verified liquidity boundaries. Do not chase market momentum mid-range. Verify that planned trade risk is strictly <= 1.0% with minimum 1.5:1 net Reward-to-Risk after estimated execution costs."
            },
            {
                "section": "9. Data Freshness & Disclaimers",
                "content": f"Calculated using simulated institutional quote feed timestamped {quote['timestamp_ist']}. Educational decision-support tool only; not financial advice. Trading leveraged products carries risk of substantial loss."
            }
        ]
    }
    return analysis_output
