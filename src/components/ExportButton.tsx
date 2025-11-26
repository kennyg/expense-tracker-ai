'use client';

import { useExpenses } from '@/context/ExpenseContext';

export default function ExportButton() {
  const { expenses } = useExpenses();

  const handleExport = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    // Create CSV header
    const header = 'Date,Category,Amount,Description';

    // Create CSV rows
    const rows = expenses.map((expense) => {
      const date = new Date(expense.date).toLocaleDateString();
      const category = expense.category;
      const amount = expense.amount.toFixed(2);
      // Escape description for CSV (wrap in quotes if contains comma or quotes)
      const description = expense.description.includes(',') || expense.description.includes('"')
        ? `"${expense.description.replace(/"/g, '""')}"`
        : expense.description;

      return `${date},${category},${amount},${description}`;
    });

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export Data
    </button>
  );
}
