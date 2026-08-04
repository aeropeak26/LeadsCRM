'use client';

import React from 'react';
import { Download, Printer, TrendingUp } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { exportLeadsToExcel } from '@/lib/utils/excel';

export function ReportsView() {
  const { leads, getDashboardStats } = useCRM();
  const stats = getDashboardStats();

  const handlePrintPDF = () => {
    window.print();
  };

  const statusCounts = [
    { label: 'New Leads', count: leads.filter((l) => l.status === 'new').length, color: 'bg-blue-600' },
    { label: 'Contacted', count: leads.filter((l) => l.status === 'contacted').length, color: 'bg-cyan-600' },
    { label: 'Follow Up Scheduled', count: leads.filter((l) => l.status === 'follow_up').length, color: 'bg-amber-500' },
    { label: 'Interested', count: leads.filter((l) => l.status === 'interested').length, color: 'bg-emerald-600' },
    { label: 'Not Interested', count: leads.filter((l) => l.status === 'not_interested').length, color: 'bg-rose-500' },
    { label: 'DNP (Did Not Pick)', count: leads.filter((l) => l.status === 'dnp').length, color: 'bg-purple-600' },
    { label: 'Busy / Callback', count: leads.filter((l) => l.status === 'busy').length, color: 'bg-orange-500' },
    { label: 'Converted Deals', count: leads.filter((l) => l.status === 'converted').length, color: 'bg-green-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Comprehensive status metrics, lead velocity, and conversion rates.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={handlePrintPDF} className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs">
            <Printer className="w-4 h-4 text-purple-600" />
            <span>Print PDF</span>
          </button>
          <button onClick={() => exportLeadsToExcel(leads, 'LeadSquare_Analytics_Report.xlsx')} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="light-card p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500">Total Volume</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalLeads} Leads</p>
        </div>
        <div className="light-card p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500">Conversion Rate</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {stats.totalLeads > 0 ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0}%
          </p>
        </div>
        <div className="light-card p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500">Active Reps</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.activeUsers} Reps</p>
        </div>
        <div className="light-card p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500">Follow-up Backlog</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats.todayFollowups}</p>
        </div>
      </div>

      <div className="light-card p-6 rounded-xl space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Lead Lifecycle Distribution</span>
        </h2>

        <div className="space-y-4">
          {statusCounts.map((item, i) => {
            const percentage = stats.totalLeads > 0 ? Math.round((item.count / stats.totalLeads) * 100) : 0;
            return (
              <div key={i} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.count} ({percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
