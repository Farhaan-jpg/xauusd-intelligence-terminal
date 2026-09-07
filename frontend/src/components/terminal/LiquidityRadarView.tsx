"use client";

import React, { useEffect, useState } from "react";
import { Compass, Target, ArrowDownCircle, ArrowUpCircle, AlertCircle, Layers } from "lucide-react";
import { terminalApi } from "../../lib/api";
import { LiquidityLevel } from "../../types/terminal";

export default function LiquidityRadarView() {
  const [levels, setLevels] = useState<LiquidityLevel[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(4413.21);
  const [sweeps, setSweeps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLiquidity(isInitial = false) {
      try {
        const res = await terminalApi.getLiquidityLevels();
        setLevels(res.liquidity_levels || []);
        setCurrentPrice(res.current_price || 4413.21);
        setSweeps(res.recent_sweeps || []);
      } catch (err) {
        console.error("Failed to load liquidity levels:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    }

    loadLiquidity(true);
    const interval = setInterval(() => {
      loadLiquidity(false);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-xs text-text-muted">
        Scanning public structural liquidity pools & equal highs/lows...
      </div>
    );
  }

  const resistanceLevels = levels.filter((l) => l.category === "RESISTANCE").sort((a, b) => a.price - b.price);
  const supportLevels = levels.filter((l) => l.category === "SUPPORT").sort((a, b) => b.price - a.price);

  return (
    <div className="space-y-4 text-xs font-tabular">
      {/* Header & Mandatory Transparency Disclaimer */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              XAUUSD Liquidity Radar & Stop-Interest Map
            </h2>
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-bullish/10 border border-bullish/30 text-[9px] text-bullish font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-ping"></span>
              <span>LIVE</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-text-muted hidden sm:inline">2.5s Structural Scan</span>
            <div className="text-[11px] font-mono font-bold text-gold bg-surface px-2.5 py-1 rounded border border-border shadow-sm">
              SPOT: ${currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-surface/70 p-2.5 rounded border border-border/60 text-[11px] text-text-muted">
          <strong className="text-gray-300">Methodology Notice:</strong> Likely liquidity / stop-interest zones inferred from public price structure, previous session extremes, equal highs/lows, and psychological round numbers. This terminal does not falsely claim proprietary institutional book depth.
        </div>
      </div>

      {/* Sweep and Reclaim Alerts Strip */}
      {sweeps.length > 0 && (
        <div className="bg-gold/10 border border-gold/40 rounded-md p-3">
          <div className="flex items-center space-x-2 text-gold font-bold text-xs uppercase mb-1">
            <Target className="w-4 h-4" />
            <span>Recent Liquidity Sweep & Reclaim Event Detected</span>
          </div>
          {sweeps.map((sw, i) => (
            <div key={i} className="text-[11px] text-gray-200">
              {sw.description}
            </div>
          ))}
        </div>
      )}

      {/* Visual Depth Ladder / Liquidity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Resistance Zones (Supply / Buy-side Liquidity) */}
        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex items-center space-x-2 text-bearish font-bold mb-3 uppercase tracking-wider text-[11px]">
            <ArrowDownCircle className="w-4 h-4" />
            <span>Buy-Side Liquidity & Overhead Resistance</span>
          </div>

          <div className="space-y-2">
            {resistanceLevels.map((lvl, i) => {
              const dist = Math.abs(lvl.distance_usd);
              const isImminent = dist <= 3.0;
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded border transition-all ${
                    isImminent
                      ? "bg-bearish/15 border-bearish/50 shadow-xs"
                      : "bg-surface/70 border-border/40 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold font-mono text-sm text-gray-100">${lvl.price.toFixed(2)}</span>
                      <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-card text-text-secondary">
                        {lvl.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted block">Distance</span>
                      <span className={`font-bold ${isImminent ? "text-bearish" : "text-gray-300"}`}>
                        +{dist.toFixed(2)}$ ({lvl.distance_pips} pips)
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-text-muted mt-1 flex justify-between">
                    <span>{lvl.label}</span>
                    <span className="text-gray-400">Strength: {lvl.strength}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Zones (Demand / Sell-side Liquidity) */}
        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex items-center space-x-2 text-bullish font-bold mb-3 uppercase tracking-wider text-[11px]">
            <ArrowUpCircle className="w-4 h-4" />
            <span>Sell-Side Liquidity & Resting Demand</span>
          </div>

          <div className="space-y-2">
            {supportLevels.map((lvl, i) => {
              const dist = Math.abs(lvl.distance_usd);
              const isImminent = dist <= 3.0;
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded border transition-all ${
                    isImminent
                      ? "bg-bullish/15 border-bullish/50 shadow-xs"
                      : "bg-surface/70 border-border/40 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold font-mono text-sm text-gray-100">${lvl.price.toFixed(2)}</span>
                      <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-card text-text-secondary">
                        {lvl.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted block">Distance</span>
                      <span className={`font-bold ${isImminent ? "text-bullish" : "text-gray-300"}`}>
                        -{dist.toFixed(2)}$ ({lvl.distance_pips} pips)
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-text-muted mt-1 flex justify-between">
                    <span>{lvl.label}</span>
                    <span className="text-gray-400">Strength: {lvl.strength}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
