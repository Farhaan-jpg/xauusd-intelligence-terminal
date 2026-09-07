"use client";

import React, { useState, useEffect } from "react";
import { Sliders, DollarSign, ShieldAlert, CheckCircle2, XCircle, HelpCircle, Save } from "lucide-react";
import { terminalApi } from "@/lib/api";
import { RiskCalculationResult } from "@/types/terminal";

export default function TradePlannerWorkspace() {
  const [balance, setBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [entryPrice, setEntryPrice] = useState<number>(2655.0);
  const [stopLoss, setStopLoss] = useState<number>(2649.0);
  const [takeProfit, setTakeProfit] = useState<number>(2670.0);
  const [contractSize, setContractSize] = useState<number>(100.0);
  const [spreadPoints, setSpreadPoints] = useState<number>(1.8);
  const [commissionPerLot, setCommissionPerLot] = useState<number>(6.0);
  const [slippagePoints, setSlippagePoints] = useState<number>(1.0);
  
  const [calcResult, setCalcResult] = useState<RiskCalculationResult | null>(null);
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Auto-recalculate on input change
  useEffect(() => {
    async function recompute() {
      try {
        const res = await terminalApi.calculateRisk({
          account_balance: balance,
          risk_pct: riskPct,
          entry_price: entryPrice,
          stop_loss: stopLoss,
          take_profit_1: takeProfit,
          contract_size: contractSize,
          spread_points: spreadPoints,
          commission_per_lot: commissionPerLot,
          slippage_points: slippagePoints,
          atr_value: 8.50,
          today_loss_so_far: 0.0,
          max_daily_loss_pct: 3.0,
          today_trades_count: 1,
          max_daily_trades: 5,
        });
        setCalcResult(res);
      } catch (err) {
        console.error("Calculation failed:", err);
      }
    }
    recompute();
  }, [balance, riskPct, direction, entryPrice, stopLoss, takeProfit, contractSize, spreadPoints, commissionPerLot, slippagePoints]);

  const handleSavePlan = async () => {
    if (!calcResult) return;
    try {
      await terminalApi.saveTradePlan({
        name: `XAUUSD ${direction} Plan @ ${entryPrice}`,
        direction,
        entry_price: entryPrice,
        stop_loss: stopLoss,
        take_profit_1: takeProfit,
        lot_size: calcResult.recommended_lot_size,
        cash_at_risk: calcResult.cash_at_risk,
        effective_risk_with_costs: calcResult.effective_total_risk,
        rr_ratio: calcResult.risk_to_reward_ratio,
        breakeven_win_rate: calcResult.breakeven_win_rate_pct,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save plan failed:", err);
    }
  };

  return (
    <div className="space-y-4 text-xs font-tabular">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              Institutional Trade Planner & Risk Engine
            </h2>
          </div>
          <div className="text-[11px] text-text-muted">
            Capital preservation first. Sizing accounts for spread, commission, and slippage.
          </div>
        </div>
      </div>

      {/* 2-Column Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Editable Parameters */}
        <div className="bg-card border border-border rounded-md p-4 space-y-3.5">
          <h3 className="font-bold text-gray-200 uppercase tracking-wider text-[11px] border-b border-border/60 pb-2">
            1. Trade Inputs & Broker Specs
          </h3>

          {/* Direction Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setDirection("LONG");
                if (stopLoss >= entryPrice) setStopLoss(entryPrice - 5);
                if (takeProfit <= entryPrice) setTakeProfit(entryPrice + 12);
              }}
              className={`py-2 rounded font-bold uppercase transition-all ${
                direction === "LONG"
                  ? "bg-bullish text-black shadow-xs"
                  : "bg-surface text-gray-400 border border-border"
              }`}
            >
              LONG / BUY
            </button>
            <button
              onClick={() => {
                setDirection("SHORT");
                if (stopLoss <= entryPrice) setStopLoss(entryPrice + 5);
                if (takeProfit >= entryPrice) setTakeProfit(entryPrice - 12);
              }}
              className={`py-2 rounded font-bold uppercase transition-all ${
                direction === "SHORT"
                  ? "bg-bearish text-white shadow-xs"
                  : "bg-surface text-gray-400 border border-border"
              }`}
            >
              SHORT / SELL
            </button>
          </div>

          {/* Account & Risk % */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-text-muted uppercase block mb-1">Account Balance ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface border border-border rounded px-3 py-1.5 text-gray-100 font-mono focus:border-gold outline-hidden"
              />
            </div>
            <div>
              <label className="text-[10px] text-text-muted uppercase block mb-1">Risk Per Trade (%)</label>
              <input
                type="number"
                step="0.1"
                value={riskPct}
                onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface border border-border rounded px-3 py-1.5 text-gray-100 font-mono focus:border-gold outline-hidden"
              />
            </div>
          </div>

          {/* Prices: Entry, SL, TP */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-text-muted uppercase block mb-1">Entry Price ($)</label>
              <input
                type="number"
                step="0.1"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface border border-border rounded px-2.5 py-1.5 text-gray-100 font-mono focus:border-gold outline-hidden"
              />
            </div>
            <div>
              <label className="text-[10px] text-bearish uppercase font-bold block mb-1">Stop Loss ($)</label>
              <input
                type="number"
                step="0.1"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface border border-bearish/40 rounded px-2.5 py-1.5 text-bearish font-mono focus:border-bearish outline-hidden"
              />
            </div>
            <div>
              <label className="text-[10px] text-bullish uppercase font-bold block mb-1">Take Profit ($)</label>
              <input
                type="number"
                step="0.1"
                value={takeProfit}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface border border-bullish/40 rounded px-2.5 py-1.5 text-bullish font-mono focus:border-bullish outline-hidden"
              />
            </div>
          </div>

          {/* Broker Friction Specs */}
          <div className="bg-surface/60 p-3 rounded border border-border/60 space-y-2">
            <span className="text-[10px] font-bold text-gray-300 uppercase block">
              Broker Contract Specifications
            </span>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <span className="text-text-muted block">Contract (oz):</span>
                <input
                  type="number"
                  value={contractSize}
                  onChange={(e) => setContractSize(parseFloat(e.target.value) || 100)}
                  className="w-full bg-card border border-border rounded px-2 py-1 text-gray-200 font-mono mt-0.5"
                />
              </div>
              <div>
                <span className="text-text-muted block">Spread (pts):</span>
                <input
                  type="number"
                  step="0.1"
                  value={spreadPoints}
                  onChange={(e) => setSpreadPoints(parseFloat(e.target.value) || 0)}
                  className="w-full bg-card border border-border rounded px-2 py-1 text-gray-200 font-mono mt-0.5"
                />
              </div>
              <div>
                <span className="text-text-muted block">Comm ($/lot):</span>
                <input
                  type="number"
                  value={commissionPerLot}
                  onChange={(e) => setCommissionPerLot(parseFloat(e.target.value) || 0)}
                  className="w-full bg-card border border-border rounded px-2 py-1 text-gray-200 font-mono mt-0.5"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSavePlan}
            className="w-full py-2 bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold font-bold uppercase rounded flex items-center justify-center space-x-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? "Plan Saved to Journal!" : "Save Trade Scenario"}</span>
          </button>
        </div>

        {/* Right Column: Calculated Outputs & Rule Checklist */}
        <div className="bg-card border border-border rounded-md p-4 space-y-3.5">
          <h3 className="font-bold text-gray-200 uppercase tracking-wider text-[11px] border-b border-border/60 pb-2">
            2. Calculated Risk & Position Sizing
          </h3>

          {calcResult ? (
            <div className="space-y-3">
              {/* Primary Output Hero */}
              <div className="grid grid-cols-2 gap-3 bg-surface/80 p-3 rounded border border-border/60">
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Recommended Position Size</span>
                  <span className="text-2xl font-bold font-mono text-gold">
                    {calcResult.recommended_lot_size.toFixed(2)} Lots
                  </span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    ({(calcResult.recommended_lot_size * contractSize).toFixed(0)} oz of Gold)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Effective Risk ($ & %)</span>
                  <span className="text-2xl font-bold font-mono text-bearish">
                    ${calcResult.effective_total_risk.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    {calcResult.effective_risk_pct.toFixed(2)}% of Account Equity
                  </span>
                </div>
              </div>

              {/* R:R and Breakeven Win Rate */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-surface/60 p-2 rounded border border-border/40">
                  <span className="text-[9px] text-text-muted uppercase block">Net R:R Ratio</span>
                  <span className="text-sm font-bold font-mono text-bullish">
                    {calcResult.risk_to_reward_ratio}:1
                  </span>
                </div>

                <div className="bg-surface/60 p-2 rounded border border-border/40">
                  <span className="text-[9px] text-text-muted uppercase block">Breakeven Win Rate</span>
                  <span className="text-sm font-bold font-mono text-gray-200">
                    {calcResult.breakeven_win_rate_pct}%
                  </span>
                </div>

                <div className="bg-surface/60 p-2 rounded border border-border/40">
                  <span className="text-[9px] text-text-muted uppercase block">Net Target Gain</span>
                  <span className="text-sm font-bold font-mono text-bullish">
                    +${calcResult.net_reward_tp1.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Execution Friction Breakdown */}
              <div className="bg-surface/50 p-2.5 rounded border border-border/40 text-[11px] space-y-1">
                <div className="flex justify-between text-text-secondary">
                  <span>Base Stop Loss Distance:</span>
                  <span className="font-mono text-gray-200">
                    ${calcResult.distances.stop_loss_dollars.toFixed(2)} ({calcResult.distances.stop_loss_atr_multiples} ATR)
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Estimated Spread Friction:</span>
                  <span className="font-mono text-gray-300">-${calcResult.estimated_costs.spread.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Estimated Commission & Slippage:</span>
                  <span className="font-mono text-gray-300">
                    -${(calcResult.estimated_costs.commission + calcResult.estimated_costs.slippage).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Violations / Rule Guardrails */}
              {calcResult.violations.length > 0 ? (
                <div className="bg-bearish/15 border border-bearish/40 rounded p-2.5 text-bearish text-[11px] space-y-1">
                  <div className="font-bold uppercase flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rule Violations Detected</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    {calcResult.violations.map((v, idx) => (
                      <li key={idx}>{v}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-bullish/15 border border-bullish/40 rounded p-2 text-bullish text-[11px] flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Plan Approved: All Risk & Discipline Guardrails Satisfied</span>
                </div>
              )}

              {/* Collapsible Formula Transparency */}
              <div className="pt-1">
                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="text-[10px] text-text-muted hover:text-gold flex items-center space-x-1 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showFormula ? "Hide calculation formula" : "How is this calculated?"}</span>
                </button>

                {showFormula && (
                  <div className="mt-2 bg-surface/90 p-2.5 rounded border border-border/70 text-[10px] text-text-secondary space-y-1 font-mono">
                    <div>{calcResult.formula_breakdown.lot_formula}</div>
                    <div className="text-gray-300">{calcResult.formula_breakdown.example}</div>
                    <div>{calcResult.formula_breakdown.net_rr_formula}</div>
                    <div className="text-text-muted">{calcResult.formula_breakdown.contract_specs_used}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-text-muted animate-pulse">Calculating institutional sizing...</div>
          )}
        </div>
      </div>
    </div>
  );
}
