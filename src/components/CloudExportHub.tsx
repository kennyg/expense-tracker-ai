'use client';

import { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Expense, EXPENSE_CATEGORIES } from '@/types/expense';

type Tab = 'quick' | 'integrations' | 'schedule' | 'history' | 'share';

interface CloudService {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  color: string;
  lastSync?: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: string[];
}

interface ExportHistoryItem {
  id: string;
  type: string;
  destination: string;
  timestamp: Date;
  recordCount: number;
  status: 'completed' | 'pending' | 'failed';
  size: string;
}

interface ScheduledExport {
  id: string;
  template: string;
  destination: string;
  frequency: string;
  nextRun: Date;
  enabled: boolean;
}

export default function CloudExportHub() {
  const { expenses } = useExpenses();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('quick');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Simulated cloud services
  const [cloudServices, setCloudServices] = useState<CloudService[]>([
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 11V9h-6V3H9v6H3v2h6v10h4V11h6z" fill="#34A853" />
          <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#34A853" strokeWidth="2" />
        </svg>
      ),
      connected: false,
      color: 'bg-green-500',
      lastSync: undefined,
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0061FF">
          <path d="M12 6.5L6 10l6 3.5L0 17l6 3.5 6-3.5 6 3.5 6-3.5-6-3.5 6-3.5-6-3.5-6 3.5-6-3.5z" />
        </svg>
      ),
      connected: true,
      color: 'bg-blue-500',
      lastSync: '2 hours ago',
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0078D4">
          <path d="M12 4C8.5 4 5.5 6.5 5 10c-2.5.5-4 2.5-4 5 0 2.8 2.2 5 5 5h12c2.2 0 4-1.8 4-4 0-2-1.5-3.8-3.5-4C18 8.5 15.5 4 12 4z" />
        </svg>
      ),
      connected: false,
      color: 'bg-sky-500',
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />
        </svg>
      ),
      connected: true,
      color: 'bg-gray-800',
      lastSync: '30 minutes ago',
    },
  ]);

  // Export templates
  const templates: ExportTemplate[] = [
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'Formatted for tax filing with category totals',
      icon: '📋',
      fields: ['date', 'category', 'amount', 'description'],
    },
    {
      id: 'monthly-summary',
      name: 'Monthly Summary',
      description: 'Aggregated spending by month and category',
      icon: '📊',
      fields: ['month', 'category', 'total', 'average'],
    },
    {
      id: 'category-analysis',
      name: 'Category Analysis',
      description: 'Deep dive into spending patterns by category',
      icon: '🔍',
      fields: ['category', 'total', 'percentage', 'trend'],
    },
    {
      id: 'full-export',
      name: 'Full Data Export',
      description: 'Complete expense data with all fields',
      icon: '💾',
      fields: ['all'],
    },
  ];

  // Simulated export history
  const [exportHistory] = useState<ExportHistoryItem[]>([
    {
      id: '1',
      type: 'Monthly Summary',
      destination: 'Email',
      timestamp: new Date(Date.now() - 3600000),
      recordCount: 45,
      status: 'completed',
      size: '12 KB',
    },
    {
      id: '2',
      type: 'Full Export',
      destination: 'Google Sheets',
      timestamp: new Date(Date.now() - 86400000),
      recordCount: 156,
      status: 'completed',
      size: '48 KB',
    },
    {
      id: '3',
      type: 'Tax Report',
      destination: 'Dropbox',
      timestamp: new Date(Date.now() - 172800000),
      recordCount: 89,
      status: 'completed',
      size: '24 KB',
    },
    {
      id: '4',
      type: 'Category Analysis',
      destination: 'OneDrive',
      timestamp: new Date(Date.now() - 259200000),
      recordCount: 67,
      status: 'failed',
      size: '-',
    },
  ]);

  // Scheduled exports
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([
    {
      id: '1',
      template: 'Monthly Summary',
      destination: 'Dropbox',
      frequency: 'Monthly',
      nextRun: new Date(Date.now() + 86400000 * 5),
      enabled: true,
    },
    {
      id: '2',
      template: 'Full Export',
      destination: 'Google Sheets',
      frequency: 'Weekly',
      nextRun: new Date(Date.now() + 86400000 * 2),
      enabled: false,
    },
  ]);

  // Calculate summary
  const summary = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { count: expenses.length, total };
  }, [expenses]);

  // Toggle cloud service connection
  const toggleConnection = (serviceId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setCloudServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                connected: !s.connected,
                lastSync: !s.connected ? 'Just now' : undefined,
              }
            : s
        )
      );
      setIsProcessing(false);
      setShowSuccess(
        cloudServices.find((s) => s.id === serviceId)?.connected
          ? 'Disconnected successfully'
          : 'Connected successfully'
      );
      setTimeout(() => setShowSuccess(null), 3000);
    }, 1500);
  };

  // Generate shareable link
  const generateShareLink = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const fakeId = Math.random().toString(36).substring(7);
      setShareLink(`https://expenses.app/share/${fakeId}`);
      setIsProcessing(false);
    }, 1000);
  };

  // Handle email export
  const handleEmailExport = () => {
    if (!emailAddress) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(`Export sent to ${emailAddress}`);
      setEmailAddress('');
      setTimeout(() => setShowSuccess(null), 3000);
    }, 2000);
  };

  // Toggle scheduled export
  const toggleSchedule = (id: string) => {
    setScheduledExports((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Quick export to service
  const quickExport = (serviceId: string) => {
    const service = cloudServices.find((s) => s.id === serviceId);
    if (!service?.connected) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(`Exported to ${service.name}`);
      setTimeout(() => setShowSuccess(null), 3000);
    }, 2000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'quick',
      label: 'Quick Export',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'share',
      label: 'Share',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Export & Share
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Export Hub</h2>
                  <p className="text-violet-200 text-sm mt-0.5">
                    {summary.count} expenses • ${summary.total.toFixed(2)} total
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 -mb-5 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white text-violet-600'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Success Toast */}
            {showSuccess && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {showSuccess}
              </div>
            )}

            {/* Content */}
            <div className="p-6 h-[calc(100%-140px)] overflow-y-auto">
              {/* Quick Export Tab */}
              {activeTab === 'quick' && (
                <div className="space-y-6">
                  {/* Email Export */}
                  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-5 border border-violet-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Export</h3>
                        <p className="text-sm text-gray-500">Send your data directly to any email</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 px-4 py-2.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm bg-white"
                      />
                      <button
                        onClick={handleEmailExport}
                        disabled={!emailAddress || isProcessing}
                        className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:bg-violet-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>

                  {/* Export Templates */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Export Templates</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedTemplate === template.id
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-2xl">{template.icon}</span>
                          <h4 className="font-medium text-gray-900 mt-2">{template.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Export to Connected Services */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Quick Export</h3>
                    <div className="space-y-2">
                      {cloudServices
                        .filter((s) => s.connected)
                        .map((service) => (
                          <button
                            key={service.id}
                            onClick={() => quickExport(service.id)}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {service.icon}
                              <div className="text-left">
                                <span className="font-medium text-gray-900">{service.name}</span>
                                <p className="text-xs text-gray-500">Last sync: {service.lastSync}</p>
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        ))}
                      {cloudServices.filter((s) => s.connected).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No services connected. Go to Integrations to connect.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your favorite cloud services for seamless data sync and backup.
                  </p>
                  {cloudServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center text-white`}>
                          {service.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          {service.connected ? (
                            <div className="flex items-center gap-1.5 text-sm text-green-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              Connected • Synced {service.lastSync}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Not connected</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleConnection(service.id)}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          service.connected
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                      >
                        {isProcessing ? '...' : service.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}

                  {/* Add more integrations hint */}
                  <div className="mt-6 p-4 border-2 border-dashed border-gray-200 rounded-xl text-center">
                    <p className="text-sm text-gray-500">
                      More integrations coming soon: Airtable, QuickBooks, Zapier
                    </p>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      Set up automatic recurring exports to keep your data backed up.
                    </p>
                    <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">
                      + New Schedule
                    </button>
                  </div>

                  {scheduledExports.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        schedule.enabled ? 'border-violet-200 bg-violet-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{schedule.template}</h4>
                            <span className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border">
                              {schedule.frequency}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            To {schedule.destination} • Next: {schedule.nextRun.toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleSchedule(schedule.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            schedule.enabled ? 'bg-violet-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              schedule.enabled ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Backup status */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">Backup Status: Healthy</h4>
                        <p className="text-sm text-green-700">Your data is automatically backed up</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    View and manage your previous exports.
                  </p>
                  {exportHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            item.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : item.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {item.status === 'completed' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : item.status === 'pending' ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.type}</h4>
                          <p className="text-sm text-gray-500">
                            {item.destination} • {item.recordCount} records • {item.size}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {item.timestamp.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Share Tab */}
              {activeTab === 'share' && (
                <div className="space-y-6">
                  {/* Shareable Link */}
                  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-5 border border-violet-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Shareable Link</h3>
                        <p className="text-sm text-gray-500">Generate a secure link to share your data</p>
                      </div>
                    </div>

                    {shareLink ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 px-4 py-2.5 bg-white border border-violet-200 rounded-xl text-sm font-mono"
                          />
                          <button
                            onClick={() => navigator.clipboard.writeText(shareLink)}
                            className="px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-violet-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Link expires in 7 days • View only access
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={generateShareLink}
                        disabled={isProcessing}
                        className="w-full px-5 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:bg-violet-300 transition-colors"
                      >
                        {isProcessing ? 'Generating...' : 'Generate Shareable Link'}
                      </button>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">QR Code</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center">
                        {shareLink ? (
                          <div className="w-24 h-24 bg-gray-900 rounded-lg p-2">
                            {/* Simulated QR code pattern */}
                            <div className="w-full h-full grid grid-cols-5 gap-0.5">
                              {Array.from({ length: 25 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'}`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-center px-4">
                            Generate a link first to create QR code
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-3">
                          Scan to access your expense report on any device
                        </p>
                        <button
                          disabled={!shareLink}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Download QR Code
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Share via Apps */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Share via</h3>
                    <div className="flex gap-3">
                      {[
                        { name: 'Slack', color: 'bg-purple-600' },
                        { name: 'Teams', color: 'bg-blue-600' },
                        { name: 'Email', color: 'bg-gray-600' },
                        { name: 'WhatsApp', color: 'bg-green-600' },
                      ].map((app) => (
                        <button
                          key={app.name}
                          disabled={!shareLink}
                          className={`flex-1 px-4 py-3 ${app.color} text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm`}
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  All systems operational
                </div>
                <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  View API Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
