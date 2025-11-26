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
import Link from 'next/link';

interface CategoryRanking {
  rank: number;
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
}

export default function TopCategoriesPage() {
  const { summary, isLoading } = useExpenses();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
        </div>

        {/* Card Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate category rankings
  const categoryRankings: CategoryRanking[] = EXPENSE_CATEGORIES.map((category) => {
    const amount = summary.categoryBreakdown[category] || 0;
    const percentage =
      summary.totalSpending > 0
        ? (amount / summary.totalSpending) * 100
        : 0;
    return {
      rank: 0, // Will be set after sorting
      category,
      amount,
      percentage,
      icon: CATEGORY_ICONS[category],
      color: CATEGORY_COLORS[category],
    };
  })
    .sort((a, b) => b.amount - a.amount)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const maxAmount = Math.max(...categoryRankings.map((d) => d.amount), 1);
  const hasData = summary.totalSpending > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Top Expense Categories</h1>
          <p className="text-gray-600 mt-1">
            View your spending ranked by category
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Expense
        </Link>
      </div>

      {/* Summary Stats */}
      {hasData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spending</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(summary.totalSpending)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Categories</p>
                <p className="text-xl font-bold text-gray-900">
                  {categoryRankings.filter(c => c.amount > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Category</p>
                <p className="text-xl font-bold text-gray-900">
                  {categoryRankings[0].amount > 0 ? categoryRankings[0].category : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Category Rankings</h2>

        {!hasData ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your expenses to see category rankings</p>
            <Link
              href="/add"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Add Your First Expense
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {categoryRankings.map(({ rank, category, amount, percentage, icon, color }) => {
              const isTopThree = rank <= 3;
              const hasSomeSpending = amount > 0;

              return (
                <div
                  key={category}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    hasSomeSpending
                      ? 'hover:bg-gray-50 border border-gray-100'
                      : 'opacity-40'
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isTopThree && hasSomeSpending
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {rank}
                  </div>

                  {/* Category Icon */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    {icon}
                  </div>

                  {/* Category Info & Progress Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-gray-900">
                          {category}
                        </span>
                        {isTopThree && hasSomeSpending && (
                          <span className="text-xs font-medium px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                            Top {rank}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-base font-bold text-gray-900">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${(amount / maxAmount) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insights Section */}
      {hasData && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Spending Insights</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {categoryRankings[0].amount > 0 && (
                  <p>
                    Your highest spending category is <span className="font-semibold">{categoryRankings[0].category}</span> at {formatCurrency(categoryRankings[0].amount)} ({categoryRankings[0].percentage.toFixed(1)}% of total).
                  </p>
                )}
                {categoryRankings.filter(c => c.amount > 0).length > 1 && (
                  <p>
                    You are actively spending across {categoryRankings.filter(c => c.amount > 0).length} categories.
                  </p>
                )}
                {categoryRankings[0].percentage > 50 && (
                  <p className="text-orange-700 font-medium">
                    Consider diversifying your expenses - {categoryRankings[0].category} accounts for over 50% of your spending.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
