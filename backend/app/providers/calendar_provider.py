import datetime
from typing import List, Dict, Any
import pytz

class CalendarProvider:
    def __init__(self):
        # Anchor dynamic events relative to current time for interactive demonstrations
        now = datetime.datetime.now(datetime.timezone.utc)
        self.events_schedule = [
            {
                "id": "cal-01",
                "title": "US Core CPI m/m",
                "country": "USD",
                "offset_minutes": 145, # ~2.5 hours away
                "importance": "CRITICAL",
                "forecast": "0.3%",
                "previous": "0.3%",
                "actual": None,
                "historical_5m_pips": 42.0,
                "historical_15m_pips": 78.5,
                "historical_1h_pips": 110.0,
                "impact_explanation": "Higher CPI print drives Fed rate hike fears, boosting yields/DXY and pressuring Gold. Soft print fuels aggressive Gold rally."
            },
            {
                "id": "cal-02",
                "title": "Initial Jobless Claims",
                "country": "USD",
                "offset_minutes": 520,
                "importance": "HIGH",
                "forecast": "218K",
                "previous": "222K",
                "actual": None,
                "historical_5m_pips": 18.0,
                "historical_15m_pips": 32.0,
                "historical_1h_pips": 45.0,
                "impact_explanation": "Labor market resilience gauge. Claims above forecast indicate cooling labor market, supportive for rate cut expectations."
            },
            {
                "id": "cal-03",
                "title": "FOMC Meeting Rate Decision",
                "country": "USD",
                "offset_minutes": 1440, # 24h away
                "importance": "CRITICAL",
                "forecast": "4.75%",
                "previous": "5.00%",
                "actual": None,
                "historical_5m_pips": 85.0,
                "historical_15m_pips": 140.0,
                "historical_1h_pips": 210.0,
                "impact_explanation": "Primary global monetary benchmark. Statement tone and Dot Plot projections directly dictate medium-term Gold trend."
            },
            {
                "id": "cal-04",
                "title": "Non-Farm Payrolls (NFP)",
                "country": "USD",
                "offset_minutes": 2880, # 48h away
                "importance": "CRITICAL",
                "forecast": "175K",
                "previous": "142K",
                "actual": None,
                "historical_5m_pips": 65.0,
                "historical_15m_pips": 115.0,
                "historical_1h_pips": 180.0,
                "impact_explanation": "Massive market mover. NFP beat sparks aggressive USD rally; missed print triggers explosive safe-haven and rate-cut bid."
            },
            {
                "id": "cal-05",
                "title": "ISM Services PMI",
                "country": "USD",
                "offset_minutes": 4320,
                "importance": "HIGH",
                "forecast": "53.2",
                "previous": "52.8",
                "actual": None,
                "historical_5m_pips": 22.0,
                "historical_15m_pips": 38.0,
                "historical_1h_pips": 55.0,
                "impact_explanation": "Measures vitality in 75%+ of US economy. Numbers below 50.0 (contraction) increase recession risks and stimulate bullion buying."
            }
        ]

    def get_calendar_events(self) -> List[Dict[str, Any]]:
        utc_now = datetime.datetime.now(datetime.timezone.utc)
        ist_tz = pytz.timezone("Asia/Kolkata")
        
        events = []
        for e in self.events_schedule:
            event_time_utc = utc_now + datetime.timedelta(minutes=e["offset_minutes"])
            event_time_ist = event_time_utc.astimezone(ist_tz)
            
            # Format countdown
            mins = e["offset_minutes"]
            if mins > 0:
                h = mins // 60
                m = mins % 60
                countdown_str = f"in {h:02d}h {m:02d}m" if h > 0 else f"in {m:02d}m"
            else:
                countdown_str = "Released"
                
            events.append({
                "id": e["id"],
                "title": e["title"],
                "country": e["country"],
                "importance": e["importance"],
                "time_utc": event_time_utc.strftime("%Y-%m-%d %H:%M UTC"),
                "time_ist": event_time_ist.strftime("%d %b, %I:%M %p IST"),
                "forecast": e["forecast"],
                "previous": e["previous"],
                "actual": e["actual"],
                "minutes_until": mins,
                "countdown": countdown_str,
                "historical_pips": {
                    "avg_5m": e["historical_5m_pips"],
                    "avg_15m": e["historical_15m_pips"],
                    "avg_1h": e["historical_1h_pips"]
                },
                "impact_explanation": e["impact_explanation"]
            })
            
        events.sort(key=lambda x: x["minutes_until"])
        return events

    def get_lockout_status(self, window_minutes: int = 15) -> Dict[str, Any]:
        """Evaluates whether the user is in a news blackout period (±15m to High/Critical event)."""
        events = self.get_calendar_events()
        for e in events:
            if e["importance"] in ("HIGH", "CRITICAL"):
                mins = e["minutes_until"]
                # If event is within 15 minutes before or within 15 minutes after (if negative)
                if -window_minutes <= mins <= window_minutes:
                    return {
                        "is_locked_out": True,
                        "severity": "CRITICAL_LOCKOUT",
                        "event_title": e["title"],
                        "minutes_remaining": mins,
                        "warning": f"NEWS LOCKOUT ACTIVE: '{e['title']}' is occurring within ±{window_minutes} minutes. High risk of spread expansion and severe slippage. Avoid placing new orders."
                    }
                    
        next_event = next((e for e in events if e["importance"] in ("HIGH", "CRITICAL") and e["minutes_until"] > 0), None)
        return {
            "is_locked_out": False,
            "severity": "CLEAR",
            "next_event": next_event["title"] if next_event else "No tier-1 events today",
            "minutes_to_next": next_event["minutes_until"] if next_event else 999,
            "warning": "Market environment clear of immediate tier-1 scheduled news spikes."
        }

calendar_provider = CalendarProvider()
