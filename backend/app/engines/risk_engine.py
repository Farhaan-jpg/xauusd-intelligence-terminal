from typing import Dict, Any

class RiskEngine:
    @staticmethod
    def calculate_position_size(
        account_balance: float,
        risk_pct: float,
        fixed_risk_amount: float,
        entry_price: float,
        stop_loss: float,
        take_profit_1: float,
        take_profit_2: float = None,
        contract_size: float = 100.0,    # 100 oz per standard lot
        tick_size: float = 0.01,         # 1 cent ($0.01)
        tick_value: float = 1.00,        # $1 per 0.01 move per 1.0 lot
        spread_points: float = 1.8,      # 1.8 points = $0.18 spread
        commission_per_lot: float = 6.0, # $6 round-turn
        slippage_points: float = 1.0,    # 1.0 points estimated slippage
        atr_value: float = 8.50,         # Current 15m/1h ATR in USD
        today_loss_so_far: float = 0.0,
        max_daily_loss_pct: float = 3.0,
        today_trades_count: int = 0,
        max_daily_trades: int = 5
    ) -> Dict[str, Any]:
        """
        Calculates institutional position sizing and risk parameters with strict formula transparency.
        """
        # Determine base cash at risk
        if fixed_risk_amount and fixed_risk_amount > 0:
            target_cash_risk = fixed_risk_amount
        else:
            target_cash_risk = account_balance * (risk_pct / 100.0)

        # Validate prices
        is_long = entry_price > stop_loss
        sl_distance = abs(entry_price - stop_loss)
        if sl_distance <= 0:
            return {"error": "Stop loss cannot be identical to entry price."}

        # Conversion:
        # sl_distance in USD (e.g. $5.00 distance)
        # On standard lot of 100 oz: 1 USD move on 1 lot = $100.00 P&L
        # dollars_per_point = contract_size
        dollars_per_point_per_lot = contract_size  # e.g., 100 oz * $1 = $100
        
        # Raw lot size = target_cash_risk / (sl_distance * dollars_per_point_per_lot)
        raw_lot = target_cash_risk / (sl_distance * dollars_per_point_per_lot)
        # Round to 2 decimals (standard micro-lot step 0.01)
        recommended_lot = max(round(raw_lot, 2), 0.01)
        
        # Recalculate exact base risk at rounded lot size
        actual_price_risk = recommended_lot * sl_distance * dollars_per_point_per_lot
        
        # Estimated execution costs
        # spread_points in points (1 point = $0.10, so $0.18 = 1.8 points)
        spread_cost_per_lot = (spread_points * 0.10) * contract_size
        est_spread_cost = round(recommended_lot * spread_cost_per_lot, 2)
        est_commission = round(recommended_lot * commission_per_lot, 2)
        est_slippage = round(recommended_lot * (slippage_points * 0.10) * contract_size, 2)
        
        total_costs = est_spread_cost + est_commission + est_slippage
        effective_total_risk = round(actual_price_risk + total_costs, 2)
        effective_risk_pct = round((effective_total_risk / account_balance) * 100.0, 2) if account_balance > 0 else 0
        
        # Reward calculation
        tp1_distance = abs(take_profit_1 - entry_price) if take_profit_1 else 0
        gross_reward_tp1 = recommended_lot * tp1_distance * dollars_per_point_per_lot
        net_reward_tp1 = max(round(gross_reward_tp1 - total_costs, 2), 0.0)
        
        # Risk-to-Reward Ratio (Net)
        net_rr_ratio = round(net_reward_tp1 / effective_total_risk, 2) if effective_total_risk > 0 else 0
        
        # Breakeven win rate: 1 / (1 + RR)
        breakeven_win_rate_pct = round((1.0 / (1.0 + net_rr_ratio)) * 100.0, 1) if net_rr_ratio > 0 else 100.0
        
        # ATR multiples
        sl_in_atr = round(sl_distance / atr_value, 2) if atr_value > 0 else 0.0
        tp_in_atr = round(tp1_distance / atr_value, 2) if atr_value > 0 else 0.0
        
        # Guardrail & Rule Compliance Checks
        violations = []
        max_daily_loss_amount = account_balance * (max_daily_loss_pct / 100.0)
        potential_cumulative_loss = today_loss_so_far + effective_total_risk
        
        if potential_cumulative_loss > max_daily_loss_amount:
            violations.append(f"Exceeds max daily loss limit (${max_daily_loss_amount:.2f}). Potential cumulative loss: ${potential_cumulative_loss:.2f}.")
            
        if today_trades_count >= max_daily_trades:
            violations.append(f"Maximum daily trades limit ({max_daily_trades}) reached. Discipline protocol mandates no new entries.")
            
        if net_rr_ratio < 1.3:
            violations.append(f"Net Risk-to-Reward ({net_rr_ratio}:1) is below institutional threshold (1.3:1) after estimated costs.")
            
        if sl_in_atr < 0.4:
            violations.append(f"Stop loss ({sl_in_atr} ATR) is too tight for XAUUSD volatility; prone to market noise wicks.")

        return {
            "is_valid": len(violations) == 0,
            "violations": violations,
            "direction": "LONG" if is_long else "SHORT",
            "recommended_lot_size": recommended_lot,
            "cash_at_risk": round(actual_price_risk, 2),
            "estimated_costs": {
                "spread": est_spread_cost,
                "commission": est_commission,
                "slippage": est_slippage,
                "total_friction": round(total_costs, 2)
            },
            "effective_total_risk": effective_total_risk,
            "effective_risk_pct": effective_risk_pct,
            "net_reward_tp1": net_reward_tp1,
            "risk_to_reward_ratio": net_rr_ratio,
            "breakeven_win_rate_pct": breakeven_win_rate_pct,
            "distances": {
                "stop_loss_dollars": round(sl_distance, 2),
                "stop_loss_points": round(sl_distance * 10.0, 1),
                "stop_loss_pips": round(sl_distance * 10.0, 1),
                "stop_loss_atr_multiples": sl_in_atr,
                "target_1_dollars": round(tp1_distance, 2),
                "target_1_atr_multiples": tp_in_atr
            },
            "account_utilization": {
                "daily_loss_utilized_pct": round((potential_cumulative_loss / max_daily_loss_amount) * 100.0, 1) if max_daily_loss_amount > 0 else 0,
                "trades_remaining_today": max(max_daily_trades - today_trades_count, 0)
            },
            "formula_breakdown": {
                "lot_formula": "Lot = TargetRisk / (SL_Distance_USD * Contract_Size)",
                "example": f"{target_cash_risk:.2f} / ({sl_distance:.2f} * {contract_size}) = {raw_lot:.3f} -> Rounded {recommended_lot}",
                "net_rr_formula": "Net_RR = (Gross_Gain - Friction) / (Base_Risk + Friction)",
                "contract_specs_used": f"{contract_size} oz/lot, ${tick_value} per {tick_size} tick"
            }
        }
