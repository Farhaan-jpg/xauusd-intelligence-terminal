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
        pdh=4460.00,
        pdl=4375.00,
        pwh=4485.00,
        pwl=4340.00,
        asia_high=4432.00,
        asia_low=4395.00,
        london_high=4448.00,
        london_low=4382.00
    )
    
    # Also test for recent sweeps against Asia High and Previous Day Low
    sweep_asia = LiquidityEngine.detect_sweeps(candles, 4432.00, "Asia Session High")
    sweep_pdl = LiquidityEngine.detect_sweeps(candles, 4375.00, "Key Structural Demand")
    
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
