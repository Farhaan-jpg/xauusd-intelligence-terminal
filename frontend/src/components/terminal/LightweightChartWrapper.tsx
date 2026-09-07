"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { LineChart, Sliders, Maximize2, Layers, RefreshCw } from "lucide-react";
import { terminalApi } from "../../lib/api";

interface ChartProps {
  initialTimeframe?: string;
}

export default function LightweightChartWrapper({ initialTimeframe = "15m" }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  
  const [timeframe, setTimeframe] = useState<string>(initialTimeframe);
  const [loading, setLoading] = useState<boolean>(false);
  const [showEma, setShowEma] = useState<boolean>(true);
  const [showRsi, setShowRsi] = useState<boolean>(true);

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const timeframes = ["1m", "5m", "15m", "1h", "4h", "1d"];

  const loadChartData = async (tf: string) => {
    setLoading(true);
    try {
      const candles = await terminalApi.getCandles(tf, 120);
      if (candleSeriesRef.current && candles && candles.length > 0) {
        // Format for lightweight charts
        const formatted: CandlestickData[] = candles.map((c: any) => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        candleSeriesRef.current.setData(formatted);

        // Compute EMAs on closes
        if (showEma && ema20SeriesRef.current && ema50SeriesRef.current) {
          const closes = candles.map((c: any) => c.close);
          const ema20 = calculateSimpleEma(closes, 20);
          const ema50 = calculateSimpleEma(closes, 50);

          const ema20Data = candles.map((c: any, i: number) => ({
            time: c.time as any,
            value: ema20[i] || c.close,
          }));
          const ema50Data = candles.map((c: any, i: number) => ({
            time: c.time as any,
            value: ema50[i] || c.close,
          }));

          ema20SeriesRef.current.setData(ema20Data);
          ema50SeriesRef.current.setData(ema50Data);
        }

        // Compute RSI for sub-chart
        if (showRsi && rsiSeriesRef.current) {
          const closes = candles.map((c: any) => c.close);
          const rsiValues = calculateSimpleRsi(closes, 14);
          const rsiData = candles.map((c: any, i: number) => ({
            time: c.time as any,
            value: rsiValues[i] || 50,
          }));
          rsiSeriesRef.current.setData(rsiData);
        }

        chartRef.current?.timeScale().fitContent();
        rsiChartRef.current?.timeScale().fitContent();
      }
    } catch (err) {
      console.error("Failed to load chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create Main Candlestick Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#080b11" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        vertLine: { color: "#f59e0b", width: 1, style: 3 },
        horzLine: { color: "#f59e0b", width: 1, style: 3 },
      },
      timeScale: {
        borderColor: "#1f2937",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#1f2937",
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const ema20Series = chart.addLineSeries({
      color: "#38bdf8",
      lineWidth: 1,
      title: "EMA 20",
    });

    const ema50Series = chart.addLineSeries({
      color: "#f59e0b",
      lineWidth: 1,
      title: "EMA 50",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;

    // Create Sub-chart for RSI
    if (rsiContainerRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        layout: {
          background: { color: "#0a0e16" },
          textColor: "#6b7280",
        },
        grid: {
          vertLines: { color: "transparent" },
          horzLines: { color: "rgba(255, 255, 255, 0.02)" },
        },
        timeScale: { visible: false },
        rightPriceScale: {
          borderColor: "#1f2937",
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
      });

      const rsiSeries = rsiChart.addLineSeries({
        color: "#a855f7",
        lineWidth: 1,
        title: "RSI(14)",
      });

      rsiChartRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;
    }

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: 440,
        });
      }
      if (rsiContainerRef.current && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({
          width: rsiContainerRef.current.clientWidth,
          height: 120,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Initial fetch
    loadChartData(timeframe);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      rsiChartRef.current?.remove();
    };
  }, []);

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    loadChartData(tf);
  };

  return (
    <div className="bg-card border border-border rounded-md p-4 text-xs font-tabular">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <LineChart className="w-4 h-4 text-gold" />
          <h3 className="font-bold text-gray-200 tracking-wider uppercase font-mono">
            XAUUSD Interactive Candlestick Engine
          </h3>
          <span className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-text-muted border border-border">
            TradingView Engine
          </span>
        </div>

        {/* Timeframe Switcher & Toggles */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-surface p-0.5 rounded border border-border">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                  timeframe === tf
                    ? "bg-gold text-black shadow-xs"
                    : "text-text-muted hover:text-gray-200"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEma(!showEma)}
            className={`px-2 py-1 rounded text-[11px] border ${
              showEma ? "bg-surface text-gold border-gold/40" : "bg-surface text-text-muted border-border"
            }`}
          >
            EMA 20/50
          </button>

          <button
            onClick={() => setShowRsi(!showRsi)}
            className={`px-2 py-1 rounded text-[11px] border ${
              showRsi ? "bg-surface text-purple-400 border-purple-500/40" : "bg-surface text-text-muted border-border"
            }`}
          >
            RSI(14)
          </button>

          <button
            onClick={() => loadChartData(timeframe)}
            className="p-1.5 rounded bg-surface hover:bg-surface/80 border border-border text-gray-300"
            title="Refresh Chart"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-gold" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Candlestick Canvas */}
      <div className="relative w-full overflow-hidden rounded border border-border/60 bg-[#080b11]">
        <div ref={chartContainerRef} className="w-full h-[440px]" />
      </div>

      {/* RSI Sub-Chart Canvas */}
      {showRsi && (
        <div className="mt-2 relative w-full overflow-hidden rounded border border-border/60 bg-[#0a0e16]">
          <div className="absolute top-1.5 left-2 z-10 text-[10px] text-purple-400 font-bold uppercase">
            Relative Strength Index (14) — Overbought: 70 | Oversold: 30
          </div>
          <div ref={rsiContainerRef} className="w-full h-[120px]" />
        </div>
      )}

      {/* Structural Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-muted pt-2 border-t border-border/40">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-[#38bdf8]"></span>
            <span>EMA 20 (Dynamic Momentum)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-[#f59e0b]"></span>
            <span>EMA 50 (Intraday Baseline)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-[#a855f7]"></span>
            <span>RSI Oscillator</span>
          </span>
        </div>
        <div className="text-[10px] text-gray-400">
          Scroll to zoom • Drag to pan • Hover for precise Open/High/Low/Close
        </div>
      </div>
    </div>
  );
}

// Helper calculation functions for indicators
function calculateSimpleEma(prices: number[], period: number): number[] {
  if (prices.length < period) return prices;
  const k = 2 / (period + 1);
  const result: number[] = [];
  let currentEma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(currentEma);
    } else {
      currentEma = prices[i] * k + currentEma * (1 - k);
      result.push(currentEma);
    }
  }
  return result;
}

function calculateSimpleRsi(prices: number[], period: number = 14): number[] {
  if (prices.length <= period) return new Array(prices.length).fill(50);
  const deltas: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    deltas.push(prices[i] - prices[i - 1]);
  }
  let gains = deltas.map((d) => (d > 0 ? d : 0));
  let losses = deltas.map((d) => (d < 0 ? -d : 0));

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const rsiList: number[] = new Array(period).fill(50);
  for (let i = period; i < deltas.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiList.push(rsi);
  }
  rsiList.push(rsiList[rsiList.length - 1] || 50);
  return rsiList;
}
