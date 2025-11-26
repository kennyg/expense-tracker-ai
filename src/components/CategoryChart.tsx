'use client';

import React from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import {
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  ExpenseCategory,
} from '@/types/expense';
import { formatCurrency } from '@/lib/utils';

export default function CategoryChart() {
  const { summary, isLoading } = useExpenses();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const categoryData = EXPENSE_CATEGORIES.map((category) => ({
    category,
    amount: summary.categoryBreakdown[category] || 0,
    percentage:
      summary.totalSpending > 0
        ? ((summary.categoryBreakdown[category] || 0) / summary.totalSpending) * 100
        : 0,
  })).sort((a, b) => b.amount - a.amount);

  const maxAmount = Math.max(...categoryData.map((d) => d.amount), 1);

  if (summary.totalSpending === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-gray-500">No spending data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h2>

      <div className="space-y-4">
        {categoryData.map(({ category, amount, percentage }) => (
          <div key={category} className="group">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: `${CATEGORY_COLORS[category]}15` }}
              >
                {CATEGORY_ICONS[category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(amount / maxAmount) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[category],
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
