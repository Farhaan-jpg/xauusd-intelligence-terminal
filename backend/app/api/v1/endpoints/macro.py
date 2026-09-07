from fastapi import APIRouter
from app.providers.macro_provider import macro_provider
from app.engines.macro_engine import MacroEngine

router = APIRouter()

@router.get("/drivers")
def get_drivers():
    return macro_provider.get_macro_drivers()

@router.get("/score")
def get_score():
    drivers = macro_provider.get_macro_drivers()
    return MacroEngine.evaluate_macro_bias(drivers)
