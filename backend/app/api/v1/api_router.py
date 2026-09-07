from fastapi import APIRouter
from app.api.v1.endpoints import (
    market,
    technicals,
    liquidity,
    macro,
    calendar,
    news,
    planner,
    journal,
    alerts,
    settings,
    ai_analyst,
    health
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(market.router, prefix="/market", tags=["Market Data"])
api_router.include_router(technicals.router, prefix="/technicals", tags=["Technicals"])
api_router.include_router(liquidity.router, prefix="/liquidity", tags=["Liquidity Radar"])
api_router.include_router(macro.router, prefix="/macro", tags=["Macro & Drivers"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["Economic Calendar"])
api_router.include_router(news.router, prefix="/news", tags=["News & Catalysts"])
api_router.include_router(planner.router, prefix="/planner", tags=["Trade Planner"])
api_router.include_router(journal.router, prefix="/journal", tags=["Trade Journal"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(ai_analyst.router, prefix="/ai", tags=["AI Analyst"])
