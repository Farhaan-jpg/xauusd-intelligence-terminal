import datetime
from typing import List, Dict, Any

class NewsProvider:
    def get_news_catalysts(self) -> List[Dict[str, Any]]:
        now = datetime.datetime.now(datetime.timezone.utc)
        
        items = [
            {
                "id": "news-101",
                "headline": "Fed Officials Signal Preference for Gradual Rate Reductions Amid Cooling Wage Pressures",
                "source": "Bloomberg Markets",
                "category": "MONETARY_POLICY",
                "published_ago": "24 minutes ago",
                "sentiment": "GOLD_POSITIVE",
                "relevance_score": 9,
                "is_verified": True,
                "ai_summary": [
                    "Policymakers express satisfaction with labor market deceleration towards balanced trend.",
                    "Implied expectations for 25 bps cuts at consecutive meetings firm to 88%.",
                    "Treasury 2-year yield slips 4 bps following comments."
                ],
                "why_it_matters": "Lower terminal interest rate expectations compress real borrowing costs, bolstering the investment case for physical non-yielding gold.",
                "priced_in": "PARTIALLY_PRICED_IN (Market anticipates 75 bps cuts through early next year)."
            },
            {
                "id": "news-102",
                "headline": "People's Bank of China Resumes Gold Reserve Accumulation for 2nd Consecutive Month",
                "source": "Reuters Financial",
                "category": "CENTRAL_BANKS",
                "published_ago": "1 hour ago",
                "sentiment": "GOLD_POSITIVE",
                "relevance_score": 10,
                "is_verified": True,
                "ai_summary": [
                    "PBOC officially reported adding 160,000 fine troy ounces to sovereign bullion reserves.",
                    "Sovereign reserve diversification away from dollar-denominated assets remains strategic priority.",
                    "Total official Chinese bullion reserves reach 72.96 million ounces."
                ],
                "why_it_matters": "Sovereign central-bank demand forms a structural price floor under Gold, absorbing private market supply regardless of price levels.",
                "priced_in": "NEW_CATALYST (Strong positive fundamental reinforcement for institutional dip buyers)."
            },
            {
                "id": "news-103",
                "headline": "US Dollar Index Hovers Near 2-Week Low Ahead of Critical Inflation Print",
                "source": "Financial Times",
                "category": "CURRENCY_FX",
                "published_ago": "2 hours ago",
                "sentiment": "GOLD_POSITIVE",
                "relevance_score": 8,
                "is_verified": True,
                "ai_summary": [
                    "DXY consolidates around 103.65 as currency traders pare long dollar positioning.",
                    "FX option volatility skews indicate defensive hedging into Thursday's CPI print.",
                    "Eur/Usd and Gbp/Usd maintaining firm intraday support."
                ],
                "why_it_matters": "Weakness in the dollar mechanically increases the affordability of gold for foreign institutional buyers trading in non-USD currencies.",
                "priced_in": "LARGELY_PRICED_IN"
            },
            {
                "id": "news-104",
                "headline": "Middle East Diplomatic Talks Make Progress on Maritime Ceasefire Framework",
                "source": "Associated Press",
                "category": "GEOPOLITICS",
                "published_ago": "3 hours ago",
                "sentiment": "GOLD_NEGATIVE",
                "relevance_score": 7,
                "is_verified": True,
                "ai_summary": [
                    "Regional mediators announce preliminary framework on shipping lanes de-escalation.",
                    "Brent crude futures declined 1.2% following the diplomatic briefing.",
                    "Safe-haven war premium in energy and precious metals slightly unwinding."
                ],
                "why_it_matters": "Geopolitical risk premium reduction can spark short-term intraday profit taking and pullbacks in Gold.",
                "priced_in": "EARLY_DEVELOPMENT (Requires tangible treaty signing to trigger deeper unwind)."
            }
        ]
        return items

news_provider = NewsProvider()
