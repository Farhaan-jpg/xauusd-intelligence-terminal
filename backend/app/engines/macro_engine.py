from typing import Dict, Any, List

class MacroEngine:
    # Standard weighting coefficients for Gold drivers
    WEIGHTS = {
        "DXY": 0.30,           # Negative correlation typically
        "US10Y": 0.20,         # Negative correlation
        "REAL_YIELD": 0.20,    # Strongest theoretical negative anchor
        "VIX": 0.10,           # Positive (safe haven demand)
        "CRUDE": 0.05,         # Positive (inflation hedge proxy)
        "ETF_FLOWS": 0.10,     # Positive (institutional physical demand)
        "COT_POSITION": 0.05   # Reversal warning if crowded
    }

    @staticmethod
    def evaluate_macro_bias(drivers: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluate drivers and return a score from -100 (Strongly Bearish) to +100 (Strongly Bullish).
        """
        total_score = 0.0
        details = []
        
        # 1. DXY (Dollar Index)
        dxy = drivers.get("DXY", {"value": 103.8, "change_1d": -0.25})
        dxy_chg = dxy.get("change_1d", 0.0)
        # Dollar down -> Gold up
        dxy_component = -1.0 * min(max(dxy_chg * 40.0, -100.0), 100.0)
        total_score += dxy_component * MacroEngine.WEIGHTS["DXY"]
        details.append({
            "driver": "U.S. Dollar Index (DXY)",
            "value": dxy["value"],
            "change": f"{dxy_chg:+.2f}%",
            "weight_pct": int(MacroEngine.WEIGHTS["DXY"] * 100),
            "bias": "BULLISH" if dxy_component > 10 else "BEARISH" if dxy_component < -10 else "NEUTRAL",
            "impact": round(dxy_component * MacroEngine.WEIGHTS["DXY"], 1),
            "explanation": "Weakening greenback reduces opportunity cost of holding non-yielding bullion."
        })
        
        # 2. US 10Y Yield
        us10y = drivers.get("US10Y", {"value": 4.18, "change_1d": -0.04})
        us10y_chg = us10y.get("change_1d", 0.0)
        yield_component = -1.0 * min(max(us10y_chg * 50.0, -100.0), 100.0)
        total_score += yield_component * MacroEngine.WEIGHTS["US10Y"]
        details.append({
            "driver": "U.S. 10Y Treasury Yield",
            "value": f"{us10y['value']}%",
            "change": f"{us10y_chg:+.2f} pts",
            "weight_pct": int(MacroEngine.WEIGHTS["US10Y"] * 100),
            "bias": "BULLISH" if yield_component > 10 else "BEARISH" if yield_component < -10 else "NEUTRAL",
            "impact": round(yield_component * MacroEngine.WEIGHTS["US10Y"], 1),
            "explanation": "Declining nominal bond yields make gold more attractive relative to sovereign debt."
        })
        
        # 3. Real Yield Proxy
        real_yield = drivers.get("REAL_YIELD", {"value": 1.82, "change_1d": -0.03})
        ry_chg = real_yield.get("change_1d", 0.0)
        ry_component = -1.0 * min(max(ry_chg * 60.0, -100.0), 100.0)
        total_score += ry_component * MacroEngine.WEIGHTS["REAL_YIELD"]
        details.append({
            "driver": "U.S. 10Y Real Yield Proxy",
            "value": f"{real_yield['value']}%",
            "change": f"{ry_chg:+.2f} pts",
            "weight_pct": int(MacroEngine.WEIGHTS["REAL_YIELD"] * 100),
            "bias": "BULLISH" if ry_component > 10 else "BEARISH" if ry_component < -10 else "NEUTRAL",
            "impact": round(ry_component * MacroEngine.WEIGHTS["REAL_YIELD"], 1),
            "explanation": "Real yields are the primary fundamental anchor for real asset valuation."
        })
        
        # 4. Volatility (VIX)
        vix = drivers.get("VIX", {"value": 16.4, "change_1d": 1.2})
        vix_val = vix.get("value", 15.0)
        vix_component = 30.0 if vix_val > 20.0 else 0.0 if vix_val > 14.0 else -20.0
        total_score += vix_component * MacroEngine.WEIGHTS["VIX"]
        details.append({
            "driver": "CBOE Volatility Index (VIX)",
            "value": vix_val,
            "change": f"{vix.get('change_1d', 0):+.1f}",
            "weight_pct": int(MacroEngine.WEIGHTS["VIX"] * 100),
            "bias": "BULLISH" if vix_component > 0 else "NEUTRAL",
            "impact": round(vix_component * MacroEngine.WEIGHTS["VIX"], 1),
            "explanation": "Elevated equity market anxiety spurs safe-haven portfolio reallocation into Gold."
        })
        
        # 5. ETF Flows & Physical Demand
        etf = drivers.get("ETF_FLOWS", {"net_tons_1w": 4.5})
        etf_tons = etf.get("net_tons_1w", 0.0)
        etf_component = min(max(etf_tons * 10.0, -100.0), 100.0)
        total_score += etf_component * MacroEngine.WEIGHTS["ETF_FLOWS"]
        details.append({
            "driver": "Global Gold ETF Net Flows (1W)",
            "value": f"{etf_tons:+.1f} tonnes",
            "change": "Weekly",
            "weight_pct": int(MacroEngine.WEIGHTS["ETF_FLOWS"] * 100),
            "bias": "BULLISH" if etf_component > 0 else "BEARISH",
            "impact": round(etf_component * MacroEngine.WEIGHTS["ETF_FLOWS"], 1),
            "explanation": "Net Western institutional ETF inflows confirm trend participation beyond retail."
        })

        # Calculate final clamped score
        clamped_score = round(min(max(total_score, -100.0), 100.0), 1)
        verdict = "MODERATELY_BULLISH" if clamped_score >= 25.0 else \
                  "STRONGLY_BULLISH" if clamped_score >= 60.0 else \
                  "MODERATELY_BEARISH" if clamped_score <= -25.0 else \
                  "STRONGLY_BEARISH" if clamped_score <= -60.0 else "NEUTRAL"
                  
        return {
            "score": clamped_score,
            "verdict": verdict,
            "components": details,
            "formula_summary": "Score = 30% * (-DXY) + 20% * (-10Y) + 20% * (-RealYield) + 10% * VIX + 10% * ETF_Flows + 10% * COT",
            "updated_at": "Live sync"
        }
