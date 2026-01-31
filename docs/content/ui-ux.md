---
title: UI/UX & Design System
description: Guidelines for the Stoic Dark aesthetic and frontend architecture.
---

# UI/UX Design System

The Stoicpips frontend is designed to evoke a sense of calm, precision, and professionalism. We call this aesthetic "Stoic Dark".

## Color Palette

The palette is built on a foundation of Slate and Zinc, avoiding harsh blacks or oversaturated colors.

- **Background**: `bg-slate-950` (Deep, rich dark blue-grey)
- **Surface**: `bg-slate-900` / `bg-slate-800` (Cards, Panels)
- **Primary Accent**: `text-cyan-500` or `text-emerald-500` (for success/profit)
- **Secondary Accent**: `text-slate-400` (Muted text for secondary info)

## Typography

We use a modern sans-serif stack that prioritizes readability and structure.
- **Headings**: `font-black tracking-tight` (Bold, authoritative)
- **Body**: `font-normal text-slate-300` (High contrast but easy on eyes)

## Component Architecture

The application is built using React Server Components (RSC) where possible, with Client Components used for interactive elements.

### Key Components
- **`StatsCard`**: Reusable card for displaying metrics (Profit, Win Rate). Uses glassmorphism effects (`backdrop-blur`).
- **`Sidebar`**: Collapsible navigation with active state highlighting.
- **`Layout`**: Persistent layouts for Dashboard and Documentation sections.

## Technology Stack
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion (for subtle transitions)
