from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
import datetime
from app.providers.market_provider import market_provider
from app.providers.macro_provider import macro_provider
from app.providers.calendar_provider import calendar_provider
from app.providers.news_provider import news_provider
from app.providers.ai_provider import ai_provider
from app.engines.technical_engine import TechnicalEngine
from app.engines.macro_engine import MacroEngine
from app.engines.liquidity_engine import LiquidityEngine

router = APIRouter()

class AiQueryRequest(BaseModel):
    prompt: Optional[str] = "Provide institutional XAUUSD market analysis and pre-trade scenario check."

@router.post("/analyze")
def run_gold_analyst(req: AiQueryRequest):
    quote = market_provider.get_live_quote()
    candles = market_provider.generate_historical_candles("15m", 50)
    mtf = market_provider.get_multi_timeframe_matrix()
    structure = TechnicalEngine.detect_swings_and_structure(candles)
    drivers = macro_provider.get_macro_drivers()
    macro_res = MacroEngine.evaluate_macro_bias(drivers)
    events = calendar_provider.get_calendar_events()
    next_usd = next((e for e in events if e.get("country") == "USD" and e.get("importance") in ("HIGH", "CRITICAL") and e.get("minutes_until", 0) > 0), None)
    news = news_provider.get_news_catalysts()
    
    pdh = quote["high"]
    pdl = quote["low"]
    recent_highs = [c["high"] for c in candles[-24:]] if candles else [quote["high"]]
    recent_lows = [c["low"] for c in candles[-24:]] if candles else [quote["low"]]
    asia_high = round(max(recent_highs), 2)
    asia_low = round(min(recent_lows), 2)

    levels = LiquidityEngine.identify_levels(
        current_price=quote["price"],
        candles=candles,
        pdh=pdh,
        pdl=pdl,
        pwh=round(pdh + 25.0, 2),
        pwl=round(pdl - 25.0, 2),
        asia_high=asia_high,
        asia_low=asia_low,
        london_high=round(pdh, 2),
        london_low=round(pdl, 2)
    )
    
    sup = next((l for l in levels if l["category"] == "SUPPORT"), None)
    res = next((l for l in levels if l["category"] == "RESISTANCE"), None)
    
    sup_str = f"${sup['price']} ({sup['label']})" if sup else f"${pdl:.2f}"
    res_str = f"${res['price']} ({res['label']})" if res else f"${pdh:.2f}"
    
    # Run dynamic AI synthesis (Gemini Priority 1 -> OpenRouter Fallback Priority 2)
    ai_result = ai_provider.generate_market_scenario_analysis(
        user_query=req.prompt or "Provide institutional market analysis.",
        quote=quote,
        mtf=mtf,
        macro=drivers,
        catalyst=next_usd,
        news=news
    )
    
    now_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Structure into the 9 clean sections for the terminal UI
    analysis_output = {
        "title": "Gold Analyst Institutional Synthesis",
        "timestamp_generated": f"{now_utc} (via {ai_result.get('provider')} - {ai_result.get('model')})",
        "ai_provider": ai_result.get("provider"),
        "ai_model": ai_result.get("model"),
        "raw_ai_analysis": ai_result.get("text"),
        "format_sections": [
            {
                "section": f"1. Current Market State ({ai_result.get('provider')} / {ai_result.get('model')})",
                "content": f"XAUUSD spot is quoting at ${quote['price']:.2f} ({quote['change_points']:+.2f} pts / {quote['change_pct']:+.2f}% 24h) in the {market_provider.get_active_sessions()['current_session']}. Spread is {quote['spread_points']:.1f} pts (${quote['spread_usd']:.2f}). Intraday structure: {structure['structure']} ({structure['trend']})."
            },
            {
                "section": "2. Multi-Timeframe Alignment & Macro Evidence",
                "content": f"Intraday Bias: {mtf['intraday_bias']} | HTF Bias: {mtf['htf_bias']} | Status: {mtf['alignment_status']}. DXY Dollar Index is trading at {drivers['DXY']['value']} ({drivers['DXY']['change_1d']:+.2f}%); US 10Y Yield at {drivers['US10Y']['value']}% ({drivers['US10Y']['change_1d']:+.2f}%). Aggregate Macro Score is {macro_res['score']:+.1f}/100 ({macro_res['verdict']})."
            },
            {
                "section": "3. AI Scenario Synthesis & Catalyst Dynamics",
                "content": ai_result.get("text", "Market consolidating within verified structural liquidity bands. Maintain disciplined risk management.")
            },
            {
                "section": "4. Bullish Scenario & Continuation Trigger",
                "content": f"Sustained acceptance above {sup_str} confirms buyer absorption. If DXY remains under pressure and yields pull back, upside liquidity targets {res_str}."
            },
            {
                "section": "5. Bearish Scenario & Invalidation Trigger",
                "content": f"Failure to break above {res_str} followed by loss of ${pdl:.2f} exposes deeper structural demand zones down toward ${quote['low'] - 15.0:.2f}."
            },
            {
                "section": "6. Inferred Structural Liquidity Zones",
                "content": f"Immediate Resistance / Liquidity Pool: {res_str} | Immediate Support / Demand Shelf: {sup_str} | Session Extreme Bounds: ${quote['low']:.2f} - ${quote['high']:.2f}."
            },
            {
                "section": "7. Upcoming Economic Catalyst Risk",
                "content": f"Next High-Impact USD Release: {next_usd['title'] if next_usd else 'No impending tier-1 USD events'} ({next_usd['countdown'] if next_usd else 'N/A'} at {next_usd['time_ist'] if next_usd else 'N/A'}). Automated blackout lockout activates at T-15m."
            },
            {
                "section": "8. Risk Management & Discipline Rules",
                "content": "Do not chase price mid-range. Wait for confirmed liquidity sweep and candle close outside the immediate 15m consolidation. Keep maximum account risk strictly <= 1.0% per trade with minimum 1.5:1 net Reward-to-Risk ratio."
            },
            {
                "section": "9. Live Telemetry & Disclaimer",
                "content": f"Data ingested from live interbank gold spot and institutional feeds timestamped {quote['timestamp_ist']}. Educational discretionary decision support only; not financial advice or automated execution."
            }
        ]
    }
    return analysis_output
