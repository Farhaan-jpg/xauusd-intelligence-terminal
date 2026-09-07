"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import RiskBanner from "../components/layout/RiskBanner";
import MarketSnapshotCard from "../components/terminal/MarketSnapshotCard";
import VerdictHeroCard from "../components/terminal/VerdictHeroCard";
import MultiTimeframeGrid from "../components/terminal/MultiTimeframeGrid";
import MacroDashboard from "../components/terminal/MacroDashboard";
import LiquidityRadarView from "../components/terminal/LiquidityRadarView";
import EconomicCalendarView from "../components/terminal/EconomicCalendarView";
import NewsWorkspaceView from "../components/terminal/NewsWorkspaceView";
import TradePlannerWorkspace from "../components/terminal/TradePlannerWorkspace";
import JournalView from "../components/terminal/JournalView";
import AlertsCenter from "../components/terminal/AlertsCenter";
import AnalyticsAccuracyView from "../components/terminal/AnalyticsAccuracyView";
import SettingsView from "../components/terminal/SettingsView";
import AiAnalystModal from "../components/terminal/AiAnalystModal";

import { terminalApi } from "../lib/api";
import { MarketQuote, SessionInfo, ExecutiveVerdict, MultiTimeframeData, EconomicEvent } from "../types/terminal";

export default function TerminalPage() {
  const [activeTab, setActiveTab] = useState<string>("command-center");
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [verdict, setVerdict] = useState<ExecutiveVerdict | null>(null);
  const [mtfData, setMtfData] = useState<MultiTimeframeData | null>(null);
  const [nextEvent, setNextEvent] = useState<EconomicEvent | null>(null);
  const [isLockout, setIsLockout] = useState<boolean>(false);

  // Initial and recurring telemetry fetch
  useEffect(() => {
    async function loadTerminalData() {
      try {
        const [q, s, vRes, mtf] = await Promise.all([
          terminalApi.getQuote(),
          terminalApi.getSessions(),
          terminalApi.getVerdict(),
          terminalApi.getMultiTimeframe(),
        ]);
        setQuote(q);
        setSession(s);
        setVerdict(vRes.verdict);
        setNextEvent(vRes.next_catalyst);
        setIsLockout(vRes.lockout_status?.is_locked_out || false);
        setMtfData(mtf);
      } catch (err) {
        console.warn("Terminal initial sync:", err);
      }
    }

    loadTerminalData();

    // Pulse quote updates every 3.5s
    const interval = setInterval(async () => {
      try {
        const q = await terminalApi.getQuote();
        setQuote(q);
      } catch (e) {
        // silent fallback
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col font-sans">
      {/* Sticky Header with Ticker, Clocks, Sessions & Navigation */}
      <Header
        quote={quote}
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Risk & News Lockout Banner */}
      <RiskBanner
        nextEvent={nextEvent}
        isLockout={isLockout}
        spread={quote ? quote.spread_points : 1.8}
        dailyLossUsedPct={0.0}
        tradesRemaining={5}
      />

      {/* Dynamic Tab Workspace Container */}
      <main className="flex-1 p-3 sm:p-4 max-w-[1680px] w-full mx-auto">
        {activeTab === "command-center" && (
          <div className="space-y-4">
            {/* Top Market Snapshot */}
            <MarketSnapshotCard quote={quote} session={session} />

            {/* Executive Market Verdict Hero */}
            <VerdictHeroCard verdict={verdict} />

            {/* Multi-Timeframe Alignment Matrix */}
            <MultiTimeframeGrid data={mtfData} />
          </div>
        )}

        {activeTab === "macro" && <MacroDashboard />}
        {activeTab === "liquidity" && <LiquidityRadarView />}
        {activeTab === "news" && <NewsWorkspaceView />}
        {activeTab === "calendar" && <EconomicCalendarView />}
        {activeTab === "planner" && <TradePlannerWorkspace />}
        {activeTab === "journal" && <JournalView />}
        {activeTab === "alerts" && <AlertsCenter />}
        {activeTab === "analytics" && <AnalyticsAccuracyView />}
        {activeTab === "settings" && <SettingsView />}
      </main>

      {/* AI Scenario Modal */}
      <AiAnalystModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Terminal Footer with System Telemetry */}
      <footer className="border-t border-border/60 bg-[#080b11] px-4 py-2 text-[10px] text-text-muted flex flex-wrap items-center justify-between gap-2 font-tabular">
        <div className="flex items-center space-x-3">
          <span>XAUUSD INTELLIGENCE TERMINAL v1.0.0</span>
          <span>•</span>
          <span>DEFAULT TIMEZONE: ASIA/KOLKATA (IST)</span>
          <span>•</span>
          <span>MODE: DEMO / 100% FREE TIER READY</span>
        </div>
        <div className="text-gray-400">
          Educational decision-support tool only. Not financial advice.
        </div>
      </footer>
    </div>
  );
}
