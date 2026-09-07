from typing import List, Dict, Any, Tuple
import math

class TechnicalEngine:
    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> List[float]:
        if not prices or len(prices) < period:
            return []
        k = 2.0 / (period + 1.0)
        ema_values = []
        # Initial SMA
        initial_sma = sum(prices[:period]) / period
        ema_values.append(initial_sma)
        for p in prices[period:]:
            new_ema = p * k + ema_values[-1] * (1.0 - k)
            ema_values.append(round(new_ema, 3))
        # Pad front with None or fill
        padding = [None] * (period - 1)
        return padding + ema_values

    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> List[float]:
        if len(prices) <= period:
            return [50.0] * len(prices)
        
        deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
        gains = [max(d, 0.0) for d in deltas]
        losses = [max(-d, 0.0) for d in deltas]
        
        rsi_list = [50.0] * (period)
        avg_gain = sum(gains[:period]) / period
        avg_loss = sum(losses[:period]) / period
        
        if avg_loss == 0:
            rsi_list.append(100.0)
        else:
            rs = avg_gain / avg_loss
            rsi_list.append(round(100.0 - (100.0 / (1.0 + rs)), 2))
            
        for i in range(period, len(deltas)):
            avg_gain = (avg_gain * (period - 1) + gains[i]) / period
            avg_loss = (avg_loss * (period - 1) + losses[i]) / period
            if avg_loss == 0:
                rsi_list.append(100.0)
            else:
                rs = avg_gain / avg_loss
                rsi_list.append(round(100.0 - (100.0 / (1.0 + rs)), 2))
                
        return rsi_list

    @staticmethod
    def calculate_atr(candles: List[Dict[str, float]], period: int = 14) -> List[float]:
        if len(candles) < 2:
            return [1.0] * len(candles)
        
        tr_list = []
        for i in range(len(candles)):
            if i == 0:
                tr_list.append(candles[i]['high'] - candles[i]['low'])
            else:
                h = candles[i]['high']
                l = candles[i]['low']
                prev_c = candles[i-1]['close']
                tr = max(h - l, abs(h - prev_c), abs(l - prev_c))
                tr_list.append(tr)
                
        atr_list = []
        for i in range(len(tr_list)):
            if i < period - 1:
                atr_list.append(round(sum(tr_list[:i+1]) / (i+1), 2))
            else:
                window_atr = sum(tr_list[i-period+1:i+1]) / period
                atr_list.append(round(window_atr, 2))
        return atr_list

    @staticmethod
    def calculate_macd(prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, Any]:
        if len(prices) < slow:
            return {"macd": 0.0, "signal": 0.0, "hist": 0.0}
        
        ema_fast = TechnicalEngine.calculate_ema(prices, fast)
        ema_slow = TechnicalEngine.calculate_ema(prices, slow)
        
        macd_line = []
        for f, s in zip(ema_fast, ema_slow):
            if f is not None and s is not None:
                macd_line.append(f - s)
            else:
                macd_line.append(0.0)
                
        sig_line = TechnicalEngine.calculate_ema([m for m in macd_line if m != 0.0] or [0.0], signal)
        latest_macd = macd_line[-1] if macd_line else 0.0
        latest_sig = sig_line[-1] if sig_line else 0.0
        latest_hist = latest_macd - (latest_sig if latest_sig is not None else 0.0)
        
        return {
            "macd": round(latest_macd, 3),
            "signal": round(latest_sig if latest_sig is not None else 0.0, 3),
            "hist": round(latest_hist, 3)
        }

    @staticmethod
    def detect_swings_and_structure(candles: List[Dict[str, float]], window: int = 3) -> Dict[str, Any]:
        """Detect swing highs, swing lows, and market structure (BoS / ChoCh)."""
        if len(candles) < window * 2 + 1:
            return {
                "swing_highs": [],
                "swing_lows": [],
                "structure": "CONSOLIDATION",
                "trend": "NEUTRAL",
                "last_bos": None,
                "confidence": 60
            }
        
        highs = []
        lows = []
        
        for i in range(window, len(candles) - window):
            curr_h = candles[i]['high']
            curr_l = candles[i]['low']
            
            # Is swing high
            if all(curr_h >= candles[i - j]['high'] for j in range(1, window + 1)) and \
               all(curr_h > candles[i + j]['high'] for j in range(1, window + 1)):
                highs.append({"index": i, "price": curr_h, "time": candles[i].get('time')})
                
            # Is swing low
            if all(curr_l <= candles[i - j]['low'] for j in range(1, window + 1)) and \
               all(curr_l < candles[i + j]['low'] for j in range(1, window + 1)):
                lows.append({"index": i, "price": curr_l, "time": candles[i].get('time')})
                
        # Determine Market Structure
        structure = "RANGE"
        trend = "NEUTRAL"
        last_bos = None
        confidence = 70
        
        if len(highs) >= 2 and len(lows) >= 2:
            prev_h, curr_h = highs[-2]['price'], highs[-1]['price']
            prev_l, curr_l = lows[-2]['price'], lows[-1]['price']
            
            if curr_h > prev_h and curr_l > prev_l:
                structure = "HIGHER_HIGHS_HIGHER_LOWS"
                trend = "BULLISH"
                last_bos = {"type": "BULLISH_BOS", "level": prev_h}
                confidence = 85
            elif curr_h < prev_h and curr_l < prev_l:
                structure = "LOWER_HIGHS_LOWER_LOWS"
                trend = "BEARISH"
                last_bos = {"type": "BEARISH_BOS", "level": prev_l}
                confidence = 85
            elif curr_h > prev_h and curr_l < prev_l:
                structure = "EXPANDING_RANGE"
                trend = "VOLATILE"
                confidence = 55
            elif curr_h < prev_h and curr_l > prev_l:
                structure = "COMPRESSION_TRIANGLE"
                trend = "RANGE"
                confidence = 65
                
        return {
            "swing_highs": highs[-5:],
            "swing_lows": lows[-5:],
            "structure": structure,
            "trend": trend,
            "last_bos": last_bos,
            "confidence": confidence
        }
