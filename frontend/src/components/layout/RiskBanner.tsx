"use client";

import React from "react";
import { AlertOctagon, ShieldAlert, Timer, DollarSign, Activity } from "lucide-react";
import { EconomicEvent } from "@/types/terminal";

interface RiskBannerProps {
  nextEvent: EconomicEvent | null;
  isLockout: boolean;
  spread: number;
  dailyLossUsedPct?: number;
  tradesRemaining?: number;
}

export default function RiskBanner({
  nextEvent,
  isLockout,
  spread,
  dailyLossUsedPct = 0,
  tradesRemaining = 5
}: RiskBannerProps) {
  const isWideSpread = spread > 3.0;

  return (
    <div className={`border-b transition-colors ${
      isLockout 
        ? "bg-bearish/15 border-bearish/50 text-red-200" 
        : "bg-surface/90 border-border/80 text-text-secondary"
    } px-4 py-2 text-xs font-tabular`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* News Event Countdown / Blackout Alert */}
        <div className="flex items-center space-x-2">
          {isLockout ? (
            <AlertOctagon className="w-4 h-4 text-bearish animate-bounce" />
          ) : (
            <Timer className="w-4 h-4 text-gold" />
          )}

          <div>
            {isLockout ? (
              <span className="font-bold text-bearish uppercase tracking-wider">
                NEWS LOCKOUT ACTIVE (±15M WINDOW): {nextEvent?.title || "High Impact Event"} — DO NOT ENTER NEW TRADES
              </span>
            ) : nextEvent ? (
              <span>
                <span className="text-gray-400">Next Catalyst:</span>{" "}
                <strong className="text-gray-200">{nextEvent.title}</strong>{" "}
                <span className="text-gold font-bold">({nextEvent.countdown})</span>{" "}
                <span className="text-[10px] text-gray-500">[{nextEvent.time_ist}]</span>
              </span>
            ) : (
              <span>No tier-1 economic events scheduled in the next 12 hours.</span>
            )}
          </div>
        </div>

        {/* Guardrails Status Items */}
        <div className="flex items-center space-x-4 text-[11px]">
          {/* Spread Monitor */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">Spread Condition:</span>
            <span className={`px-1.5 py-0.2 rounded font-bold ${
              isWideSpread ? "text-bearish bg-bearish/20" : "text-bullish bg-bullish/10"
            }`}>
              {spread.toFixed(1)} pts ({isWideSpread ? "EXPANDED" : "OPTIMAL"})
            </span>
          </div>

          {/* Daily Drawdown Utilization */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">Daily Loss Guardrail:</span>
            <span className={`font-bold ${dailyLossUsedPct > 60 ? "text-bearish" : "text-gray-300"}`}>
              {dailyLossUsedPct.toFixed(1)}% / 3.0% Max
            </span>
          </div>

          {/* Daily Trade Quota */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">Trades Remaining:</span>
            <span className="text-gray-300 font-bold">{tradesRemaining} / 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
