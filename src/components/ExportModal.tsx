'use client';

import { useState, useMemo, useCallback } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportFilters {
  startDate: string;
  endDate: string;
  categories: ExpenseCategory[];
}

export default function ExportModal() {
  const { expenses } = useExpenses();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState('expenses');
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    startDate: '',
    endDate: '',
    categories: [...EXPENSE_CATEGORIES],
  });

  // Filter expenses based on selected criteria
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      if (!filters.categories.includes(expense.category)) {
        return false;
      }

      // Date range filter
      if (filters.startDate) {
        const expenseDate = new Date(expense.date);
        const startDate = new Date(filters.startDate);
        if (expenseDate < startDate) return false;
      }

      if (filters.endDate) {
        const expenseDate = new Date(expense.date);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (expenseDate > endDate) return false;
      }

      return true;
    });
  }, [expenses, filters]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      count: filteredExpenses.length,
      total,
    };
  }, [filteredExpenses]);

  // Toggle category selection
  const toggleCategory = (category: ExpenseCategory) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  // Select/deselect all categories
  const toggleAllCategories = () => {
    setFilters((prev) => ({
      ...prev,
      categories:
        prev.categories.length === EXPENSE_CATEGORIES.length
          ? []
          : [...EXPENSE_CATEGORIES],
    }));
  };

  // Generate CSV content
  const generateCSV = useCallback((data: Expense[]): string => {
    const header = 'Date,Category,Amount,Description';
    const rows = data.map((expense) => {
      const date = new Date(expense.date).toLocaleDateString();
      const amount = expense.amount.toFixed(2);
      const description =
        expense.description.includes(',') || expense.description.includes('"')
          ? `"${expense.description.replace(/"/g, '""')}"`
          : expense.description;
      return `${date},${expense.category},${amount},${description}`;
    });
    return [header, ...rows].join('\n');
  }, []);

  // Generate JSON content
  const generateJSON = useCallback((data: Expense[]): string => {
    const exportData = data.map((expense) => ({
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
    }));
    return JSON.stringify(exportData, null, 2);
  }, []);

  // Generate PDF content (HTML-based for simplicity)
  const generatePDF = useCallback((data: Expense[]): void => {
    const total = data.reduce((sum, e) => sum + e.amount, 0);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            .meta { color: #6b7280; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f3f4f6; text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            tr:hover { background: #f9fafb; }
            .amount { text-align: right; font-family: monospace; }
            .total-row { font-weight: bold; background: #f3f4f6; }
            .category { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .footer { margin-top: 30px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <div class="meta">
            Generated on ${new Date().toLocaleDateString()} • ${data.length} expenses • Total: $${total.toFixed(2)}
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (expense) => `
                <tr>
                  <td>${new Date(expense.date).toLocaleDateString()}</td>
                  <td><span class="category">${expense.category}</span></td>
                  <td>${expense.description}</td>
                  <td class="amount">$${expense.amount.toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td class="amount">$${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Expense Tracker • Generated automatically
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }, []);

  // Handle export
  const handleExport = async () => {
    if (filteredExpenses.length === 0) {
      alert('No expenses to export with current filters');
      return;
    }

    setIsExporting(true);

    // Simulate processing time for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      if (format === 'pdf') {
        generatePDF(filteredExpenses);
      } else {
        const content =
          format === 'csv'
            ? generateCSV(filteredExpenses)
            : generateJSON(filteredExpenses);

        const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categories: [...EXPENSE_CATEGORIES],
    });
    setFilename('expenses');
    setFormat('csv');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export Data
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Export Expenses
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Configure your export settings and preview the data
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column - Settings */}
                  <div className="lg:col-span-1 space-y-5">
                    {/* Export Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Export Format
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['csv', 'json', 'pdf'] as ExportFormat[]).map((f) => (
                          <button
                            key={f}
                            onClick={() => setFormat(f)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                              format === f
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            {f.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filename */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filename
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={filename}
                          onChange={(e) => setFilename(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          placeholder="expenses"
                        />
                        <span className="text-sm text-gray-500">.{format}</span>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        />
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Categories
                        </label>
                        <button
                          onClick={toggleAllCategories}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          {filters.categories.length === EXPENSE_CATEGORIES.length
                            ? 'Deselect All'
                            : 'Select All'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {EXPENSE_CATEGORIES.map((category) => (
                          <label
                            key={category}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Reset Button */}
                    <button
                      onClick={resetFilters}
                      className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>

                  {/* Right Column - Preview */}
                  <div className="lg:col-span-2">
                    {/* Summary */}
                    <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">
                          Export Summary
                        </p>
                        <p className="text-2xl font-bold text-emerald-900">
                          {summary.count} expenses
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-emerald-700 font-medium">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-emerald-900">
                          ${summary.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Preview (first 10 records)
                      </h3>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                  Date
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                  Category
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600">
                                  Amount
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {filteredExpenses.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="px-4 py-8 text-center text-gray-500"
                                  >
                                    No expenses match the current filters
                                  </td>
                                </tr>
                              ) : (
                                filteredExpenses.slice(0, 10).map((expense) => (
                                  <tr
                                    key={expense.id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-3 text-gray-900">
                                      {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                        {expense.category}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-gray-900">
                                      ${expense.amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                                      {expense.description}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        {filteredExpenses.length > 10 && (
                          <div className="px-4 py-2 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-200">
                            ... and {filteredExpenses.length - 10} more expenses
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || filteredExpenses.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isExporting ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export {format.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
