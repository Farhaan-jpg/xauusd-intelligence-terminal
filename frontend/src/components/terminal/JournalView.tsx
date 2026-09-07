"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, PlusCircle, Award, CheckCircle, XCircle, BarChart3, TrendingUp, Sparkles } from "lucide-react";
import { terminalApi } from "@/lib/api";
import { JournalTrade } from "@/types/terminal";

export default function JournalView() {
  const [trades, setTrades] = useState<JournalTrade[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [weeklyReview, setWeeklyReview] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // New trade state
  const [newDirection, setNewDirection] = useState<"LONG" | "SHORT">("LONG");
  const [newEntry, setNewEntry] = useState<number>(2652.0);
  const [newExit, setNewExit] = useState<number>(2664.0);
  const [newLots, setNewLots] = useState<number>(0.3);
  const [newSetup, setNewSetup] = useState<string>("ASIA_LOW_SWEEP");
  const [newSession, setNewSession] = useState<string>("LONDON");
  const [newRuleAdherence, setNewRuleAdherence] = useState<boolean>(true);
  const [newEmotion, setNewEmotion] = useState<string>("Disciplined");
  const [newNotes, setNewNotes] = useState<string>("");

  async function refreshJournal() {
    try {
      const [tList, aData, wData] = await Promise.all([
        terminalApi.getJournalTrades(),
        terminalApi.getJournalAnalytics(),
        terminalApi.getWeeklyReview(),
      ]);
      setTrades(tList || []);
      setAnalytics(aData);
      setWeeklyReview(wData);
    } catch (err) {
      console.error("Failed to load journal data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshJournal();
  }, []);

  const handleCreateTrade = async () => {
    const gross = (newExit - newEntry) * (newDirection === "LONG" ? 1 : -1) * newLots * 100;
    const fees = newLots * 6.0;
    const net = gross - fees;
    const pips = (newExit - newEntry) * (newDirection === "LONG" ? 1 : -1) * 10;
    const rMultiple = net / (newLots * 5 * 100);

    try {
      await terminalApi.createJournalTrade({
        symbol: "XAUUSD",
        direction: newDirection,
        entry_price: newEntry,
        exit_price: newExit,
        lot_size: newLots,
        fees_and_swap: fees,
        gross_pnl: gross,
        net_pnl: net,
        pips: pips,
        r_multiple: round(rMultiple, 2),
        setup_tag: newSetup,
        session: newSession,
        regime: "TREND",
        rule_adherence: newRuleAdherence,
        emotional_state: newEmotion,
        notes: newNotes,
      });
      setShowAddModal(false);
      refreshJournal();
    } catch (err) {
      console.error("Failed to create trade:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-xs text-text-muted">
        Loading trade journal history & performance statistics...
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs font-tabular">
      {/* Analytics KPI Row */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-card border border-border rounded-md p-3">
            <span className="text-[10px] text-text-muted uppercase block">Win Rate</span>
            <span className="text-xl font-bold font-mono text-bullish">{analytics.win_rate_pct}%</span>
            <span className="text-[10px] text-text-muted block mt-0.5">{analytics.total_trades} Total Trades</span>
          </div>

          <div className="bg-card border border-border rounded-md p-3">
            <span className="text-[10px] text-text-muted uppercase block">Profit Factor</span>
            <span className="text-xl font-bold font-mono text-gold">{analytics.profit_factor}</span>
            <span className="text-[10px] text-text-muted block mt-0.5">Expectancy: Positive</span>
          </div>

          <div className="bg-card border border-border rounded-md p-3">
            <span className="text-[10px] text-text-muted uppercase block">Average R</span>
            <span className="text-xl font-bold font-mono text-gray-100">+{analytics.average_r}R</span>
            <span className="text-[10px] text-text-muted block mt-0.5">Per Completed Trade</span>
          </div>

          <div className="bg-card border border-border rounded-md p-3">
            <span className="text-[10px] text-text-muted uppercase block">Net Realized P&L</span>
            <span className={`text-xl font-bold font-mono ${analytics.net_pnl_usd >= 0 ? "text-bullish" : "text-bearish"}`}>
              {analytics.net_pnl_usd >= 0 ? "+" : ""}${analytics.net_pnl_usd.toFixed(2)}
            </span>
            <span className="text-[10px] text-text-muted block mt-0.5">After Broker Friction</span>
          </div>

          <div className="bg-card border border-border rounded-md p-3">
            <span className="text-[10px] text-text-muted uppercase block">Rule Adherence</span>
            <span className="text-xl font-bold font-mono text-gold">{analytics.rule_adherence_pct}%</span>
            <span className="text-[10px] text-text-muted block mt-0.5">Discipline Score</span>
          </div>

          <div className="bg-card border border-border rounded-md p-3 flex flex-col justify-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-2 bg-gold text-black font-bold uppercase rounded flex items-center justify-center space-x-1.5 hover:bg-gold-light transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Trade</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Trade History Log */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              Trade Execution Log
            </h2>
          </div>
          <span className="text-[10px] text-text-muted">Recorded Discretionary Positions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-text-muted border-b border-border/40 uppercase text-[10px]">
                <th className="py-2">Symbol / Type</th>
                <th className="py-2">Entry Price</th>
                <th className="py-2">Exit Price</th>
                <th className="py-2">Lot Size</th>
                <th className="py-2">Net P&L ($)</th>
                <th className="py-2">R Multiple</th>
                <th className="py-2">Setup Tag</th>
                <th className="py-2">Session</th>
                <th className="py-2">Rules</th>
                <th className="py-2">Psychology</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {trades.map((t) => {
                const isWin = t.net_pnl > 0;
                return (
                  <tr key={t.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-2.5 font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] mr-1.5 ${
                        t.direction === "LONG" ? "text-bullish bg-bullish/10" : "text-bearish bg-bearish/10"
                      }`}>
                        {t.direction}
                      </span>
                      <span className="text-gray-200">{t.symbol}</span>
                    </td>
                    <td className="py-2.5 font-mono text-gray-200">${t.entry_price.toFixed(2)}</td>
                    <td className="py-2.5 font-mono text-gray-200">${t.exit_price.toFixed(2)}</td>
                    <td className="py-2.5 font-mono text-text-secondary">{t.lot_size.toFixed(2)}</td>
                    <td className={`py-2.5 font-mono font-bold ${isWin ? "text-bullish" : "text-bearish"}`}>
                      {isWin ? "+" : ""}${t.net_pnl.toFixed(2)}
                    </td>
                    <td className={`py-2.5 font-mono font-bold ${t.r_multiple >= 0 ? "text-bullish" : "text-bearish"}`}>
                      {t.r_multiple > 0 ? "+" : ""}{t.r_multiple.toFixed(2)}R
                    </td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-text-secondary">
                        {t.setup_tag}
                      </span>
                    </td>
                    <td className="py-2.5 text-text-muted">{t.session}</td>
                    <td className="py-2.5">
                      {t.rule_adherence ? (
                        <span className="text-bullish flex items-center space-x-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-bearish flex items-center space-x-0.5">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Broken</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-text-secondary text-[10px]">{t.emotional_state}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Process Review Card */}
      {weeklyReview && (
        <div className="bg-card border border-border rounded-md p-4 space-y-3">
          <div className="flex items-center space-x-2 text-gold font-bold uppercase tracking-wider text-[11px] border-b border-border/60 pb-2">
            <Sparkles className="w-4 h-4" />
            <span>Weekly Discretionary Review & Process Calibration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-surface/70 p-3 rounded border border-bullish/20 space-y-1.5">
              <span className="font-bold text-bullish text-[11px] uppercase block">What Worked Well:</span>
              <ul className="space-y-1 text-gray-300 text-[11px]">
                {weeklyReview.what_worked.map((w: string, i: number) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-bullish font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface/70 p-3 rounded border border-bearish/20 space-y-1.5">
              <span className="font-bold text-bearish text-[11px] uppercase block">What Did Not Work / Leaks:</span>
              <ul className="space-y-1 text-gray-300 text-[11px]">
                {weeklyReview.what_did_not_work.map((w: string, i: number) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-bearish font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gold/10 border border-gold/30 p-3 rounded text-[11px] text-gray-200">
            <strong className="text-gold uppercase block text-[10px] mb-0.5">Actionable Rule for Next Week:</strong>
            {weeklyReview.actionable_process_improvement}
          </div>
        </div>
      )}

      {/* Modal: Log New Trade */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-lg w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-bold text-gray-100 text-sm font-mono uppercase">Log Completed Trade</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setNewDirection("LONG")}
                  className={`py-1.5 rounded font-bold uppercase ${newDirection === "LONG" ? "bg-bullish text-black" : "bg-surface text-gray-400"}`}
                >
                  LONG
                </button>
                <button
                  onClick={() => setNewDirection("SHORT")}
                  className={`py-1.5 rounded font-bold uppercase ${newDirection === "SHORT" ? "bg-bearish text-white" : "bg-surface text-gray-400"}`}
                >
                  SHORT
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Entry ($)</label>
                  <input
                    type="number"
                    value={newEntry}
                    onChange={(e) => setNewEntry(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-gray-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Exit ($)</label>
                  <input
                    type="number"
                    value={newExit}
                    onChange={(e) => setNewExit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-gray-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Lots</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newLots}
                    onChange={(e) => setNewLots(parseFloat(e.target.value) || 0.01)}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-gray-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Setup Tag</label>
                  <select
                    value={newSetup}
                    onChange={(e) => setNewSetup(e.target.value)}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-gray-200"
                  >
                    <option value="ASIA_LOW_SWEEP">ASIA_LOW_SWEEP</option>
                    <option value="ASIA_HIGH_SWEEP">ASIA_HIGH_SWEEP</option>
                    <option value="PULLBACK_EMA">PULLBACK_EMA</option>
                    <option value="BREAKOUT_RETEST">BREAKOUT_RETEST</option>
                    <option value="NEWS_FADE">NEWS_FADE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Session</label>
                  <select
                    value={newSession}
                    onChange={(e) => setNewSession(e.target.value)}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-gray-200"
                  >
                    <option value="LONDON">LONDON</option>
                    <option value="NEW_YORK">NEW_YORK</option>
                    <option value="OVERLAP">OVERLAP</option>
                    <option value="ASIA">ASIA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-text-muted block mb-1">Psychological State</label>
                <input
                  type="text"
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  placeholder="e.g. Calm, Patient, Slightly rushed"
                  className="w-full bg-surface border border-border rounded px-2.5 py-1 text-gray-200"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rules"
                  checked={newRuleAdherence}
                  onChange={(e) => setNewRuleAdherence(e.target.checked)}
                  className="rounded bg-surface border-border text-gold"
                />
                <label htmlFor="rules" className="text-[11px] text-gray-200">
                  Did you strictly follow pre-trade plan rules?
                </label>
              </div>

              <div>
                <label className="text-[10px] text-text-muted block mb-1">Notes & Lessons</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-surface border border-border rounded px-2.5 py-1.5 text-gray-200 text-xs"
                  placeholder="What was the entry trigger? Did you manage stop appropriately?"
                />
              </div>

              <button
                onClick={handleCreateTrade}
                className="w-full py-2 bg-gold text-black font-bold uppercase rounded hover:bg-gold-light transition-all"
              >
                Save to Journal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function round(val: number, decimals: number): number {
  return Number(Math.round(Number(val + "e" + decimals)) + "e-" + decimals);
}
