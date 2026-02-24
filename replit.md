# SpendWise - Expense Tracker App

## Overview
A mobile expense tracker application built with Expo React Native. Features local storage persistence, dark/light theme, animated UI, and comprehensive financial tracking.

## Architecture
- **Frontend**: Expo Router with file-based routing, React Native
- **State Management**: React Context (ThemeContext, ExpenseContext, ProfileContext)
- **Storage**: AsyncStorage for all local persistence
- **Styling**: Custom theme system with light/dark modes
- **Fonts**: Inter (Google Fonts)

## Project Structure
```
app/
  _layout.tsx         - Root layout with providers, auth routing, splash screen
  login.tsx           - Name-based local authentication
  +not-found.tsx      - 404 screen
  (tabs)/
    _layout.tsx       - Tab navigation with liquid glass support
    index.tsx         - Home screen (balance card, transactions)
    analytics.tsx     - Charts (pie, bar) for spending analysis
    add.tsx           - Add income/expense form
    profile.tsx       - Profile settings, theme, font size

components/
  BalanceCard.tsx     - Gradient balance summary card
  TransactionItem.tsx - Individual transaction row with delete
  EmptyState.tsx      - Reusable empty state component
  PieChart.tsx        - Category distribution donut chart
  BarChart.tsx        - Animated bar chart
  ErrorBoundary.tsx   - Error boundary wrapper
  ErrorFallback.tsx   - Error fallback UI

contexts/
  ThemeContext.tsx     - Dark/light mode, font size management
  ExpenseContext.tsx   - Expense CRUD operations
  ProfileContext.tsx   - Profile and auth management

lib/
  types.ts            - TypeScript types, categories, colors
  storage.ts          - AsyncStorage helpers
  query-client.ts     - React Query client

constants/
  colors.ts           - Theme color definitions
```

## Key Features
- Animated splash screen
- Local name-based authentication
- Balance card with income/expense summary
- Transaction list with long-press delete
- Add expense/income with category selection and date picker
- Analytics with pie chart and bar charts
- Dark/light mode toggle
- Font size adjustment
- Reset all data option

## Recent Changes
- Feb 2026: Initial build with full feature set
