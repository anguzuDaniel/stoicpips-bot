---
title: System Architecture
description: Overview of the Dunam Bot and Stoicpips microservices architecture.
---

# System Architecture

The Stoicpips system is built on a modern microservices architecture designed for reliability, speed, and separation of concerns.

## High-Level Overview

```mermaid
graph TD
    Client[Client Browser] -->|HTTPS| Frontend[Next.js Frontend]
    Frontend -->|REST API| Backend[Express Backend]
    Backend -->|gRPC/HTTP| AI[AI Engine (Python)]
    Backend -->|WebSockets| Deriv[Deriv API]
    Backend -->|SQL| DB[(Supabase PostgreSQL)]
    AI -->|Data Fetch| Deriv
```

## Components

### 1. Frontend (Next.js)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with "Stoic Dark" theme.
- **Responsibility**: User interface for dashboard, settings, and monitoring active trades.

### 2. Backend (Express.js)
- **Runtime**: Node.js
- **Responsibility**: 
  - User Authentication (JWT)
  - Trade Management
  - WebSocket connection to Deriv for real-time price updates.
  - CRUD operations for User/Bot configurations.
  - Coordination between the User and the AI Engine.

### 3. AI Engine (FastAPI)
- **Runtime**: Python 3.10+
- **Responsibility**:
  - Market Analysis using `pandas` and technical indicators.
  - Signal Generation (Buy/Sell).
  - Machine Learning inference (if enabled).
- **Communication**: Exposes a REST interface (`/predict`) for the backend to query trade signals.

### 4. Database (Supabase)
- **Type**: PostgreSQL
- **Responsibility**: Persisting user data, trade history, and configuration.
