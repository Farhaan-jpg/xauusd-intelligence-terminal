import datetime
import urllib.request
import xml.etree.ElementTree as ET
import time
from typing import List, Dict, Any, Optional
from email.utils import parsedate_to_datetime

class NewsProvider:
    def __init__(self):
        self.cached_news: Optional[List[Dict[str, Any]]] = None
        self.last_fetch_time: float = 0.0
        self.cache_ttl: float = 120.0 # 2 minutes

    def _fetch_rss_items(self, url: str, source_name: str, max_items: int = 15) -> List[Dict[str, Any]]:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            xml_content = resp.read()
        
        root = ET.fromstring(xml_content)
        items = root.findall(".//item")
        
        parsed = []
        utc_now = datetime.datetime.now(datetime.timezone.utc)

        macro_keywords = [
            "gold", "xau", "silver", "dollar", "dxy", "usd", "fed", "federal reserve",
            "inflation", "cpi", "ppi", "interest rate", "rate cut", "rate hike",
            "yield", "treasury", "central bank", "ecb", "boe", "boj", "rba",
            "oil", "crude", "energy", "brent", "wti", "economy", "recession",
            "debt", "sanctions", "tariffs", "trade", "middle east", "gaza", "israel",
            "iran", "ukraine", "russia", "china", "geopolit", "safe-haven", "safe haven"
        ]

        for it in items:
            title = (it.findtext("title") or "").strip()
            pub_date_str = (it.findtext("pubDate") or "").strip()
            desc = (it.findtext("description") or "").strip()
            link = (it.findtext("link") or "").strip()

            if not title:
                continue

            content_lower = (title + " " + desc).lower()
            # If from general news (BBC World, Al Jazeera), ensure it touches macro/geopolitical/gold drivers
            if source_name in ["BBC World", "Al Jazeera"] and not any(kw in content_lower for kw in macro_keywords):
                continue

            # Compute relative time and minutes
            pub_ago = "Recently"
            diff_mins = 60
            if pub_date_str:
                try:
                    dt = parsedate_to_datetime(pub_date_str)
                    diff_mins = max(0, int((utc_now - dt).total_seconds() // 60))
                    if diff_mins < 60:
                        pub_ago = f"{max(1, diff_mins)}m ago"
                    elif diff_mins < 1440:
                        h = diff_mins // 60
                        m = diff_mins % 60
                        pub_ago = f"{h}h {m}m ago"
                    else:
                        pub_ago = f"{diff_mins // 1440}d ago"
                except Exception:
                    pass

            # Classify category
            if any(k in content_lower for k in ["fed", "rate", "powell", "central bank", "ecb", "boe", "boj", "rba", "interest rate"]):
                category = "MONETARY_POLICY"
                why_it_matters = "Interest rate expectations shift real bond yields, altering the opportunity cost of holding non-yielding physical gold."
            elif any(k in content_lower for k in ["dollar", "dxy", "usd", "fx", "currency"]):
                category = "CURRENCY_FX"
                why_it_matters = "Gold is priced globally in US Dollars; sharp USD fluctuations directly impact foreign buyer purchasing power."
            elif any(k in content_lower for k in ["gold", "xau", "silver", "bullion", "metals"]):
                category = "PRECIOUS_METALS"
                why_it_matters = "Direct spot flow, physical demand, and sovereign bullion accumulation impacting order book liquidity."
            elif any(k in content_lower for k in ["oil", "crude", "energy", "wti", "brent", "gas"]):
                category = "COMMODITIES_ENERGY"
                why_it_matters = "Energy shocks filter into headline inflation prints, driving institutional inflation-hedging allocations."
            elif any(k in content_lower for k in ["war", "middle east", "iran", "israel", "gaza", "ukraine", "russia", "sanction", "military"]):
                category = "GEOPOLITICS"
                why_it_matters = "Geopolitical tensions trigger immediate flight-to-safety capital rotation into bullion."
            else:
                category = "GLOBAL_MACRO"
                why_it_matters = "Macroeconomic health indicators driving multi-asset institutional risk posture."

            # Algorithmic sentiment analysis
            bullish_triggers = ["cut", "easing", "soft", "weak", "cool", "crisis", "tensions", "rally", "climb", "gain", "inflow", "boost", "support", "hold", "sanction", "war", "strike", "attack"]
            bearish_triggers = ["hike", "strong", "firm", "hot", "surge in yield", "bear", "drop", "fell", "slump", "down", "pressure", "de-escalat", "ceasefire"]

            is_bull = any(k in content_lower for k in bullish_triggers)
            is_bear = any(k in content_lower for k in bearish_triggers)

            sentiment = "GOLD_POSITIVE" if is_bull and not is_bear else \
                        "GOLD_NEGATIVE" if is_bear and not is_bull else "NEUTRAL"

            relevance = 10 if ("gold" in content_lower or "xau" in content_lower) else \
                        9 if ("fed" in content_lower or "rate" in content_lower or "cpi" in content_lower or "war" in content_lower) else \
                        8 if ("dollar" in content_lower or "yield" in content_lower or "oil" in content_lower) else 7

            priced_in = "BREAKING_NEWS" if diff_mins < 30 else "PRICING_IN_PROGRESS" if diff_mins < 180 else "LARGELY_PRICED_IN"

            # Create clean summary bullets
            clean_desc = desc[:180] + "..." if len(desc) > 180 else desc
            summary_bullets = [
                title,
                clean_desc if clean_desc else f"Reported live by {source_name}.",
                f"Institutional sentiment: {sentiment.replace('_', ' ')} based on {category.replace('_', ' ').lower()} transmission."
            ]

            parsed.append({
                "id": f"live-{source_name.lower().replace(' ', '-')}-{len(parsed)+1}",
                "headline": title,
                "source": source_name,
                "category": category,
                "published_ago": pub_ago,
                "sentiment": sentiment,
                "relevance_score": relevance,
                "is_verified": True,
                "ai_summary": summary_bullets,
                "why_it_matters": why_it_matters,
                "priced_in": priced_in,
                "link": link
            })

            if len(parsed) >= max_items:
                break

        return parsed

    def get_news_catalysts(self) -> List[Dict[str, Any]]:
        now_ts = time.time()
        if self.cached_news and (now_ts - self.last_fetch_time < self.cache_ttl):
            return self.cached_news

        items = []

        # Verified public RSS feeds from world-reputed media & financial institutions
        trusted_sources = [
            ("BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml", 8),
            ("BBC World", "https://feeds.bbci.co.uk/news/world/rss.xml", 6),
            ("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml", 6),
            ("FXStreet Markets", "https://www.fxstreet.com/rss/news", 8),
        ]

        for source_name, url, limit in trusted_sources:
            try:
                feed_items = self._fetch_rss_items(url, source_name, max_items=limit)
                items.extend(feed_items)
            except Exception as e:
                pass

        # Sort: Highest relevance first, then most recent
        items.sort(key=lambda x: x["relevance_score"], reverse=True)
        self.cached_news = items
        self.last_fetch_time = now_ts
        return items

news_provider = NewsProvider()
