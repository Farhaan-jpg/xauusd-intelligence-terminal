"use client";

import React, { useState, useEffect } from "react";
import { Bot, Sparkles, RefreshCw, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { terminalApi } from "../../lib/api";

interface AiAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiAnalystModal({ isOpen, onClose }: AiAnalystModalProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await terminalApi.runAiAnalysis();
      setAnalysis(res);
    } catch (err) {
      console.error("Failed to run AI analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis) {
      runAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0b0f17] border border-border rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl font-tabular text-xs">
        {/* Modal Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-surface/80">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-gold" />
            <div>
              <h3 className="text-sm font-bold text-gray-100 font-mono uppercase">
                Gold Analyst — Quantitative Synthesis
              </h3>
              <span className="text-[10px] text-text-muted">
                Telemetry-Grounded Market Scenario Assessment • No Predictive Promises
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="p-1.5 rounded bg-surface hover:bg-surface/80 border border-border text-gray-300 transition-colors"
              title="Re-run Synthesis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-gold" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-surface hover:bg-surface/80 border border-border text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: 9 Structured Sections */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {loading ? (
            <div className="text-center py-12 space-y-2 text-text-muted">
              <Sparkles className="w-6 h-6 text-gold animate-spin mx-auto" />
              <p>Grounding scenario models against live telemetry and orderbook structure...</p>
            </div>
          ) : analysis ? (
            analysis.format_sections.map((sec: any, idx: number) => (
              <div key={idx} className="bg-surface/70 p-3 rounded border border-border/50 space-y-1">
                <span className="font-bold text-gold uppercase text-[10px] tracking-wider block">
                  {sec.section}
                </span>
                <p className="text-gray-200 text-[11px] leading-relaxed font-sans">
                  {sec.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-text-muted">Unable to run scenario generation.</div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border/60 bg-surface/40 flex items-center justify-between text-[10px] text-text-muted">
          <span>Generated at {analysis?.timestamp_generated || "Live"}</span>
          <span className="text-gold font-bold">DISCRETIONARY DECISION SUPPORT ONLY</span>
        </div>
      </div>
    </div>
  );
}
