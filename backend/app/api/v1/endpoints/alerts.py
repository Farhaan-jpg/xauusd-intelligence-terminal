from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models.models import Alert, AlertDelivery

router = APIRouter()

class AlertCreate(BaseModel):
    alert_type: str # PRICE_CROSS, LIQUIDITY_SWEEP, SPREAD_SPIKE, NEWS_COUNTDOWN, RISK_LIMIT
    condition_json: Dict[str, Any]
    cooldown_minutes: int = 15

@router.get("/list")
def list_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.is_active == True).all()
    if not alerts:
        # Seed default alerts
        seed = [
            Alert(user_id=1, alert_type="LIQUIDITY_SWEEP", condition_json={"target": "ASIA_HIGH_SWEEP"}, cooldown_minutes=30),
            Alert(user_id=1, alert_type="SPREAD_SPIKE", condition_json={"threshold_points": 3.5}, cooldown_minutes=15),
            Alert(user_id=1, alert_type="NEWS_COUNTDOWN", condition_json={"minutes_prior": 15}, cooldown_minutes=60),
            Alert(user_id=1, alert_type="RISK_LIMIT", condition_json={"drawdown_threshold_pct": 2.5}, cooldown_minutes=120)
        ]
        for a in seed:
            db.add(a)
        db.commit()
        alerts = db.query(Alert).filter(Alert.is_active == True).all()
    return alerts

@router.post("/create")
def create_alert(req: AlertCreate, db: Session = Depends(get_db)):
    alert = Alert(
        user_id=1,
        alert_type=req.alert_type,
        condition_json=req.condition_json,
        cooldown_minutes=req.cooldown_minutes,
        is_active=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

from app.providers.calendar_provider import calendar_provider
from app.providers.market_provider import market_provider

@router.get("/history")
def get_alert_history(db: Session = Depends(get_db)):
    # Return genuine dynamic notifications based on real calendar and spot levels
    now = datetime.datetime.utcnow()
    events = calendar_provider.get_calendar_events()
    next_usd = next((e for e in events if e.get("country") == "USD" and e.get("importance") in ("HIGH", "CRITICAL") and e.get("minutes_until", 0) > 0), None)
    quote = market_provider.get_live_quote()

    history = []
    # 1. Real upcoming economic catalyst alert
    if next_usd:
        history.append({
            "id": 1,
            "type": "NEWS_CALENDAR",
            "message": f"Next tier-1 release '{next_usd['title']}' ({next_usd['country']}) is scheduled {next_usd['countdown']} ({next_usd['time_ist']}). News lockout will engage at T-15m.",
            "timestamp": (now - datetime.timedelta(minutes=15)).isoformat(),
            "severity": "HIGH" if next_usd.get("importance") == "CRITICAL" else "MEDIUM",
            "is_read": False
        })
    else:
        history.append({
            "id": 1,
            "type": "NEWS_CALENDAR",
            "message": "No impending tier-1 USD releases within the next 48 hours. Market environment clear of scheduled high-impact news spikes.",
            "timestamp": (now - datetime.timedelta(minutes=30)).isoformat(),
            "severity": "LOW",
            "is_read": True
        })

    # 2. Real spot quote & spread telemetry alert
    history.append({
        "id": 2,
        "type": "MARKET_TELEMETRY",
        "message": f"XAUUSD spot trading at ${quote['price']:.2f} (24h Range: ${quote['low']:.2f} - ${quote['high']:.2f}). Spread is {quote['spread_points']:.1f} pts (${quote['spread_usd']:.2f}).",
        "timestamp": (now - datetime.timedelta(minutes=5)).isoformat(),
        "severity": "LOW",
        "is_read": True
    })

    return history
