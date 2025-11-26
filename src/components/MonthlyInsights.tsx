'use client';

import React, { useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORY_COLORS, CATEGORY_ICONS, ExpenseCategory } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';

export default function MonthlyInsights() {
  const { expenses, isLoading, summary } = useExpenses();

  // Get current month's expenses
  const monthlyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    // Calculate category totals for this month
    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Sort by amount and get top 3
    const sorted = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    return { categoryTotals, topCategories: sorted, total, monthExpenses };
  }, [expenses]);

  // Calculate budget streak (days under a daily budget threshold)
  const budgetStreak = useMemo(() => {
    const dailyBudget = 100; // Example daily budget
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayExpenses = expenses.filter((e) => e.date === dateStr);
      const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      if (dayTotal <= dailyBudget) {
        streak++;
      } else {
        break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }, [expenses]);

  // Generate donut chart segments
  const donutSegments = useMemo(() => {
    const entries = Object.entries(monthlyData.categoryTotals);
    if (entries.length === 0 || monthlyData.total === 0) return [];

    let currentAngle = 0;
    return entries.map(([category, amount]) => {
      const percentage = amount / monthlyData.total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      return {
        category: category as ExpenseCategory,
        amount,
        percentage,
        startAngle,
        endAngle: currentAngle,
        color: CATEGORY_COLORS[category as ExpenseCategory],
      };
    });
  }, [monthlyData]);

  // SVG donut chart helpers
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(' ');
  };

  if (isLoading) {
    return (
      <div className="bg-amber-50 rounded-2xl border-2 border-dashed border-amber-200 p-6 animate-pulse">
        <div className="h-8 bg-amber-100 rounded w-48 mx-auto mb-6"></div>
        <div className="w-48 h-48 bg-amber-100 rounded-full mx-auto mb-6"></div>
        <div className="space-y-3">
          <div className="h-6 bg-amber-100 rounded w-32"></div>
          <div className="h-6 bg-amber-100 rounded w-28"></div>
          <div className="h-6 bg-amber-100 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const categoryBarColors: Record<number, string> = {
    0: 'bg-red-400',
    1: 'bg-teal-400',
    2: 'bg-blue-400',
  };

  return (
    <div className="bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-200 p-6 shadow-sm">
      {/* Header with decorative border */}
      <div className="text-center mb-6">
        <h2
          className="text-2xl font-bold text-gray-800 mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Monthly Insights
        </h2>
        <div className="flex justify-center">
          <svg width="200" height="12" viewBox="0 0 200 12">
            <path
              d="M0 6 Q 10 0, 20 6 T 40 6 T 60 6 T 80 6 T 100 6 T 120 6 T 140 6 T 160 6 T 180 6 T 200 6"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
          </svg>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="24"
            />

            {/* Donut segments */}
            {donutSegments.map((segment, index) => (
              <path
                key={segment.category}
                d={describeArc(90, 90, 70, segment.startAngle, segment.endAngle - 0.5)}
                fill="none"
                stroke={segment.color}
                strokeWidth="24"
                strokeLinecap="round"
                className="transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                }}
              />
            ))}

            {/* Outer decorative ring */}
            <circle
              cx="90"
              cy="90"
              r="82"
              fill="none"
              stroke="#1f2937"
              strokeWidth="3"
            />
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-amber-50 px-3 py-1 rounded shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Spending</span>
            </div>
          </div>

          {/* Annotation arrow */}
          <div
            className="absolute text-gray-500 italic text-sm"
            style={{ right: '-60px', top: '50%' }}
          >
            <span>Donut chart!</span>
          </div>
        </div>
      </div>

      {/* Top 3 Categories */}
      <div className="space-y-3 mb-8">
        {monthlyData.topCategories.length > 0 ? (
          monthlyData.topCategories.map(([category, amount], index) => (
            <div key={category} className="flex items-center gap-3">
              <div
                className={`w-1.5 h-10 rounded-full ${categoryBarColors[index]}`}
              />
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {CATEGORY_ICONS[category as ExpenseCategory]}
                </span>
                <span className="font-medium text-gray-800">
                  {category}: {formatCurrency(amount)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No expenses this month
          </div>
        )}

        {monthlyData.topCategories.length > 0 && (
          <div className="flex justify-end">
            <span className="text-sm italic text-gray-500">Top 3!</span>
          </div>
        )}
      </div>

      {/* Budget Streak */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              Budget Streak
            </h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-emerald-500">
                {budgetStreak}
              </span>
              <span className="text-lg text-gray-600">days!</span>
            </div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"
              style={{
                width: `${Math.min((budgetStreak / 30) * 100, 100)}%`,
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-amber-200 rounded-full opacity-50" />
      <div className="absolute bottom-20 right-8 w-2 h-2 bg-gray-300 rounded-full opacity-50" />
    </div>
  );
}
