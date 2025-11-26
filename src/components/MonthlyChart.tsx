'use client';

import React, { useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency } from '@/lib/utils';

export default function MonthlyChart() {
  const { expenses, isLoading } = useExpenses();

  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {};

    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      data[key] = 0;
    }

    // Sum expenses by month
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (key in data) {
        data[key] += expense.amount;
      }
    });

    return Object.entries(data).map(([key, amount]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        key,
        month: date.toLocaleString('default', { month: 'short' }),
        amount,
      };
    });
  }, [expenses]);

  const skeletonHeights = [65, 45, 80, 55, 70, 40];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="h-48 flex items-end justify-between gap-4">
          {skeletonHeights.map((height, i) => (
            <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...monthlyData.map((d) => d.amount), 1);
  const totalLastSixMonths = monthlyData.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Monthly Spending</h2>
        <span className="text-sm text-gray-500">Last 6 months</span>
      </div>

      {totalLastSixMonths > 0 ? (
        <>
          {/* Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 mb-4">
            {monthlyData.map(({ key, month, amount }) => (
              <div key={key} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-700 h-5 flex items-end">
                  {amount > 0 ? formatCurrency(amount) : ''}
                </span>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-500 ease-out hover:bg-blue-600"
                  style={{
                    height: amount > 0 ? `${Math.max((amount / maxAmount) * 100, 4)}%` : '4px',
                    backgroundColor: amount === 0 ? '#E5E7EB' : undefined,
                  }}
                />
                <span className="text-xs text-gray-600 font-medium">{month}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">6-month total</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(totalLastSixMonths)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Monthly average</span>
              <span className="font-medium text-gray-700">
                {formatCurrency(totalLastSixMonths / 6)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No spending data in the last 6 months</p>
        </div>
      )}
    </div>
  );
}
