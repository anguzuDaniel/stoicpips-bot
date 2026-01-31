---
title: Stoic Strategy
description: Mathematical and philosophical logic behind the bot's execution.
---

# Stoic Trading Strategy

The "Stoic" strategy is grounded in the philosophy of emotionless execution. It relies purely on mathematical supply and demand zones, removing human bias from the equation.

## Core Concepts

### Supply & Demand Zones
The bot identifies zones where price has historically reacted strongly.
- **Supply Zone**: Area where selling pressure exceeded buying pressure (Price Drop).
- **Demand Zone**: Area where buying pressure exceeded selling pressure (Price Rally).

### Zone Detection Algorithm `ZoneDetector.ts`
1. **Pivot Identification**: Locates high and low pivots in the price action.
2. **Impulse Validation**: Checks if the move away from the pivot was strong/impulsive (high velocity).
3. **Freshness**: Prioritizes "fresh" zones that have not been re-tested yet.

### Signal Generation
Signals are generated when:
1. Price enters a valid Supply or Demand zone.
2. A reversal pattern (e.g., Engulfing Candle, Pinbar) is detected within the zone.
3. Market structure aligns with the trade direction.

## Risk Management

"Stoic" implies discipline. The bot enforces strict risk rules:
- **Max Drawdown**: Hard stop if daily loss exceeds configured percentage (e.g., 5%).
- **Risk Per Trade**: Fixed percentage of account balance (e.g., 1% or 2%).
- **Stop Loss**: Placed just beyond the distal line of the Zone.
- **Take Profit**: Targeted at the opposing Zone or fixed Risk-Reward ratio (e.g., 1:2).
