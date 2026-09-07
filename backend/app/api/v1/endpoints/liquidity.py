from fastapi import APIRouter
from app.providers.market_provider import market_provider
from app.engines.liquidity_engine import LiquidityEngine

router = APIRouter()

@router.get("/levels")
def get_liquidity_levels():
    quote = market_provider.get_live_quote()
    candles = market_provider.generate_historical_candles("15m", 60)
    
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
    
    # Also test for recent sweeps against Asia High and Previous Day Low
    sweep_asia = LiquidityEngine.detect_sweeps(candles, quote["price"] + 6.20, "Asia Session High")
    sweep_pdl = LiquidityEngine.detect_sweeps(candles, quote["low"] - 2.00, "Previous Day Low")
    
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
