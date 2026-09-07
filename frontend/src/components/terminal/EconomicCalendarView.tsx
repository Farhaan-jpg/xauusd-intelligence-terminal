"use client";

import React, { useEffect, useState } from "react";
import { Calendar, AlertTriangle, Clock, Timer, Info, HelpCircle } from "lucide-react";
import { terminalApi } from "../../lib/api";
import { EconomicEvent } from "../../types/terminal";

export default function EconomicCalendarView() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [lockout, setLockout] = useState<any>(null);
  const [filterImportance, setFilterImportance] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCalendar() {
      try {
        const [evList, lk] = await Promise.all([
          terminalApi.getCalendarEvents(),
          terminalApi.getLockoutStatus(),
        ]);
        setEvents(evList || []);
        setLockout(lk);
        if (evList && evList.length > 0) {
          setSelectedEvent(evList[0]);
        }
      } catch (err) {
        console.error("Failed to load calendar:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCalendar();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-xs text-text-muted">
        Loading institutional economic calendar with IST conversion...
      </div>
    );
  }

  const filteredEvents = events.filter((e) => {
    if (filterImportance === "ALL") return true;
    if (filterImportance === "HIGH_ONLY") return e.importance === "HIGH" || e.importance === "CRITICAL";
    return e.importance === filterImportance;
  });

  return (
    <div className="space-y-4 text-xs font-tabular">
      {/* Calendar Header & News Lockout Protocol Strip */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              XAUUSD Economic Catalyst Calendar
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-surface p-0.5 rounded border border-border">
            {["ALL", "HIGH_ONLY", "CRITICAL"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterImportance(f)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                  filterImportance === f
                    ? "bg-gold text-black shadow-xs"
                    : "text-text-muted hover:text-gray-200"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Lockout Window Explainer */}
        <div className="bg-surface/70 p-2.5 rounded border border-border/60 flex items-start space-x-2 text-[11px]">
          <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gray-200 block">News Lockout Guardrail Protocol (±15 min):</span>
            <span className="text-text-secondary">
              High-impact catalysts (CPI, FOMC, NFP) trigger severe spread expansion and slippage. Discretionary discipline mandates standing aside 15 minutes before and 15 minutes after official prints.
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Events Table & Historical Impact Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Events Table (2 Cols) */}
        <div className="bg-card border border-border rounded-md p-4 lg:col-span-2 overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-text-muted border-b border-border/60 uppercase text-[10px]">
                <th className="py-2">Event Title</th>
                <th className="py-2">IST Time</th>
                <th className="py-2">UTC</th>
                <th className="py-2">Impact</th>
                <th className="py-2">Forecast</th>
                <th className="py-2">Previous</th>
                <th className="py-2">Countdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredEvents.map((e) => {
                const isSelected = selectedEvent?.id === e.id;
                const isCritical = e.importance === "CRITICAL";
                const isHigh = e.importance === "HIGH";

                return (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-gold/10 text-gray-100" : "hover:bg-surface/50 text-gray-300"
                    }`}
                  >
                    <td className="py-2.5 font-bold">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-gold font-mono text-[10px]">{e.country}</span>
                        <span>{e.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-gray-200">{e.time_ist}</td>
                    <td className="py-2.5 text-text-muted text-[10px]">{e.time_utc}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? "bg-bearish/20 text-bearish border border-bearish/40"
                          : isHigh
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "bg-surface text-gray-400"
                      }`}>
                        {e.importance}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono">{e.forecast || "--"}</td>
                    <td className="py-2.5 font-mono text-text-muted">{e.previous || "--"}</td>
                    <td className="py-2.5 font-bold text-gold">{e.countdown}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Historical Volatility & Impact Analysis (1 Col) */}
        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex items-center space-x-2 text-gold font-bold mb-3 uppercase tracking-wider text-[11px] border-b border-border/60 pb-2">
            <Info className="w-4 h-4" />
            <span>Catalyst Intelligence & Volatility</span>
          </div>

          {selectedEvent ? (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-text-muted uppercase block">Selected Catalyst</span>
                <h3 className="text-sm font-bold text-gray-100">{selectedEvent.title}</h3>
                <span className="text-[11px] text-gold font-bold">{selectedEvent.time_ist}</span>
              </div>

              {/* Historical XAUUSD Moves */}
              <div className="bg-surface/80 p-3 rounded border border-border/60">
                <span className="text-[10px] uppercase font-bold text-text-muted block mb-2">
                  Historical Gold Movement Statistics
                </span>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-card p-1.5 rounded border border-border/40">
                    <span className="text-[9px] text-text-muted block">Avg 5M</span>
                    <span className="text-xs font-bold text-gray-200">±{selectedEvent.historical_pips.avg_5m} pips</span>
                  </div>
                  <div className="bg-card p-1.5 rounded border border-border/40">
                    <span className="text-[9px] text-text-muted block">Avg 15M</span>
                    <span className="text-xs font-bold text-gray-200">±{selectedEvent.historical_pips.avg_15m} pips</span>
                  </div>
                  <div className="bg-card p-1.5 rounded border border-border/40">
                    <span className="text-[9px] text-text-muted block">Avg 1H</span>
                    <span className="text-xs font-bold text-gray-200">±{selectedEvent.historical_pips.avg_1h} pips</span>
                  </div>
                </div>
              </div>

              {/* Economic Mechanism */}
              <div className="bg-surface/60 p-3 rounded border border-border/40 text-[11px] leading-relaxed">
                <span className="text-[10px] uppercase font-bold text-gold block mb-1">
                  How this affects Gold Price:
                </span>
                <p className="text-gray-300">
                  {selectedEvent.impact_explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-text-muted py-8">Select an event to view historical volatility.</div>
          )}
        </div>
      </div>
    </div>
  );
}
