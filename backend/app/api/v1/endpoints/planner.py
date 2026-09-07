from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.engines.risk_engine import RiskEngine
from app.db.models.models import TradePlan

router = APIRouter()

class CalculateRiskRequest(BaseModel):
    account_balance: float = Field(10000.0, ge=100.0)
    risk_pct: float = Field(1.0, ge=0.1, le=10.0)
    fixed_risk_amount: Optional[float] = 0.0
    entry_price: float = Field(..., gt=0.0)
    stop_loss: float = Field(..., gt=0.0)
    take_profit_1: float = Field(..., gt=0.0)
    take_profit_2: Optional[float] = None
    contract_size: float = 100.0
    tick_size: float = 0.01
    tick_value: float = 1.00
    spread_points: float = 1.8
    commission_per_lot: float = 6.0
    slippage_points: float = 1.0
    atr_value: float = 8.50
    today_loss_so_far: float = 0.0
    max_daily_loss_pct: float = 3.0
    today_trades_count: int = 0
    max_daily_trades: int = 5

class SavePlanRequest(BaseModel):
    name: str = "Intraday Pullback Setup"
    direction: str
    entry_price: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: Optional[float] = None
    lot_size: float
    cash_at_risk: float
    effective_risk_with_costs: float
    rr_ratio: float
    breakeven_win_rate: float
    checklist_answers: Dict[str, bool] = {}

@router.post("/calculate")
def calculate_trade_risk(req: CalculateRiskRequest):
    result = RiskEngine.calculate_position_size(
        account_balance=req.account_balance,
        risk_pct=req.risk_pct,
        fixed_risk_amount=req.fixed_risk_amount,
        entry_price=req.entry_price,
        stop_loss=req.stop_loss,
        take_profit_1=req.take_profit_1,
        take_profit_2=req.take_profit_2,
        contract_size=req.contract_size,
        tick_size=req.tick_size,
        tick_value=req.tick_value,
        spread_points=req.spread_points,
        commission_per_lot=req.commission_per_lot,
        slippage_points=req.slippage_points,
        atr_value=req.atr_value,
        today_loss_so_far=req.today_loss_so_far,
        max_daily_loss_pct=req.max_daily_loss_pct,
        today_trades_count=req.today_trades_count,
        max_daily_trades=req.max_daily_trades
    )
    return result

@router.post("/save")
def save_trade_plan(req: SavePlanRequest, db: Session = Depends(get_db)):
    plan = TradePlan(
        user_id=1,
        name=req.name,
        direction=req.direction,
        entry_price=req.entry_price,
        stop_loss=req.stop_loss,
        take_profit_1=req.take_profit_1,
        take_profit_2=req.take_profit_2,
        lot_size=req.lot_size,
        cash_at_risk=req.cash_at_risk,
        effective_risk_with_costs=req.effective_risk_with_costs,
        rr_ratio=req.rr_ratio,
        breakeven_win_rate=req.breakeven_win_rate,
        checklist_json=req.checklist_answers,
        status="PLANNED"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"status": "success", "plan_id": plan.id}

@router.get("/plans")
def list_trade_plans(db: Session = Depends(get_db)):
    plans = db.query(TradePlan).order_by(TradePlan.created_at.desc()).limit(20).all()
    return plans
