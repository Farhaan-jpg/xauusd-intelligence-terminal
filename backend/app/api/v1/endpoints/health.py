from fastapi import APIRouter
import datetime

router = APIRouter()

@router.get("/health")
def health_check():
    """Keep-alive ping endpoint designed for free cron pinging (cron-job.org / GitHub Actions)."""
    return {
        "status": "healthy",
        "service": "XAUUSD Intelligence Terminal",
        "timestamp_utc": datetime.datetime.utcnow().isoformat(),
        "free_tier_keepalive": True,
        "mode": "100% Free Hosting Active"
    }
