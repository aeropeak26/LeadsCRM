'use client';

import React from 'react';
import { BarChart3, Download, Printer, TrendingUp, Award, PhoneCall, Calendar } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { exportLeadsToExcel } from '@/lib/utils/excel';

export function ReportsView() {
  const { leads, users, getDashboardStats } = useCRM();
  const stats = getDashboardStats();

  const handlePrintPDF = () => {
    window.print();
  };

  const statusCounts = [
    { label: 'New Leads', count: leads.filter((l) => l.status === 'new').length, color: 'bg-blue-500' },
    { label: 'Contacted', count: leads.filter((l) => l.status === 'contacted').length, color: 'bg-cyan-500' },
    { label: 'Follow Up Scheduled', count: leads.filter((l) => l.status === 'follow_up').length, color: 'bg-amber-500' },
    { label: 'Interested', count: leads.filter((l) => l.status === 'interested').length, color: 'bg-emerald-500' },
    { label: 'Not Interested', count: leads.filter((l) => l.status === 'not_interested').length, color: 'bg-rose-500' },
    { label: 'DNP (Did Not Pick)', count: leads.filter((l) => l.status === 'dnp').length, color: 'bg-purple-500' },
    { label: 'Busy / Callback', count: leads.filter((l) => l.status === 'busy').length, color: 'bg-orange-500' },
    { label: 'Converted Deals', count: leads.filter((l) => l.status === 'converted').length, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8 print:p-0">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-gray-800 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Performance Analytics & Reports</h1>
            <p className="text-xs text-gray-400">Comprehensive status metrics, lead velocity, and team conversion rates</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrintPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-xl text-xs font-semibold"
          >
            <Printer className="w-4 h-4 text-purple-400" />
            <span>Print PDF Report</span>
          </button>

          <button
            onClick={() => exportLeadsToExcel(leads, 'LeadSquare_Analytics_Report.xlsx')}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950"
          >
            <Download className="w-4 h-4" />
            <span>Export Report Data</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-3xl border border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase">Total System Volume</p>
          <p className="text-3xl font-extrabold text-white mt-2">{stats.totalLeads} Leads</p>
          <p className="text-xs text-blue-400 mt-1 font-medium">{stats.assignedLeads} Assigned</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase">Overall Conversion Rate</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            {stats.totalLeads > 0 ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0}%
          </p>
          <p className="text-xs text-emerald-300 mt-1 font-medium">{stats.convertedLeads} Closed Deals</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase">Active Sales Force</p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-2">{stats.activeUsers} Reps</p>
          <p className="text-xs text-indigo-300 mt-1 font-medium">{stats.totalUsers} Total Accounts</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase">Follow-up Backlog</p>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">{stats.todayFollowups}</p>
          <p className="text-xs text-amber-300 mt-1 font-medium">{stats.overdueFollowups} Overdue</p>
        </div>
      </div>

      {/* Visual Status Breakdown Bars */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Lead Lifecycle Distribution</span>
        </h2>

        <div className="space-y-4">
          {statusCounts.map((item, i) => {
            const percentage = stats.totalLeads > 0 ? Math.round((item.count / stats.totalLeads) * 100) : 0;
            return (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300">{item.label}</span>
                  <span className="font-bold text-gray-200">
                    {item.count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-800">
                  <div
                    className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
