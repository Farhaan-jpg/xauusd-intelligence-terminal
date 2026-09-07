from fastapi import APIRouter
from app.providers.calendar_provider import calendar_provider

router = APIRouter()

@router.get("/events")
def get_calendar_events():
    return calendar_provider.get_calendar_events()

@router.get("/lockout")
def get_lockout_status():
    return calendar_provider.get_lockout_status()
