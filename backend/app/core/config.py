import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "XAUUSD Intelligence Terminal"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "xauusd-intel-terminal-secret-key-3.14")
    
    # Environment & Free Hosting
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "t")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Timezone: Default IST (Asia/Kolkata)
    DEFAULT_TIMEZONE: str = os.getenv("TIMEZONE", "Asia/Kolkata")
    
    # Database: SQLite default for 100% free Render persistence, PostgreSQL supported
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./terminal.db")
    
    # Risk Engine Defaults
    DEFAULT_CONTRACT_SIZE: float = 100.0  # 100 oz per standard lot
    DEFAULT_TICK_SIZE: float = 0.01       # 1 cent
    DEFAULT_TICK_VALUE: float = 1.00      # $1 per 0.01 move on 1.0 standard lot
    DEFAULT_MAX_DAILY_LOSS_PCT: float = 3.0
    DEFAULT_MAX_TRADE_RISK_PCT: float = 1.0
    DEFAULT_MAX_DAILY_TRADES: int = 5
    
    # News Blackout Window (minutes before and after high-impact events)
    NEWS_LOCKOUT_WINDOW_MINUTES: int = 15
    
    # Data Staleness Threshold (seconds)
    STALE_DATA_THRESHOLD_SECONDS: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
