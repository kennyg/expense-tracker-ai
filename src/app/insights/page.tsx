import MonthlyInsights from '@/components/MonthlyInsights';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
      </div>

      <div className="max-w-md mx-auto">
        <MonthlyInsights />
      </div>
    </div>
  );
}
