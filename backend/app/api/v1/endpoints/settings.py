from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models.models import BrokerProfile, RiskProfile, UserPreferences

router = APIRouter()

class ProfileUpdate(BaseModel):
    broker_name: str = "Standard ECN Gold"
    contract_size: float = 100.0
    tick_size: float = 0.01
    tick_value: float = 1.00
    commission_per_lot: float = 6.00
    typical_spread: float = 1.8
    account_balance: float = 10000.0
    max_daily_loss_pct: float = 3.0
    max_trade_risk_pct: float = 1.0
    max_daily_trades: int = 5
    timezone: str = "Asia/Kolkata"
    theme: str = "dark-bloomberg"

@router.get("/profile")
def get_settings_profile(db: Session = Depends(get_db)):
    broker = db.query(BrokerProfile).filter(BrokerProfile.user_id == 1).first()
    if not broker:
        broker = BrokerProfile(user_id=1)
        db.add(broker)
        db.commit()
        db.refresh(broker)
        
    risk = db.query(RiskProfile).filter(RiskProfile.user_id == 1).first()
    if not risk:
        risk = RiskProfile(user_id=1)
        db.add(risk)
        db.commit()
        db.refresh(risk)
        
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == 1).first()
    if not prefs:
        prefs = UserPreferences(user_id=1)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
        
    return {
        "broker": {
            "broker_name": broker.broker_name,
            "contract_size": broker.contract_size,
            "tick_size": broker.tick_size,
            "tick_value": broker.tick_value,
            "commission_per_lot": broker.commission_per_lot,
            "typical_spread": broker.typical_spread,
            "swap_long": broker.swap_long,
            "swap_short": broker.swap_short
        },
        "risk": {
            "account_balance": risk.account_balance,
            "current_equity": risk.current_equity,
            "max_daily_loss_pct": risk.max_daily_loss_pct,
            "max_trade_risk_pct": risk.max_trade_risk_pct,
            "max_daily_trades": risk.max_daily_trades,
            "today_realized_loss": risk.today_realized_loss,
            "today_trades_count": risk.today_trades_count,
            "is_locked_out": risk.is_locked_out
        },
        "preferences": {
            "timezone": prefs.timezone,
            "theme": prefs.theme,
            "default_risk_pct": prefs.default_risk_pct,
            "sound_alerts_enabled": prefs.sound_alerts_enabled,
            "news_lockout_minutes": prefs.news_lockout_minutes
        },
        "demo_mode": True,
        "api_status": {
            "gold_feed": "Active (Simulated High-Res / YF)",
            "macro_feed": "Active (FRED / Stooq Proxy)",
            "calendar_feed": "Active (Internal High-Impact Feed)",
            "mode": "100% Free Tier Compliant"
        }
    }

@router.post("/profile")
def update_settings_profile(req: ProfileUpdate, db: Session = Depends(get_db)):
    broker = db.query(BrokerProfile).filter(BrokerProfile.user_id == 1).first()
    if broker:
        broker.broker_name = req.broker_name
        broker.contract_size = req.contract_size
        broker.tick_size = req.tick_size
        broker.tick_value = req.tick_value
        broker.commission_per_lot = req.commission_per_lot
        broker.typical_spread = req.typical_spread
        
    risk = db.query(RiskProfile).filter(RiskProfile.user_id == 1).first()
    if risk:
        risk.account_balance = req.account_balance
        risk.max_daily_loss_pct = req.max_daily_loss_pct
        risk.max_trade_risk_pct = req.max_trade_risk_pct
        risk.max_daily_trades = req.max_daily_trades
        
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == 1).first()
    if prefs:
        prefs.timezone = req.timezone
        prefs.theme = req.theme
        
    db.commit()
    return {"status": "success", "message": "Settings updated successfully."}
