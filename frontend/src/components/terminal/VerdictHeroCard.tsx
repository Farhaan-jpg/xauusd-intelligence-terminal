"use client";

import React from "react";
import { 
  Compass, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  Zap
} from "lucide-react";
import { ExecutiveVerdict } from "../../types/terminal";

interface VerdictHeroCardProps {
  verdict: ExecutiveVerdict | null;
}

export default function VerdictHeroCard({ verdict }: VerdictHeroCardProps) {
  if (!verdict) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-center text-xs text-text-muted">
        Computing multi-dimensional algorithmic verdict...
      </div>
    );
  }

  const isBullish = verdict.directional_bias === "BULLISH";
  const isBearish = verdict.directional_bias === "BEARISH";
  const isLockout = verdict.is_lockout;

  const biasBadgeColor = isLockout
    ? "bg-bearish text-white border-red-500"
    : isBullish
    ? "bg-bullish/20 text-bullish border-bullish/50"
    : isBearish
    ? "bg-bearish/20 text-bearish border-bearish/50"
    : "bg-surface text-gray-300 border-border";

  return (
    <div className="bg-card border border-border rounded-md p-4 text-xs">
      {/* Top Banner: Verdict & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-gold" />
            <span className="font-mono uppercase font-bold text-gray-200 tracking-wider text-[11px]">
              Executive Market Verdict
            </span>
          </div>

          <div className={`px-2.5 py-1 rounded border font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 ${biasBadgeColor}`}>
            {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : isBearish ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            <span>{verdict.directional_bias.replace("_", " ")}</span>
          </div>

          <div className="hidden sm:inline-block bg-surface px-2 py-0.5 rounded border border-border text-[11px] text-gray-300 font-medium">
            Regime: <strong className="text-gray-100">{verdict.market_regime.replace(/_/g, " ")}</strong>
          </div>
        </div>

        {/* Scores: Conviction, Volatility, Risk Env */}
        <div className="flex items-center space-x-3 font-tabular">
          {/* Conviction Meter */}
          <div className="flex items-center space-x-1.5 bg-surface/80 px-2.5 py-1 rounded border border-border">
            <span className="text-[10px] text-text-muted uppercase">Conviction:</span>
            <span className={`font-bold ${verdict.conviction_score >= 70 ? "text-gold" : "text-gray-300"}`}>
              {verdict.conviction_score}/100
            </span>
            <span className="text-[9px] px-1 rounded bg-card text-text-secondary">
              {verdict.confidence_band}
            </span>
          </div>

          {/* Volatility */}
          <div className="hidden md:flex items-center space-x-1.5 bg-surface/80 px-2.5 py-1 rounded border border-border">
            <span className="text-[10px] text-text-muted uppercase">Volatility:</span>
            <span className="font-bold text-gray-300">{verdict.volatility_score}/100</span>
          </div>

          {/* Risk Environment */}
          <div className="flex items-center space-x-1.5 bg-surface/80 px-2.5 py-1 rounded border border-border">
            <span className="text-[10px] text-text-muted uppercase">Risk Env:</span>
            <span className={`font-bold ${
              verdict.risk_environment === "EXTREME" 
                ? "text-bearish" 
                : verdict.risk_environment === "ELEVATED" 
                ? "text-gold" 
                : "text-bullish"
            }`}>
              {verdict.risk_environment}
            </span>
          </div>
        </div>
      </div>

      {/* One-Sentence Thesis Card */}
      <div className="bg-surface/90 p-3 rounded border border-border/70 mb-3.5">
        <div className="flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gold block mb-0.5">
              Core Intraday Thesis
            </span>
            <p className="text-xs text-gray-100 font-medium leading-relaxed">
              {verdict.one_sentence_thesis}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column: Supporting Factors vs Invalidation Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
        {/* Supporting Factors */}
        <div className="bg-surface/50 p-3 rounded border border-bullish/20">
          <div className="flex items-center space-x-1.5 text-bullish font-bold mb-2 text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Supporting Factors</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-gray-300 leading-snug">
            {verdict.supporting_factors.map((factor, i) => (
              <li key={i} className="flex items-start space-x-1.5">
                <span className="text-bullish font-bold">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Invalidation Factors */}
        <div className="bg-surface/50 p-3 rounded border border-bearish/20">
          <div className="flex items-center space-x-1.5 text-bearish font-bold mb-2 text-[11px] uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" />
            <span>Key Invalidation Criteria</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-gray-300 leading-snug">
            {verdict.invalidation_factors.map((inval, i) => (
              <li key={i} className="flex items-start space-x-1.5">
                <span className="text-bearish font-bold">•</span>
                <span>{inval}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Strip: What would change my mind? + Best action now */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/70 p-2.5 rounded border border-border/80 text-[11px]">
        <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
          <HelpCircle className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className="text-text-secondary">
            <strong className="text-gray-300">What would change my mind?</strong> {verdict.what_changes_mind}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-gray-400">Best Action Now:</span>
          <span className="bg-gold/15 text-gold border border-gold/40 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
            {verdict.best_action_now}
          </span>
        </div>
      </div>
    </div>
  );
}
