import SummaryCards from '@/components/SummaryCards';
import CategoryChart from '@/components/CategoryChart';
import MonthlyChart from '@/components/MonthlyChart';
import RecentExpenses from '@/components/RecentExpenses';
import CloudExportHub from '@/components/CloudExportHub';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and manage your expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <CloudExportHub />
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
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CategoryChart />
        <MonthlyChart />
      </div>

      {/* Recent Expenses */}
      <RecentExpenses />
    </div>
  );
}
