"use client";

import React from "react";
import { Layers, TrendingUp, TrendingDown, Check, AlertCircle } from "lucide-react";
import { MultiTimeframeData } from "@/types/terminal";

interface MultiTimeframeGridProps {
  data: MultiTimeframeData | null;
}

export default function MultiTimeframeGrid({ data }: MultiTimeframeGridProps) {
  if (!data) {
    return (
      <div className="bg-card border border-border rounded-md p-4 animate-pulse text-xs text-text-muted">
        Computing multi-timeframe alignment...
      </div>
    );
  }

  const isAligned = data.alignment_status.includes("ALIGNED");

  return (
    <div className="bg-card border border-border rounded-md p-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-gold" />
          <h3 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
            Multi-Timeframe Alignment Matrix
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-tabular">
          <span>Intraday: <strong className="text-bullish">{data.intraday_bias}</strong></span>
          <span className="text-text-muted">|</span>
          <span>HTF: <strong className="text-gray-300">{data.htf_bias}</strong></span>
          <span className="text-text-muted">|</span>
          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
            isAligned ? "bg-bullish/20 text-bullish border border-bullish/40" : "bg-gold/20 text-gold border border-gold/40"
          }`}>
            {data.alignment_status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Grid of 6 Timeframes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-tabular mb-3">
        {data.timeframes.map((item) => {
          const isTfBull = item.trend === "BULLISH";
          const isTfBear = item.trend === "BEARISH";
          return (
            <div key={item.tf} className="bg-surface/80 p-2.5 rounded border border-border/50 hover:border-border transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-gray-100 text-xs">{item.tf.toUpperCase()}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isTfBull ? "text-bullish bg-bullish/10" : isTfBear ? "text-bearish bg-bearish/10" : "text-gray-400 bg-surface"
                }`}>
                  {item.trend}
                </span>
              </div>

              <div className="space-y-1 text-[10px] text-text-secondary">
                <div className="flex justify-between">
                  <span className="text-text-muted">EMA:</span>
                  <span className="text-gray-300 font-medium truncate ml-1">{item.ema_align.replace(/_/g, " ")}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-muted">RSI (14):</span>
                  <span className={`font-bold ${item.rsi > 70 ? "text-bearish" : item.rsi < 30 ? "text-bullish" : "text-gray-300"}`}>
                    {item.rsi.toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-muted">Structure:</span>
                  <span className="text-gray-300 truncate ml-1">{item.structure.replace(/_/g, " ")}</span>
                </div>

                <div className="flex justify-between pt-1 border-t border-border/30">
                  <span className="text-text-muted">Score:</span>
                  <span className="text-gold font-bold">{item.score}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agreement Summary Footer */}
      <div className="bg-surface/50 px-3 py-2 rounded border border-border/40 text-[11px] text-text-secondary flex items-center space-x-2">
        <Check className="w-3.5 h-3.5 text-bullish shrink-0" />
        <span>{data.agreement_summary}</span>
      </div>
    </div>
  );
}
