# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 expense tracking application using the App Router with React 19 and Tailwind CSS v4.

### State Management

All expense data flows through `ExpenseContext` (`src/context/ExpenseContext.tsx`):
- Provides `useExpenses()` hook for accessing expenses, filters, and CRUD operations
- Persists data to localStorage under key `expense-tracker-data`
- Handles filtering logic (search, category, date range) via memoized `filteredExpenses`

### Data Types

Core types defined in `src/types/expense.ts`:
- `Expense`: id, amount, category, description, date, timestamps
- `ExpenseCategory`: Food | Transportation | Entertainment | Shopping | Bills | Other
- `ExpenseFilters`: search, category, startDate, endDate

### Route Structure

- `/` - Dashboard with summary cards and charts
- `/expenses` - Full expense list with filters
- `/expenses/[id]/edit` - Edit individual expense
- `/add` - Add new expense form

### Component Patterns

- All components using context must be client components (`'use client'`)
- `ExpenseProvider` wraps the app in `layout.tsx`
- Charts use custom SVG implementations (no charting library)
