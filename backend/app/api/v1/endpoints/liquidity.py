from fastapi import APIRouter
from app.providers.market_provider import market_provider
from app.engines.liquidity_engine import LiquidityEngine

router = APIRouter()

@router.get("/levels")
def get_liquidity_levels():
    quote = market_provider.get_live_quote()
    candles = market_provider.generate_historical_candles("15m", 60)
    
    pdh = quote["high"]
    pdl = quote["low"]
    pwh = round(quote["high"] + 25.0, 2)
    pwl = round(quote["low"] - 25.0, 2)
    
    recent_highs = [c["high"] for c in candles[-24:]] if candles else [quote["high"]]
    recent_lows = [c["low"] for c in candles[-24:]] if candles else [quote["low"]]
    asia_high = round(max(recent_highs), 2)
    asia_low = round(min(recent_lows), 2)
    london_high = round(quote["high"], 2)
    london_low = round(quote["low"], 2)

    levels = LiquidityEngine.identify_levels(
        current_price=quote["price"],
        candles=candles,
        pdh=pdh,
        pdl=pdl,
        pwh=pwh,
        pwl=pwl,
        asia_high=asia_high,
        asia_low=asia_low,
        london_high=london_high,
        london_low=london_low
    )
    
    # Also test for recent sweeps against Asia High and Previous Day Low
    sweep_asia = LiquidityEngine.detect_sweeps(candles, asia_high, "Session High Liquidity")
    sweep_pdl = LiquidityEngine.detect_sweeps(candles, pdl, "Daily Low Structural Demand")
    
    sweeps = []
    if sweep_asia["swept"]:
        sweeps.append(sweep_asia)
    if sweep_pdl["swept"]:
        sweeps.append(sweep_pdl)
        
    return {
        "current_price": quote["price"],
        "liquidity_levels": levels,
        "recent_sweeps": sweeps,
        "disclaimer": "Likely liquidity / stop-interest zones inferred from public price structure."
    }
