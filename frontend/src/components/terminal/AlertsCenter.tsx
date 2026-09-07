"use client";

import React, { useEffect, useState } from "react";
import { Bell, ShieldAlert, CheckCircle, PlusCircle, AlertTriangle, Clock } from "lucide-react";
import { terminalApi } from "../../lib/api";

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [newType, setNewType] = useState<string>("LIQUIDITY_SWEEP");
  const [cooldown, setCooldown] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAlerts(isInitial = false) {
      try {
        const [aList, hList] = await Promise.all([
          terminalApi.getAlerts(),
          terminalApi.getAlertHistory(),
        ]);
        setAlerts(aList || []);
        setHistory(hList || []);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    }

    loadAlerts(true);
    const interval = setInterval(() => {
      loadAlerts(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    try {
      const res = await terminalApi.calculateRisk({ alert_type: newType, cooldown_minutes: cooldown });
      const updated = await terminalApi.getAlerts();
      setAlerts(updated || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-xs text-text-muted">
        Loading alert automation triggers & cooldown limits...
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs font-tabular">
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              Alert Automation & Notification Matrix
            </h2>
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-bullish/10 border border-bullish/30 text-[9px] text-bullish font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-ping"></span>
              <span>LIVE MONITOR</span>
            </span>
          </div>
          <span className="text-[10px] text-text-muted">Deduplicated • Rate-Limited • Opt-in Only</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Configured Triggers */}
          <div className="space-y-3">
            <h3 className="text-gray-300 font-bold uppercase text-[11px] border-b border-border/40 pb-1">
              Active Trigger Rules
            </h3>
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="bg-surface/70 p-3 rounded border border-border/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-200 block text-xs">{a.alert_type.replace(/_/g, " ")}</span>
                    <span className="text-[10px] text-text-muted">
                      Cooldown: {a.cooldown_minutes} min • Status: Active
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-bullish animate-pulse"></span>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger History */}
          <div className="space-y-3">
            <h3 className="text-gray-300 font-bold uppercase text-[11px] border-b border-border/40 pb-1">
              Recent Dispatched Notifications
            </h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="bg-surface/70 p-3 rounded border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gold font-bold text-[11px]">{h.type.replace(/_/g, " ")}</span>
                    <span className="text-[10px] text-text-muted">{h.timestamp}</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">{h.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
