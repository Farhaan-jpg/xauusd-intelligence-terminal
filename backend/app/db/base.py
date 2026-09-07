from app.core.database import Base
from app.db.models.models import (
    User,
    UserPreferences,
    BrokerProfile,
    RiskProfile,
    MarketQuote,
    OhlcvCandle,
    TechnicalSnapshot,
    LiquidityLevel,
    MacroObservation,
    EconomicEvent,
    NewsItem,
    Alert,
    AlertDelivery,
    TradePlan,
    JournalTrade,
    PerformanceSnapshot,
    AiConversation,
    DataSourceStatus,
    AuditLog
)

def init_db(engine):
    Base.metadata.create_all(bind=engine)
