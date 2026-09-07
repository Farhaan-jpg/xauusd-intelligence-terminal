from fastapi import APIRouter
from app.providers.news_provider import news_provider

router = APIRouter()

@router.get("/catalysts")
def get_news_catalysts():
    return news_provider.get_news_catalysts()
