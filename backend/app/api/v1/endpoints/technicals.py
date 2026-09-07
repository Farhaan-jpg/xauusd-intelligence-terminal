from fastapi import APIRouter, Query
from app.providers.market_provider import market_provider
from app.engines.technical_engine import TechnicalEngine

router = APIRouter()

@router.get("/indicators")
def get_indicators(timeframe: str = Query("15m", pattern="^(1m|5m|15m|1h|4h|1d)$")):
    candles = market_provider.generate_historical_candles(timeframe, 100)
    closes = [c["close"] for c in candles]
    
    ema20 = TechnicalEngine.calculate_ema(closes, 20)
    ema50 = TechnicalEngine.calculate_ema(closes, 50)
    ema100 = TechnicalEngine.calculate_ema(closes, 100)
    ema200 = TechnicalEngine.calculate_ema(closes, 200)
    rsi14 = TechnicalEngine.calculate_rsi(closes, 14)
    atr14 = TechnicalEngine.calculate_atr(candles, 14)
    macd_res = TechnicalEngine.calculate_macd(closes)
    
    return {
        "timeframe": timeframe,
        "latest": {
            "ema20": ema20[-1] if ema20 else None,
            "ema50": ema50[-1] if ema50 else None,
            "ema100": ema100[-1] if ema100 else None,
            "ema200": ema200[-1] if ema200 else None,
            "rsi14": rsi14[-1] if rsi14 else 50.0,
            "atr14": atr14[-1] if atr14 else 4.5,
            "macd": macd_res
        },
        "series": {
            "rsi": rsi14[-30:],
            "atr": atr14[-30:]
        }
    }

@router.get("/structure")
def get_structure(timeframe: str = Query("15m", pattern="^(1m|5m|15m|1h|4h|1d)$")):
    candles = market_provider.generate_historical_candles(timeframe, 80)
    structure = TechnicalEngine.detect_swings_and_structure(candles)
    return {
        "timeframe": timeframe,
        "structure": structure
    }
