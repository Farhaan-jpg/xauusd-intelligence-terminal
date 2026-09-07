from typing import Dict, Any, List

class VerdictEngine:
    @staticmethod
    def generate_verdict(
        tech_structure: Dict[str, Any],
        macro_result: Dict[str, Any],
        nearest_liquidity: List[Dict[str, Any]],
        upcoming_high_impact_event: Dict[str, Any],
        current_spread: float,
        is_news_blackout: bool = False
    ) -> Dict[str, Any]:
        """
        Synthesizes technical, liquidity, macro, and news signals into an institutional executive verdict.
        """
        trend = tech_structure.get("trend", "NEUTRAL")
        structure = tech_structure.get("structure", "RANGE")
        tech_confidence = tech_structure.get("confidence", 70)
        
        macro_score = macro_result.get("score", 0.0)
        macro_verdict = macro_result.get("verdict", "NEUTRAL")
        
        # News Event Risk Check
        if is_news_blackout or (upcoming_high_impact_event and upcoming_high_impact_event.get("minutes_until", 999) <= 15):
            event_name = upcoming_high_impact_event.get("title", "High-Impact Release") if upcoming_high_impact_event else "High-Impact Event"
            return {
                "directional_bias": "STAND_ASIDE",
                "market_regime": "HIGH_IMPACT_NEWS_LOCKOUT",
                "conviction_score": 15,
                "confidence_band": "LOW",
                "volatility_score": 95,
                "risk_environment": "EXTREME",
                "one_sentence_thesis": f"High-impact catalyst '{event_name}' imminent. Spread expansion and slippage risks make capital preservation paramount.",
                "supporting_factors": [
                    f"Scheduled tier-1 economic release within lockout window.",
                    "Institutional order books typically thin out 10-15m prior to major prints.",
                    "Slippage risk renders technical stop losses non-linear."
                ],
                "invalidation_factors": [
                    "Event passes and post-release 5-minute volatility stabilizes.",
                    "Bid-ask spread contracts back to normal baseline (under 2.5 points).",
                    "Clear post-news market structure established on 5m chart."
                ],
                "what_changes_mind": "Wait 15 minutes after official release numbers settle before seeking technical re-entry.",
                "best_action_now": "Avoid trading due to news",
                "is_lockout": True
            }

        # Synthesize Directional Bias
        # Technical weight: 55%, Macro weight: 45%
        tech_score = 65.0 if trend == "BULLISH" else -65.0 if trend == "BEARISH" else 0.0
        combined_score = (tech_score * 0.55) + (macro_score * 0.45)
        
        if combined_score >= 30.0:
            bias = "BULLISH"
            action = "Favor pullback setups" if structure == "HIGHER_HIGHS_HIGHER_LOWS" else "Favor breakout confirmation"
        elif combined_score <= -30.0:
            bias = "BEARISH"
            action = "Favor rally-fade setups" if structure == "LOWER_HIGHS_LOWER_LOWS" else "Favor breakdown confirmation"
        elif abs(combined_score) < 15.0:
            bias = "NEUTRAL"
            action = "Favor range setups or stand aside"
        else:
            bias = "MIXED_WAIT"
            action = "Wait for higher-timeframe confirmation"

        # Calculate conviction score (0-100)
        conviction = min(max(int(abs(combined_score) * 1.1 + (tech_confidence * 0.2)), 10), 95)
        conf_band = "HIGH" if conviction >= 75 else "MODERATE" if conviction >= 50 else "LOW"
        
        # Market Regime
        if current_spread > 4.0:
            regime = "ILLIQUID_WIDE_SPREAD"
            risk_env = "ELEVATED"
        elif structure in ("HIGHER_HIGHS_HIGHER_LOWS", "LOWER_HIGHS_LOWER_LOWS"):
            regime = "TRENDING_ORDERFLOW"
            risk_env = "NORMAL"
        elif structure == "COMPRESSION_TRIANGLE":
            regime = "VOLATILITY_COMPRESSION"
            risk_env = "NORMAL"
        elif structure == "EXPANDING_RANGE":
            regime = "VOLATILE_EXPANSION"
            risk_env = "ELEVATED"
        else:
            regime = "CHOPPY_RANGE"
            risk_env = "NORMAL"

        volatility_score = 45 if regime == "CHOPPY_RANGE" else 65 if regime == "TRENDING_ORDERFLOW" else 85

        # Nearest zones for thesis
        nearest_res = next((l for l in nearest_liquidity if l['category'] == 'RESISTANCE'), None)
        nearest_sup = next((l for l in nearest_liquidity if l['category'] == 'SUPPORT'), None)
        
        res_label = f"{nearest_res['label']} at {nearest_res['price']}" if nearest_res else "Recent Swing High"
        sup_label = f"{nearest_sup['label']} at {nearest_sup['price']}" if nearest_sup else "Recent Swing Low"

        # Build Thesis
        if bias == "BULLISH":
            thesis = f"Bullish structure supported by declining yields and DXY weakness; buyers defending higher lows targeting {res_label}."
            supporting = [
                f"Market structure showing higher highs & higher lows with strong EMA alignment.",
                f"Macro scorecard bullish ({macro_score:+.1f}) reflecting gold-supportive monetary conditions.",
                f"Clean liquidity pool resting above {res_label} providing upside magnet."
            ]
            invalidations = [
                f"Clean 15m candle close below key demand at {sup_label}.",
                "Sharp reversal in US 10-Year yield breaking above daily highs.",
                "Abnormal volume spike driving breakdown of recent higher low."
            ]
            change_mind = f"A decisive break and hold below {sup_label} flips short-term intraday regime to neutral/bearish."
        elif bias == "BEARISH":
            thesis = f"Bearish distribution targeting sell-side liquidity at {sup_label} amidst firm US Treasury yields."
            supporting = [
                f"Lower highs printing on 15m/1h timeframes with EMA resistance overhead.",
                f"Macro driver pressure ({macro_score:+.1f}) from steady dollar index and real yields.",
                f"Sell-side liquidity accumulation under {sup_label}."
            ]
            invalidations = [
                f"Reclaim and 15m close above structural high at {res_label}.",
                "Sharp intraday plunge in US yields or flight-to-safety catalyst.",
                "False breakdown sweep of {sup_label} followed by aggressive volume reclaim."
            ]
            change_mind = f"Reclaiming {res_label} with expanding volume invalidates the intraday short thesis."
        else:
            thesis = f"Market rotating within balanced range between {sup_label} and {res_label}; awaiting directional catalyst."
            supporting = [
                "Price oscillating around session VWAP without sustained displacement.",
                "Macro drivers showing conflicting signals with muted net direction.",
                "Equal highs and equal lows intact on both sides of the market."
            ]
            invalidations = [
                f"Impulsive breakout candle closing outside range boundary ({res_label} or {sup_label}).",
                "Surge in ATR accompanied by volume expansion.",
                "Decisive macro driver breakout in DXY or yields."
            ]
            change_mind = f"Wait for a certified liquidity sweep and reclaim of either session boundary before entering."

        return {
            "directional_bias": bias,
            "market_regime": regime,
            "conviction_score": conviction,
            "confidence_band": conf_band,
            "volatility_score": volatility_score,
            "risk_environment": risk_env,
            "one_sentence_thesis": thesis,
            "supporting_factors": supporting,
            "invalidation_factors": invalidations,
            "what_changes_mind": change_mind,
            "best_action_now": action,
            "is_lockout": False
        }
