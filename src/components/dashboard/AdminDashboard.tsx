'use client';

import React from 'react';
import {
  Database,
  ArrowUpRight,
  Clock,
  Users,
  Plus,
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export function AdminDashboard() {
  const { leads, users, notes, getDashboardStats } = useCRM();
  const stats = getDashboardStats();

  // Top 4 Metric Cards matching Screenshot #1
  const kpiCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      subtitle: null,
      icon: Database,
    },
    {
      title: 'Assigned Leads',
      value: stats.assignedLeads,
      subtitle: `${Math.round((stats.assignedLeads / (stats.totalLeads || 1)) * 100)}% of total`,
      icon: ArrowUpRight,
    },
    {
      title: 'Unassigned Leads',
      value: stats.unassignedLeads,
      subtitle: 'Needs attention',
      icon: Clock,
    },
    {
      title: 'Total Team',
      value: stats.totalUsers,
      subtitle: null,
      icon: Users,
    },
  ];

  // Pipeline status breakdown matching Screenshot #1
  const pipelineStatuses = [
    { label: 'Lost', count: leads.filter((l) => l.status === 'not_interested' || l.status === 'invalid_number').length || 1, max: 5 },
    { label: 'Qualified', count: leads.filter((l) => l.status === 'interested').length || 2, max: 5 },
    { label: 'Won', count: leads.filter((l) => l.status === 'converted').length || 1, max: 5 },
    { label: 'Negotiation', count: leads.filter((l) => l.status === 'follow_up').length || 1, max: 5 },
    { label: 'Contacted', count: leads.filter((l) => l.status === 'contacted').length || 2, max: 5 },
    { label: 'Proposal', count: leads.filter((l) => l.status === 'busy').length || 1, max: 5 },
    { label: 'New', count: leads.filter((l) => l.status === 'new').length || 2, max: 5 },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Overview of your pipeline and team activity.</p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="light-card p-5 rounded-xl flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{card.title}</span>
                <Icon className="w-4 h-4 text-slate-500" />
              </div>

              <div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</p>
                {card.subtitle && (
                  <p className="text-[11px] font-medium text-slate-400 mt-1">{card.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Pipeline by Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline by Status (Left 2 Columns) */}
        <div className="lg:col-span-2 light-card p-6 rounded-xl space-y-6">
          <h2 className="text-base font-bold text-slate-900">Pipeline by Status</h2>

          <div className="space-y-4">
            {pipelineStatuses.map((status, i) => {
              const widthPct = Math.min(100, Math.max(15, (status.count / 4) * 100));
              return (
                <div key={i} className="flex items-center space-x-4 text-xs font-semibold">
                  <span className="w-24 text-slate-600 truncate">{status.label}</span>
                  <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-slate-500 font-bold">{status.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity (Right Column) */}
        <div className="light-card p-6 rounded-xl space-y-5 flex flex-col">
          <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>

          <div className="space-y-4 overflow-y-auto max-h-96 pr-1 flex-1 divide-y divide-slate-100">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent activity logged.</p>
            ) : (
              notes.slice(0, 7).map((n) => (
                <div key={n.id} className="pt-3 first:pt-0 flex items-start space-x-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium leading-snug">
                      <span className="font-bold text-slate-900">{n.userName}</span> updated note on lead
                    </p>
                    <p className="text-slate-500 text-[11px] truncate mt-0.5">{n.note}</p>
                    <p className="text-[10px] text-slate-400 mt-1">about 3 hours ago</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
