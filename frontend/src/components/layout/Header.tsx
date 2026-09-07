"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  Globe, 
  Flame, 
  AlertTriangle, 
  Bot,
  Layers,
  LineChart,
  Calendar,
  Compass,
  FileText,
  Sliders,
  Bell,
  BarChart2,
  Newspaper,
  BookOpen
} from "lucide-react";
import { MarketQuote, SessionInfo } from "@/types/terminal";

interface HeaderProps {
  quote: MarketQuote | null;
  session: SessionInfo | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAiModal: () => void;
}

export default function Header({ quote, session, activeTab, setActiveTab, onOpenAiModal }: HeaderProps) {
  const [istTime, setIstTime] = useState<string>("");
  const [utcTime, setUtcTime] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Format IST (Asia/Kolkata)
      const istStr = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      // Format UTC
      const utcStr = now.toLocaleTimeString("en-GB", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
      setIstTime(istStr);
      setUtcTime(utcStr);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: "command-center", label: "Command Center", icon: Layers },
    { id: "chart", label: "Live Chart", icon: LineChart },
    { id: "macro", label: "Macro & Drivers", icon: Globe },
    { id: "liquidity", label: "Liquidity Radar", icon: Compass },
    { id: "news", label: "News & Catalysts", icon: Newspaper },
    { id: "calendar", label: "Economic Calendar", icon: Calendar },
    { id: "planner", label: "Trade Planner", icon: Sliders },
    { id: "journal", label: "Journal & Review", icon: BookOpen },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "analytics", label: "Analytics & Edge", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Sliders },
  ];

  const spread = quote ? quote.spread_points : 1.8;
  const isWideSpread = spread > 3.0;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#080b11]/95 backdrop-blur-md">
      {/* Mandatory Permanent Disclaimer Banner */}
      <div className="bg-[#121824] px-4 py-1 border-b border-border flex items-center justify-between text-[11px] text-text-muted">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 text-gold shrink-0" />
          <span>
            <strong className="text-gray-300">DISCLAIMER:</strong> Educational decision-support tool only. Not financial advice. Trading leveraged products carries severe risk of substantial capital loss.
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-4 font-tabular text-[10px]">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse-slow"></span>
            <span className="text-text-secondary">SYSTEM FRESHNESS: LIVE</span>
          </span>
          <span className="text-text-muted">|</span>
          <span className="text-gold">100% FREE TIER READY</span>
        </div>
      </div>

      {/* Main Ticker Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-border/60">
        {/* Left: Terminal Identity & Price Ticker */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-6 bg-gold rounded-xs"></div>
            <div>
              <h1 className="text-xs font-bold tracking-wider text-gray-200 uppercase font-mono">
                XAUUSD Intelligence Terminal
              </h1>
              <div className="text-[10px] text-text-muted">Institutional Decision Matrix</div>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-border hidden sm:block"></div>

          {/* Live Quote Pill */}
          {quote ? (
            <div className="flex items-center space-x-3 bg-card px-3 py-1.5 rounded border border-border">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400">SPOT</span>
                <span className="ml-1 text-sm font-bold font-tabular text-gold">
                  ${quote.price.toFixed(2)}
                </span>
              </div>

              <div className="text-[11px] font-tabular">
                <span className={quote.change_points >= 0 ? "text-bullish" : "text-bearish"}>
                  {quote.change_points >= 0 ? "+" : ""}{quote.change_points.toFixed(2)} ({quote.change_pct >= 0 ? "+" : ""}{quote.change_pct.toFixed(2)}%)
                </span>
              </div>

              <div className="hidden lg:flex items-center space-x-2 text-[10px] font-tabular text-text-muted border-l border-border/80 pl-2">
                <span>B: <strong className="text-gray-300">{quote.bid.toFixed(2)}</strong></span>
                <span>A: <strong className="text-gray-300">{quote.ask.toFixed(2)}</strong></span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isWideSpread ? "bg-bearish/20 text-bearish border border-bearish/40" : "bg-surface text-gray-300"
                }`}>
                  SPR: {spread.toFixed(1)} pts
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-text-muted animate-pulse">Syncing gold quote feed...</div>
          )}
        </div>

        {/* Right: Dual Time (IST + UTC), Session, and AI Button */}
        <div className="flex items-center space-x-3">
          {/* Active Global Session */}
          <div className="hidden md:flex items-center space-x-1.5 bg-surface px-2.5 py-1.5 rounded border border-border text-xs">
            <span className="w-2 h-2 rounded-full bg-bullish animate-pulse"></span>
            <span className="text-gray-300 font-medium text-[11px]">
              {session?.current_session || "London - NY Overlap"}
            </span>
          </div>

          {/* Clocks: IST Primary + UTC Secondary */}
          <div className="flex items-center space-x-2 bg-surface px-2.5 py-1 rounded border border-border text-xs font-tabular">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold text-gray-200">{istTime || "--:--:-- IST"}</span>
              <span className="text-[9px] text-text-muted">{utcTime || "--:--:--"} UTC</span>
            </div>
          </div>

          {/* AI Gold Analyst Launcher */}
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold px-3 py-1.5 rounded text-xs font-medium transition-all shadow-xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Gold Analyst</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar (11 Primary Tabs) */}
      <nav className="flex items-center overflow-x-auto no-scrollbar px-2 bg-[#0a0e16] border-t border-border/40 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 whitespace-nowrap font-medium transition-all border-b-2 text-[11px] uppercase tracking-wide ${
                isActive
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-text-muted hover:text-gray-200 hover:bg-surface/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
