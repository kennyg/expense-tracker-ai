# AGENTS.md

This file provides guidance to AI assistants when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type check without emitting
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
- `/insights` - Monthly insights with donut chart and budget streak
- `/top-categories` - Category spending analytics
- `/top-vendors` - Vendor spending analytics

### Component Patterns

- All components using context must be client components (`'use client'`)
- `ExpenseProvider` wraps the app in `layout.tsx`
- Charts use custom SVG implementations (no charting library)

---

## Style Guide

### Tailwind Patterns

```tsx
// Cards
className="bg-white rounded-xl border border-gray-200 p-6"

// Primary buttons
className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"

// Secondary buttons
className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"

// Page headers
className="text-2xl font-bold text-gray-900"

// Muted text
className="text-sm text-gray-500"
```

### Color System

Use the category colors from `src/types/expense.ts`:
```tsx
Food: '#10B981'        // Emerald
Transportation: '#3B82F6'  // Blue
Entertainment: '#8B5CF6'   // Purple
Shopping: '#F59E0B'        // Amber
Bills: '#EF4444'           // Red
Other: '#6B7280'           // Gray
```

### Component Structure

```tsx
'use client';

import React from 'react';
import { useExpenses } from '@/context/ExpenseContext';

export default function MyComponent() {
  const { expenses, isLoading } = useExpenses();

  if (isLoading) {
    return <div className="animate-pulse">...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Component content */}
    </div>
  );
}
```

### Naming Conventions

- Components: PascalCase (`MonthlyInsights.tsx`)
- Utilities: camelCase (`formatCurrency`)
- Pages: `page.tsx` in route folder
- Types: PascalCase with descriptive names (`ExpenseFormData`)

---

## Testing

No test framework is currently configured. To verify changes:

1. **Type check**: `npx tsc --noEmit`
2. **Lint**: `npm run lint`
3. **Visual verification**: `npm run dev` and check affected pages
4. **Build check**: `npm run build` (catches SSR issues)

### Manual Test Checklist

When modifying expense functionality:
- [ ] Add an expense → appears in list and dashboard
- [ ] Edit an expense → changes persist after refresh
- [ ] Delete an expense → removed from all views
- [ ] Filter expenses → correct results shown
- [ ] Check mobile view → responsive layout works

---

## Custom Slash Commands

Available in `.claude/commands/`:

### Development Setup

| Command | Description |
|---------|-------------|
| `/setup-dev` | Set up dev environment using mise (Node.js, dependencies, verification) |
| `/setup-community-health` | Create GitHub community health files (issues, PRs, contributing) |

### Feature Development

| Command | Description |
|---------|-------------|
| `/brainstorm` | Generate feature ideas with scope estimates and implementation plans |
| `/design-review` | Analyze UI screenshots, diagram architecture, implement refinements |
| `/document-feature` | Generate technical and user documentation for a feature |

### Parallel Development

| Command | Description |
|---------|-------------|
| `/parallel-work` | Set up Git worktrees for developing features in parallel |
| `/integrate-parallel-work` | Merge parallel worktree features into integration branch |

### Usage Examples

```bash
# New developer setup
/setup-dev

# Brainstorm new features
/brainstorm analytics features

# Review a screenshot and make changes
/design-review /path/to/screenshot.png

# Document an existing feature
/document-feature expense filtering

# Set up parallel feature development
/parallel-work dark-mode, receipt-scanning

# Integrate completed parallel features
/integrate-parallel-work dark-mode, receipt-scanning
```

---

## Documentation Pointers

### Project Docs

- `docs/dev/` - Developer documentation
- `docs/user/` - User-facing documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Community standards

### External References

- [Next.js App Router](https://nextjs.org/docs/app)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

### Key Files to Understand

| File | Purpose |
|------|---------|
| `src/context/ExpenseContext.tsx` | All state management and CRUD |
| `src/types/expense.ts` | Type definitions and constants |
| `src/lib/utils.ts` | Formatting and helper functions |
| `src/components/Navigation.tsx` | App navigation (update when adding routes) |
