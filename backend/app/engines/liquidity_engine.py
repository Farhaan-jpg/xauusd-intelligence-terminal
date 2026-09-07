from typing import List, Dict, Any

class LiquidityEngine:
    @staticmethod
    def identify_levels(
        current_price: float,
        candles: List[Dict[str, Any]],
        pdh: float,
        pdl: float,
        pwh: float,
        pwl: float,
        asia_high: float,
        asia_low: float,
        london_high: float,
        london_low: float
    ) -> List[Dict[str, Any]]:
        levels = []
        
        # Add Structural & Session Levels
        definitions = [
            {"price": pdh, "type": "PDH", "label": "Previous Day High", "strength": 85, "cat": "RESISTANCE"},
            {"price": pdl, "type": "PDL", "label": "Previous Day Low", "strength": 85, "cat": "SUPPORT"},
            {"price": pwh, "type": "PWH", "label": "Previous Week High", "strength": 92, "cat": "RESISTANCE"},
            {"price": pwl, "type": "PWL", "label": "Previous Week Low", "strength": 92, "cat": "SUPPORT"},
            {"price": asia_high, "type": "ASIA_H", "label": "Asia Session High", "strength": 78, "cat": "RESISTANCE"},
            {"price": asia_low, "type": "ASIA_L", "label": "Asia Session Low", "strength": 78, "cat": "SUPPORT"},
            {"price": london_high, "type": "LON_H", "label": "London Session High", "strength": 82, "cat": "RESISTANCE"},
            {"price": london_low, "type": "LON_L", "label": "London Session Low", "strength": 82, "cat": "SUPPORT"},
        ]
        
        # Add Psychological Round Numbers near current price
        base_round = round(current_price / 25.0) * 25.0
        round_levels = [
            base_round - 50.0,
            base_round - 25.0,
            base_round,
            base_round + 25.0,
            base_round + 50.0
        ]
        for rl in round_levels:
            definitions.append({
                "price": rl,
                "type": "PSYCH_ROUND",
                "label": f"${int(rl)} Psychological Barrier",
                "strength": 75 if rl % 50 == 0 else 65,
                "cat": "RESISTANCE" if rl > current_price else "SUPPORT"
            })
            
        # Look for Equal Highs / Equal Lows in recent candles
        eq_highs = []
        eq_lows = []
        if len(candles) >= 10:
            recent_highs = [c['high'] for c in candles[-30:]]
            recent_lows = [c['low'] for c in candles[-30:]]
            for i in range(len(recent_highs)):
                for j in range(i + 3, len(recent_highs)):
                    if abs(recent_highs[i] - recent_highs[j]) <= 0.35:
                        avg_p = round((recent_highs[i] + recent_highs[j]) / 2.0, 2)
                        eq_highs.append(avg_p)
                    if abs(recent_lows[i] - recent_lows[j]) <= 0.35:
                        avg_p = round((recent_lows[i] + recent_lows[j]) / 2.0, 2)
                        eq_lows.append(avg_p)
                        
        for eq_h in set(eq_highs[-2:]):
            definitions.append({
                "price": eq_h,
                "type": "EQ_HIGHS",
                "label": "Equal Highs Buy-Side Liquidity",
                "strength": 88,
                "cat": "RESISTANCE"
            })
            
        for eq_l in set(eq_lows[-2:]):
            definitions.append({
                "price": eq_l,
                "type": "EQ_LOWS",
                "label": "Equal Lows Sell-Side Liquidity",
                "strength": 88,
                "cat": "SUPPORT"
            })
            
        # Format and rank by distance to current price
        for item in definitions:
            dist = round(item['price'] - current_price, 2)
            dist_abs = abs(dist)
            pips = round(dist_abs * 10.0, 1) # 1 USD = 10 pips / 100 points
            status = "IMMINENT" if dist_abs <= 2.50 else "NEAR" if dist_abs <= 8.0 else "UNTESTED"
            levels.append({
                "price": item['price'],
                "type": item['type'],
                "label": item['label'],
                "category": item['cat'],
                "strength": item['strength'],
                "distance_usd": dist,
                "distance_pips": pips,
                "status": status,
                "notes": f"Inferred public structural zone. Distance: {dist:+.2f}$ ({pips} pips)."
            })
            
        # Sort by distance
        levels.sort(key=lambda x: abs(x['distance_usd']))
        return levels

    @staticmethod
    def detect_sweeps(candles: List[Dict[str, Any]], key_level: float, level_name: str) -> Dict[str, Any]:
        """Detect if price wicked beyond a level and closed back inside."""
        if len(candles) < 2:
            return {"swept": False}
        
        last = candles[-1]
        prev = candles[-2]
        
        # Bullish sweep (swept below level, reclaimed)
        if (last['low'] < key_level or prev['low'] < key_level) and last['close'] > key_level:
            return {
                "swept": True,
                "direction": "BULLISH_SWEEP_AND_RECLAIM",
                "level_name": level_name,
                "level_price": key_level,
                "description": f"Price swept below {level_name} ({key_level}) and reclaimed. High liquidity purge event."
            }
            
        # Bearish sweep (swept above level, rejected back down)
        if (last['high'] > key_level or prev['high'] > key_level) and last['close'] < key_level:
            return {
                "swept": True,
                "direction": "BEARISH_SWEEP_AND_REJECT",
                "level_name": level_name,
                "level_price": key_level,
                "description": f"Price swept above {level_name} ({key_level}) and failed to hold. Sellers active above level."
            }
            
        return {"swept": False}
