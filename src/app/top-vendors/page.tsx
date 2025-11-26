'use client';

import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_COLORS, CATEGORY_ICONS, ExpenseCategory } from '@/types/expense';
import { useMemo } from 'react';

interface VendorData {
  name: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
}

export default function TopVendorsPage() {
  const { expenses } = useExpenses();

  // Aggregate expenses by vendor (description field)
  const vendorData = useMemo(() => {
    const vendorMap = new Map<string, VendorData>();

    expenses.forEach((expense) => {
      const vendorName = expense.description.trim();
      if (!vendorName) return;

      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, {
          name: vendorName,
          totalAmount: 0,
          transactionCount: 0,
          averageAmount: 0,
          categoryBreakdown: {} as Record<ExpenseCategory, number>,
        });
      }

      const vendor = vendorMap.get(vendorName)!;
      vendor.totalAmount += expense.amount;
      vendor.transactionCount += 1;
      vendor.categoryBreakdown[expense.category] =
        (vendor.categoryBreakdown[expense.category] || 0) + expense.amount;
    });

    // Calculate averages and sort by total amount
    const vendors = Array.from(vendorMap.values())
      .map((vendor) => ({
        ...vendor,
        averageAmount: vendor.totalAmount / vendor.transactionCount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return vendors;
  }, [expenses]);

  // Calculate max amount for progress bar scaling
  const maxAmount = vendorData.length > 0 ? vendorData[0].totalAmount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Top Vendors</h1>
        <p className="text-gray-600 mt-1">
          Your spending breakdown by vendor or merchant
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Total Vendors</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {vendorData.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Top Vendor Spending</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {vendorData.length > 0 ? formatCurrency(vendorData[0].totalAmount) : '$0.00'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Average per Vendor</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {vendorData.length > 0
              ? formatCurrency(
                  vendorData.reduce((sum, v) => sum + v.totalAmount, 0) / vendorData.length
                )
              : '$0.00'}
          </p>
        </div>
      </div>

      {/* Vendors List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ranked Vendor List
          </h2>
        </div>

        {vendorData.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-600">No vendor data available</p>
            <p className="text-sm text-gray-500 mt-1">
              Add some expenses to see your top vendors
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {vendorData.map((vendor, index) => {
              const progressPercentage = (vendor.totalAmount / maxAmount) * 100;
              const categories = Object.entries(vendor.categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category]) => category as ExpenseCategory);

              return (
                <div key={vendor.name} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`
                        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                        ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                            ? 'bg-gray-100 text-gray-700'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-50 text-blue-600'
                        }
                      `}
                    >
                      {index + 1}
                    </div>

                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0">
                      {/* Vendor Name and Total */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {vendor.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {vendor.transactionCount} transaction{vendor.transactionCount !== 1 ? 's' : ''} • Avg: {formatCurrency(vendor.averageAmount)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(vendor.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>

                      {/* Category Breakdown */}
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                          const amount = vendor.categoryBreakdown[category];
                          const percentage = (amount / vendor.totalAmount) * 100;
                          return (
                            <div
                              key={category}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[category]}15`,
                                color: CATEGORY_COLORS[category],
                              }}
                            >
                              <span>{CATEGORY_ICONS[category]}</span>
                              <span>{category}</span>
                              <span className="text-xs opacity-75">
                                {formatCurrency(amount)} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
