"use client";

import React, { useEffect, useState } from "react";
import { BarChart2, TrendingUp, Award, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { terminalApi } from "../../lib/api";

export default function AnalyticsAccuracyView() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnalytics(isInitial = false) {
      try {
        const data = await terminalApi.getJournalAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    }

    loadAnalytics(true);
    const interval = setInterval(() => {
      loadAnalytics(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-xs text-text-muted">
        Computing mathematical expectancy & session distributions...
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs font-tabular">
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              Quantitative Edge & Discretionary Performance Analytics
            </h2>
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-bullish/10 border border-bullish/30 text-[9px] text-bullish font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-ping"></span>
              <span>LIVE</span>
            </span>
          </div>
          <span className="text-[10px] text-text-muted">Backtest-Free: Reflects Pure Journaled Real-Money History</span>
        </div>

        {/* Expectancy Metrics Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-surface/80 p-3 rounded border border-border/60">
            <span className="text-[10px] text-text-muted uppercase block">Profit Factor</span>
            <span className="text-2xl font-bold font-mono text-gold">{analytics?.profit_factor || 0}</span>
            <span className="text-[10px] text-bullish block mt-1">Gross Wins / Gross Losses</span>
          </div>

          <div className="bg-surface/80 p-3 rounded border border-border/60">
            <span className="text-[10px] text-text-muted uppercase block">Average Win / Loss Ratio</span>
            <span className="text-2xl font-bold font-mono text-gray-100">
              ${analytics?.average_win_usd || 0} / ${analytics?.average_loss_usd || 0}
            </span>
            <span className="text-[10px] text-text-muted block mt-1">Normalized Risk-Reward Realization</span>
          </div>

          <div className="bg-surface/80 p-3 rounded border border-border/60">
            <span className="text-[10px] text-text-muted uppercase block">Average Return per Trade</span>
            <span className="text-2xl font-bold font-mono text-bullish">+{analytics?.average_r || 0}R</span>
            <span className="text-[10px] text-text-muted block mt-1">Mathematical Expectancy</span>
          </div>

          <div className="bg-surface/80 p-3 rounded border border-border/60">
            <span className="text-[10px] text-text-muted uppercase block">Discipline Factor</span>
            <span className="text-2xl font-bold font-mono text-gold">{analytics?.rule_adherence_pct || 100}%</span>
            <span className="text-[10px] text-text-muted block mt-1">Trades Without Rule Breaks</span>
          </div>
        </div>

        {/* Session Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface/60 p-3 rounded border border-border/50">
            <h3 className="font-bold text-gray-200 uppercase tracking-wider text-[11px] mb-2.5">
              Performance by Global Market Session
            </h3>
            <div className="space-y-2 text-[11px]">
              {analytics?.sessions && Object.entries(analytics.sessions).map(([sess, s]: [string, any]) => (
                <div key={sess} className="bg-card p-2 rounded border border-border/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-200 block">{sess}</span>
                    <span className="text-[10px] text-text-muted">{s.trades} Trades Logged</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-bullish">{s.win_rate}% Win Rate</span>
                    <span className={`text-[10px] block font-mono ${s.pnl >= 0 ? "text-bullish" : "text-bearish"}`}>
                      {s.pnl >= 0 ? "+" : ""}${s.pnl}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Edge Comparison */}
          <div className="bg-surface/60 p-3 rounded border border-border/50 space-y-3">
            <h3 className="font-bold text-gray-200 uppercase tracking-wider text-[11px]">
              Setup Edge Telemetry
            </h3>

            <div className="bg-card p-3 rounded border border-bullish/30">
              <span className="text-[10px] uppercase font-bold text-bullish block mb-1">
                Highest Positive Expectancy Setup
              </span>
              <div className="text-sm font-bold text-gray-100">{analytics?.best_setup}</div>
              <p className="text-[11px] text-text-secondary mt-1">
                Characterized by entering after Asian liquidity was swept with clean 15m structural displacement.
              </p>
            </div>

            <div className="bg-card p-3 rounded border border-bearish/30">
              <span className="text-[10px] uppercase font-bold text-bearish block mb-1">
                Highest Negative Expectancy Leak
              </span>
              <div className="text-sm font-bold text-gray-100">{analytics?.worst_setup}</div>
              <p className="text-[11px] text-text-secondary mt-1">
                Impulsive breakout chasing without waiting for candle close or pullback confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
