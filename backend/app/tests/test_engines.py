import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.engines.risk_engine import RiskEngine
from app.engines.technical_engine import TechnicalEngine
from app.engines.verdict_engine import VerdictEngine

def test_risk_engine_long_calculation():
    # Test standard gold position calculation:
    # $10,000 balance, 1% risk = $100 risk
    # Long from 2650.00 to SL 2645.00 ($5.00 SL)
    # Standard contract 100 oz: 1 lot loses $500 on $5 move.
    # $100 risk / $500 = 0.20 lots.
    res = RiskEngine.calculate_position_size(
        account_balance=10000.0,
        risk_pct=1.0,
        fixed_risk_amount=0.0,
        entry_price=2650.00,
        stop_loss=2645.00,
        take_profit_1=2665.00,
        contract_size=100.0,
        spread_points=1.8,
        commission_per_lot=6.0,
        slippage_points=1.0,
        atr_value=8.50
    )
    
    assert res["is_valid"] is True
    assert res["recommended_lot_size"] == 0.20
    assert res["direction"] == "LONG"
    assert res["cash_at_risk"] == 100.00
    assert res["risk_to_reward_ratio"] > 2.5
    assert res["distances"]["stop_loss_dollars"] == 5.00

def test_risk_engine_daily_loss_guardrail():
    # Attempting to risk $400 when max daily loss is 3% ($300)
    res = RiskEngine.calculate_position_size(
        account_balance=10000.0,
        risk_pct=4.0,
        fixed_risk_amount=0.0,
        entry_price=2650.00,
        stop_loss=2640.00,
        take_profit_1=2670.00,
        max_daily_loss_pct=3.0,
        today_loss_so_far=100.0
    )
    assert res["is_valid"] is False
    assert any("max daily loss limit" in v for v in res["violations"])

def test_technical_engine_ema_and_rsi():
    prices = [2600.0 + i * 2.0 for i in range(30)]
    ema20 = TechnicalEngine.calculate_ema(prices, 20)
    assert len(ema20) == 30
    assert ema20[-1] is not None
    # Price is in strong monotonic uptrend, latest price > EMA20
    assert prices[-1] > ema20[-1]
    
    rsi = TechnicalEngine.calculate_rsi(prices, 14)
    assert len(rsi) == 30
    assert rsi[-1] > 80.0  # Consistently rising prices result in elevated RSI

def test_verdict_engine_news_lockout():
    structure = {"trend": "BULLISH", "structure": "HIGHER_HIGHS", "confidence": 80}
    macro_res = {"score": 55.0, "verdict": "MODERATELY_BULLISH"}
    nearest_liq = [{"price": 2660.0, "category": "RESISTANCE", "label": "PDH"}]
    upcoming_event = {"title": "US Core CPI", "minutes_until": 8}
    
    verdict = VerdictEngine.generate_verdict(
        tech_structure=structure,
        macro_result=macro_res,
        nearest_liquidity=nearest_liq,
        upcoming_high_impact_event=upcoming_event,
        current_spread=2.0,
        is_news_blackout=True
    )
    
    assert verdict["is_lockout"] is True
    assert verdict["directional_bias"] == "STAND_ASIDE"
    assert "Avoid trading due to news" in verdict["best_action_now"]
    assert verdict["risk_environment"] == "EXTREME"
