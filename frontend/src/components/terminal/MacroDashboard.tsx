"use client";

import React, { useEffect, useState } from "react";
import { Globe, TrendingUp, TrendingDown, DollarSign, Activity, Percent, ShieldCheck } from "lucide-react";
import { terminalApi } from "../../lib/api";
import { MacroScoreResult } from "../../types/terminal";

export default function MacroDashboard() {
  const [drivers, setDrivers] = useState<Record<string, any>>({});
  const [scoreData, setScoreData] = useState<MacroScoreResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMacro() {
      try {
        const [d, s] = await Promise.all([
          terminalApi.getMacroDrivers(),
          terminalApi.getMacroScore(),
        ]);
        setDrivers(d);
        setScoreData(s);
      } catch (err) {
        console.error("Failed to load macro data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMacro();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-xs text-text-muted">
        Loading institutional macro drivers & yield curves...
      </div>
    );
  }

  const score = scoreData?.score || 0;
  const isBullishScore = score >= 20;
  const isBearishScore = score <= -20;

  return (
    <div className="space-y-4">
      {/* Weighted Scorecard Hero */}
      <div className="bg-card border border-border rounded-md p-4 text-xs font-tabular">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              Aggregated Macro Driver Bias
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-text-muted">Macro Regime:</span>
            <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[11px] border ${
              isBullishScore 
                ? "bg-bullish/20 text-bullish border-bullish/40" 
                : isBearishScore 
                ? "bg-bearish/20 text-bearish border-bearish/40" 
                : "bg-surface text-gray-300 border-border"
            }`}>
              {scoreData?.verdict.replace(/_/g, " ") || "NEUTRAL"}
            </span>
          </div>
        </div>

        {/* Score Meter & Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface/70 p-3.5 rounded border border-border/60 mb-3">
          <div className="flex flex-col justify-center items-center border-r border-border/40 pr-4">
            <span className="text-[10px] text-text-muted uppercase mb-1">Weighted Macro Score</span>
            <span className={`text-3xl font-bold font-mono ${
              isBullishScore ? "text-bullish" : isBearishScore ? "text-bearish" : "text-gray-300"
            }`}>
              {score > 0 ? "+" : ""}{score.toFixed(1)}
            </span>
            <span className="text-[10px] text-text-muted mt-1">Scale: -100 (Bearish) to +100 (Bullish)</span>
          </div>

          <div className="col-span-2 flex flex-col justify-center">
            <span className="text-[10px] text-gold uppercase font-bold mb-1">Macro Formula Attribution</span>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              {scoreData?.formula_summary}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-text-muted">
              <span className="bg-card px-2 py-0.5 rounded border border-border">DXY: 30%</span>
              <span className="bg-card px-2 py-0.5 rounded border border-border">US 10Y Yield: 20%</span>
              <span className="bg-card px-2 py-0.5 rounded border border-border">Real Yields: 20%</span>
              <span className="bg-card px-2 py-0.5 rounded border border-border">VIX / Safe Haven: 10%</span>
              <span className="bg-card px-2 py-0.5 rounded border border-border">ETF Inflows: 10%</span>
              <span className="bg-card px-2 py-0.5 rounded border border-border">COT Positioning: 10%</span>
            </div>
          </div>
        </div>

        {/* Detailed Component Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-text-muted border-b border-border/40 uppercase text-[10px]">
                <th className="py-2">Driver</th>
                <th className="py-2">Value</th>
                <th className="py-2">1D Change</th>
                <th className="py-2">Weight</th>
                <th className="py-2">Gold Bias</th>
                <th className="py-2">Attribution Impact</th>
                <th className="py-2">Institutional Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {scoreData?.components.map((c, i) => (
                <tr key={i} className="hover:bg-surface/40 transition-colors">
                  <td className="py-2 font-bold text-gray-200">{c.driver}</td>
                  <td className="py-2 text-gold font-mono">{c.value}</td>
                  <td className="py-2 font-mono text-gray-300">{c.change}</td>
                  <td className="py-2 text-text-muted">{c.weight_pct}%</td>
                  <td className="py-2">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      c.bias === "BULLISH" ? "text-bullish bg-bullish/10" : c.bias === "BEARISH" ? "text-bearish bg-bearish/10" : "text-gray-400"
                    }`}>
                      {c.bias}
                    </span>
                  </td>
                  <td className={`py-2 font-bold font-mono ${c.impact >= 0 ? "text-bullish" : "text-bearish"}`}>
                    {c.impact > 0 ? "+" : ""}{c.impact.toFixed(1)} pts
                  </td>
                  <td className="py-2 text-text-secondary text-[10px]">{c.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-tabular">
        {Object.entries(drivers).map(([key, d]) => (
          <div key={key} className="bg-card border border-border rounded-md p-3.5 hover:border-border/80 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-gray-200 font-bold">{d.name}</span>
              <span className="text-[10px] text-text-muted">{d.source}</span>
            </div>

            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-lg font-bold font-mono text-gold">{d.value}</span>
              {d.unit && <span className="text-[10px] text-text-muted">{d.unit}</span>}
              {d.change_1d !== undefined && (
                <span className={`text-[11px] font-bold ${d.change_1d >= 0 ? "text-bullish" : "text-bearish"}`}>
                  {d.change_1d >= 0 ? "+" : ""}{d.change_1d}% (1D)
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-border/40 space-y-1 text-[11px] text-text-secondary">
              <div className="flex justify-between">
                <span className="text-text-muted">Correlation (30D):</span>
                <span className="text-gray-300 font-mono">{d.correlation_30d !== undefined ? d.correlation_30d : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="text-gold truncate ml-2">{d.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
