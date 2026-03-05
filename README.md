# Gold Investment Tracker (Vietnam)

A single-page React app for tracking gold investment profits in Vietnam. Luxury dark theme with live gold prices, portfolio summary, and transaction history.

## Tech

- React 18 (hooks: useState, useEffect, useReducer)
- Vite
- Tailwind CSS
- Data: localStorage (`gold_transactions`)

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Features

- **Dashboard**: Live XAU price ticker (api.gold-api.com), VNĐ per chỉ by type (SJC, 999, Nhẫn 18K/14K, etc.), portfolio totals and per-type P&L table.
- **Add Transaction**: Form with validation; saves to localStorage.
- **Transaction History**: Table with filters (gold type, buy/sell, date range), sort by date, delete with confirmation.
- Seed demo transactions on first load.
- Responsive layout with sidebar navigation.
