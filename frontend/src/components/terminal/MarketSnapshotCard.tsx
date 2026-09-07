"use client";

import React from "react";
import { Activity, BarChart2, TrendingUp, TrendingDown, Layers, Clock } from "lucide-react";
import { MarketQuote, SessionInfo } from "@/types/terminal";

interface MarketSnapshotCardProps {
  quote: MarketQuote | null;
  session: SessionInfo | null;
}

export default function MarketSnapshotCard({ quote, session }: MarketSnapshotCardProps) {
  if (!quote) return null;

  const isPositive = quote.change_points >= 0;

  return (
    <div className="bg-card border border-border rounded-md p-4 text-xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-gold" />
          <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
            XAUUSD Market Snapshot
          </h2>
        </div>
        <div className="text-[10px] text-text-muted font-tabular">
          Source: <span className="text-gray-400">{quote.source}</span> | {quote.timestamp_ist}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-tabular">
        {/* Spot Price */}
        <div className="bg-surface/70 p-2.5 rounded border border-border/40">
          <span className="text-[10px] text-text-muted block uppercase">Last Spot</span>
          <span className="text-base font-bold text-gold">${quote.price.toFixed(2)}</span>
          <div className={`text-[10px] flex items-center space-x-0.5 mt-0.5 ${isPositive ? "text-bullish" : "text-bearish"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isPositive ? "+" : ""}{quote.change_points.toFixed(2)} ({isPositive ? "+" : ""}{quote.change_pct.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Bid / Ask */}
        <div className="bg-surface/70 p-2.5 rounded border border-border/40">
          <span className="text-[10px] text-text-muted block uppercase">Bid / Ask</span>
          <span className="text-xs font-bold text-gray-200 block">{quote.bid.toFixed(2)} / {quote.ask.toFixed(2)}</span>
          <span className="text-[10px] text-text-muted block mt-0.5">Spread: {quote.spread_points.toFixed(1)} pts (${quote.spread_usd.toFixed(2)})</span>
        </div>

        {/* Today's Range */}
        <div className="bg-surface/70 p-2.5 rounded border border-border/40">
          <span className="text-[10px] text-text-muted block uppercase">Daily High / Low</span>
          <span className="text-xs font-bold text-gray-200 block">${quote.high.toFixed(2)} / ${quote.low.toFixed(2)}</span>
          <span className="text-[10px] text-text-muted block mt-0.5">Range: ${(quote.high - quote.low).toFixed(2)} pts</span>
        </div>

        {/* Daily Open / Prev Close */}
        <div className="bg-surface/70 p-2.5 rounded border border-border/40">
          <span className="text-[10px] text-text-muted block uppercase">Open / Prev Close</span>
          <span className="text-xs font-bold text-gray-200 block">${quote.open.toFixed(2)} / ${quote.prev_close.toFixed(2)}</span>
          <span className="text-[10px] text-text-muted block mt-0.5">
            Gap: ${(quote.open - quote.prev_close).toFixed(2)}
          </span>
        </div>

        {/* ATR */}
        <div className="bg-surface/70 p-2.5 rounded border border-border/40">
          <span className="text-[10px] text-text-muted block uppercase">ATR (14-Period)</span>
          <span className="text-xs font-bold text-gray-200 block">$8.50 (15m)</span>
          <span className="text-[10px] text-text-muted block mt-0.5">Daily ATR: $28.40</span>
        </div>

        {/* Active Trading Session */}
        <div className="bg-surface/70 p-2.5 rounded border border-border/40 col-span-2">
          <span className="text-[10px] text-text-muted block uppercase">Global Session Liquidity</span>
          <span className="text-xs font-bold text-gray-200 block truncate">
            {session?.current_session || "London - New York Overlap"}
          </span>
          <span className="text-[10px] text-bullish font-bold block mt-0.5">
            Liquidity Quality: {session?.session_quality || "HIGH"}
          </span>
        </div>
      </div>
    </div>
  );
}
