"use client";

import React, { useEffect, useState } from "react";
import { Newspaper, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Tag } from "lucide-react";
import { terminalApi } from "../../lib/api";
import { NewsCatalyst } from "../../types/terminal";

export default function NewsWorkspaceView() {
  const [news, setNews] = useState<NewsCatalyst[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const items = await terminalApi.getNewsCatalysts();
        setNews(items || []);
      } catch (err) {
        console.error("Failed to load news catalysts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-xs text-text-muted">
        Ingesting financial news catalysts & scoring gold sentiment...
      </div>
    );
  }

  const categories = ["ALL", "MONETARY_POLICY", "CENTRAL_BANKS", "CURRENCY_FX", "GEOPOLITICS"];

  const filteredNews = news.filter((item) => {
    if (selectedCategory === "ALL") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-4 text-xs font-tabular">
      {/* Header Bar */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              News & Catalyst Intelligence
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1 bg-surface p-0.5 rounded border border-border">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                  selectedCategory === cat
                    ? "bg-gold text-black shadow-xs"
                    : "text-text-muted hover:text-gray-200"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-text-muted">
          All news items pass through deduplication and relevance scoring. AI bullet summaries separate raw facts from model inference.
        </div>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((item) => {
          const isGoldPos = item.sentiment === "GOLD_POSITIVE";
          const isGoldNeg = item.sentiment === "GOLD_NEGATIVE";

          return (
            <div
              key={item.id}
              className="bg-card border border-border rounded-md p-4 hover:border-border/80 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Meta Top: Source, Time, Sentiment, Relevance */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="font-bold text-gray-300">{item.source}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{item.published_ago}</span>
                    {item.is_verified && (
                      <span className="flex items-center text-bullish space-x-0.5 text-[9px]">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-secondary">
                      Rel: {item.relevance_score}/10
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isGoldPos 
                        ? "bg-bullish/20 text-bullish border border-bullish/40" 
                        : isGoldNeg 
                        ? "bg-bearish/20 text-bearish border border-bearish/40" 
                        : "bg-surface text-gray-300 border-border"
                    }`}>
                      {item.sentiment.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-sm font-bold text-gray-100 mb-2.5 leading-snug">
                  {item.headline}
                </h3>

                {/* AI Concise Summary Bullets */}
                <div className="bg-surface/80 p-2.5 rounded border border-border/50 mb-3">
                  <span className="text-[10px] font-bold uppercase text-gold block mb-1">
                    AI Bullet Telemetry
                  </span>
                  <ul className="space-y-1 text-[11px] text-gray-300">
                    {item.ai_summary.map((b, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-gold font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom: Why it matters & Priced in */}
              <div className="pt-2.5 border-t border-border/40 space-y-1.5 text-[11px]">
                <div>
                  <span className="font-bold text-gray-300">Why it matters for Gold: </span>
                  <span className="text-text-secondary">{item.why_it_matters}</span>
                </div>
                <div className="text-[10px]">
                  <span className="text-text-muted">Market Pricing: </span>
                  <span className="text-gold font-mono">{item.priced_in}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
