---
title: API Reference
description: Consolidated API documentation for Stoicpips Backend and AI Engine.
---

# API Reference

This document outlines the key API endpoints for the Stoicpips ecosystem.

## Backend Service `stoicpips-api`

### Authentication
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate and receive a JWT.

### Bot Management
- `POST /api/bot/start`: Start the trading bot for a specific user.
- `POST /api/bot/stop`: Stop the trading bot.
- `GET /api/bot/status`: Get current running status and active trades.

### User
- `GET /api/user/profile`: Fetch user profile and subscription tier.
- `PUT /api/user/settings`: Update trading preferences (e.g., risk limits).

---

## AI Engine Service

The AI engine runs on a separate port (typically 8005) and handles signal generation.

### Prediction Endpoint
**POST** `/predict`

Generates a trade signal based on the latest market data for a given symbol.

**Request Body**
```json
{
  "symbol": "R_100",
  "timeframe": "1m",
  "strategy_mode": "scalping"
}
```

**Response**
```json
{
  "symbol": "R_100",
  "action": "BUY",
  "confidence": 85.5,
  "analysis": {
    "trend": "bullish",
    "rsi": 45,
    "support_level": 1205.50
  },
  "timestamp": "2024-01-30T10:00:00Z"
}
```
