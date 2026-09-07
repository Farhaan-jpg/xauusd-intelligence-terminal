"use client";

import React, { useEffect, useState } from "react";
import { Sliders, ShieldCheck, Database, Save, Check } from "lucide-react";
import { terminalApi } from "../../lib/api";

export default function SettingsView() {
  const [profile, setProfile] = useState<any>(null);
  const [brokerName, setBrokerName] = useState<string>("Standard ECN Gold");
  const [contractSize, setContractSize] = useState<number>(100.0);
  const [commission, setCommission] = useState<number>(6.0);
  const [typicalSpread, setTypicalSpread] = useState<number>(1.8);
  const [balance, setBalance] = useState<number>(10000.0);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(3.0);
  const [maxTradeRisk, setMaxTradeRisk] = useState<number>(1.0);
  const [maxDailyTrades, setMaxDailyTrades] = useState<number>(5);
  const [timezone, setTimezone] = useState<string>("Asia/Kolkata");
  const [saved, setSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await terminalApi.getProfileSettings();
        setProfile(res);
        if (res) {
          setBrokerName(res.broker?.broker_name || "Standard ECN Gold");
          setContractSize(res.broker?.contract_size || 100.0);
          setCommission(res.broker?.commission_per_lot || 6.0);
          setTypicalSpread(res.broker?.typical_spread || 1.8);
          setBalance(res.risk?.account_balance || 10000.0);
          setMaxDailyLoss(res.risk?.max_daily_loss_pct || 3.0);
          setMaxTradeRisk(res.risk?.max_trade_risk_pct || 1.0);
          setMaxDailyTrades(res.risk?.max_daily_trades || 5);
          setTimezone(res.preferences?.timezone || "Asia/Kolkata");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await terminalApi.updateProfileSettings({
        broker_name: brokerName,
        contract_size: contractSize,
        commission_per_lot: commission,
        typical_spread: typicalSpread,
        account_balance: balance,
        max_daily_loss_pct: maxDailyLoss,
        max_trade_risk_pct: maxTradeRisk,
        max_daily_trades: maxDailyTrades,
        timezone: timezone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-6 animate-pulse text-xs text-text-muted">
        Loading configuration profiles and broker parameters...
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs font-tabular max-w-4xl">
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-gold" />
            <h2 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
              Broker Specifications & Risk Parameters
            </h2>
          </div>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-gold text-black font-bold uppercase rounded flex items-center space-x-1.5 hover:bg-gold-light transition-all shadow-xs"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? "Saved" : "Save Changes"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Broker Contract Specs */}
          <div className="bg-surface/70 p-3.5 rounded border border-border/50 space-y-3">
            <h3 className="font-bold text-gray-200 uppercase text-[11px] border-b border-border/40 pb-1">
              Broker Specifications
            </h3>

            <div>
              <label className="text-[10px] text-text-muted block mb-1">Broker Profile Name</label>
              <input
                type="text"
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                className="w-full bg-card border border-border rounded px-2.5 py-1 text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Contract Size (oz)</label>
                <input
                  type="number"
                  value={contractSize}
                  onChange={(e) => setContractSize(parseFloat(e.target.value) || 100)}
                  className="w-full bg-card border border-border rounded px-2.5 py-1 font-mono text-gray-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Typical Spread (pts)</label>
                <input
                  type="number"
                  step="0.1"
                  value={typicalSpread}
                  onChange={(e) => setTypicalSpread(parseFloat(e.target.value) || 1.8)}
                  className="w-full bg-card border border-border rounded px-2.5 py-1 font-mono text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-text-muted block mb-1">Round-Turn Commission ($/lot)</label>
              <input
                type="number"
                step="0.5"
                value={commission}
                onChange={(e) => setCommission(parseFloat(e.target.value) || 6)}
                className="w-full bg-card border border-border rounded px-2.5 py-1 font-mono text-gray-100"
              />
            </div>
          </div>

          {/* Risk Limits */}
          <div className="bg-surface/70 p-3.5 rounded border border-border/50 space-y-3">
            <h3 className="font-bold text-gray-200 uppercase text-[11px] border-b border-border/40 pb-1">
              Personal Risk Limits & Guardrails
            </h3>

            <div>
              <label className="text-[10px] text-text-muted block mb-1">Account Balance ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-card border border-border rounded px-2.5 py-1 font-mono text-gold font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Max Daily Loss (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(parseFloat(e.target.value) || 3)}
                  className="w-full bg-card border border-border rounded px-2.5 py-1 font-mono text-bearish font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Max Trade Risk (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxTradeRisk}
                  onChange={(e) => setMaxTradeRisk(parseFloat(e.target.value) || 1)}
                  className="w-full bg-card border border-border rounded px-2.5 py-1 font-mono text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Max Daily Trades</label>
                <input
                  type="number"
                  value={maxDailyTrades}
                  onChange={(e) => setMaxDailyTrades(parseInt(e.target.value) || 5)}
                  className="w-full bg-card border border-border rounded px-2.5 py-1 font-mono text-gray-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Default Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  disabled
                  className="w-full bg-card/60 border border-border rounded px-2.5 py-1 font-mono text-text-muted cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Status & Demo Mode Info */}
        <div className="bg-surface/50 p-3 rounded border border-border/40 space-y-1.5 text-[11px]">
          <div className="flex items-center space-x-2 text-gold font-bold uppercase text-[10px]">
            <Database className="w-3.5 h-3.5" />
            <span>Data Provider Status (100% Free Tier Compliant)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
            <div className="bg-card p-2 rounded border border-border">
              <span className="text-text-muted block">XAUUSD Feed:</span>
              <span className="text-bullish font-bold">Simulated High-Res / YF</span>
            </div>
            <div className="bg-card p-2 rounded border border-border">
              <span className="text-text-muted block">Macro Drivers:</span>
              <span className="text-bullish font-bold">FRED / Stooq Proxy</span>
            </div>
            <div className="bg-card p-2 rounded border border-border">
              <span className="text-text-muted block">Economic Calendar:</span>
              <span className="text-bullish font-bold">ForexFactory / Internal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
