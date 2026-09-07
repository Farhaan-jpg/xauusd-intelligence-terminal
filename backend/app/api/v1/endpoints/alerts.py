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

@router.get("/history")
def get_alert_history(db: Session = Depends(get_db)):
    # Return recent triggered notifications
    now = datetime.datetime.utcnow()
    return [
        {
            "id": 1,
            "type": "LIQUIDITY_SWEEP",
            "message": "Asia Session High ($2664.70) swept and rejected on 5m chart.",
            "timestamp": (now - datetime.timedelta(minutes=42)).isoformat(),
            "severity": "MEDIUM",
            "is_read": False
        },
        {
            "id": 2,
            "type": "NEWS_COUNTDOWN",
            "message": "US Core CPI scheduled in 145 minutes. News lockout alert will engage at T-15m.",
            "timestamp": (now - datetime.timedelta(minutes=75)).isoformat(),
            "severity": "HIGH",
            "is_read": True
        }
    ]
