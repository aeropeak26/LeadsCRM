'use client';

import React from 'react';
import {
  Layers,
  Users,
  UserCheck,
  UserX,
  CalendarClock,
  ThumbsUp,
  Award,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  Activity,
  PhoneCall,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';

export function AdminDashboard() {
  const { leads, users, notes, followups, getDashboardStats } = useCRM();
  const { switchRole } = useAuth();

  const stats = getDashboardStats();

  const kpiCards = [
    {
      title: 'Total System Leads',
      value: stats.totalLeads,
      subtitle: '+14% from last month',
      icon: Layers,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
      border: 'border-blue-500/30',
    },
    {
      title: 'Assigned Leads',
      value: stats.assignedLeads,
      subtitle: `${Math.round((stats.assignedLeads / (stats.totalLeads || 1)) * 100)}% distributed`,
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
    {
      title: 'Unassigned Leads',
      value: stats.unassignedLeads,
      subtitle: 'Needs sales rep assignment',
      icon: UserX,
      color: 'from-rose-600 to-pink-600',
      textColor: 'text-rose-400',
      border: 'border-rose-500/30',
    },
    {
      title: "Today's Follow-ups",
      value: stats.todayFollowups,
      subtitle: `${stats.overdueFollowups} overdue items`,
      icon: CalendarClock,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    {
      title: 'Interested Prospects',
      value: stats.interestedLeads,
      subtitle: 'High conversion probability',
      icon: ThumbsUp,
      color: 'from-cyan-600 to-blue-600',
      textColor: 'text-cyan-400',
      border: 'border-cyan-500/30',
    },
    {
      title: 'Converted Deals',
      value: stats.convertedLeads,
      subtitle: 'Closed customer sales',
      icon: Award,
      color: 'from-green-600 to-emerald-600',
      textColor: 'text-green-400',
      border: 'border-green-500/30',
    },
    {
      title: 'Active Sales Team',
      value: `${stats.activeUsers} / ${stats.totalUsers}`,
      subtitle: 'Active sales representatives',
      icon: Users,
      color: 'from-purple-600 to-indigo-600',
      textColor: 'text-purple-400',
      border: 'border-purple-500/30',
    },
    {
      title: 'Rejected / Invalid',
      value: stats.rejectedLeads,
      subtitle: 'Not interested or invalid',
      icon: XCircle,
      color: 'from-gray-600 to-slate-600',
      textColor: 'text-gray-400',
      border: 'border-gray-500/30',
    },
  ];

  // User Performance Leaderboard calculation
  const repPerformance = users
    .filter((u) => u.role === 'sales_rep')
    .map((rep) => {
      const repLeads = leads.filter((l) => l.assignedUserId === rep.id);
      const convertedCount = repLeads.filter((l) => l.status === 'converted').length;
      const interestedCount = repLeads.filter((l) => l.status === 'interested').length;
      const conversionRate = repLeads.length > 0 ? Math.round((convertedCount / repLeads.length) * 100) : 0;

      return {
        id: rep.id,
        name: rep.name,
        email: rep.email,
        totalAssigned: repLeads.length,
        convertedCount,
        interestedCount,
        conversionRate,
      };
    })
    .sort((a, b) => b.convertedCount - a.convertedCount);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 bg-gradient-to-r from-gray-950 via-slate-900 to-indigo-950 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LeadSquare Executive Dashboard</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Overview & Real-Time Performance
          </h1>
          <p className="text-sm text-gray-400 max-w-xl">
            Monitor bulk imported leads, representative assignment metrics, upcoming follow-ups, and sales conversion velocity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => switchRole('sales_rep')}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-semibold transition-all shadow-md"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Switch to Sales Rep View</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`glass-card p-6 rounded-3xl border ${card.border} hover:scale-[1.02] transition-all duration-200 relative overflow-hidden group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md shadow-gray-950 group-hover:rotate-6 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <p className={`text-3xl font-black ${card.textColor} tracking-tight`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section: Leaderboard & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Team Performance Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Sales Representative Leaderboard</span>
              </h2>
              <p className="text-xs text-gray-400">Team conversion output and assigned load</p>
            </div>
            <span className="text-xs text-gray-400 font-semibold">{repPerformance.length} Active Reps</span>
          </div>

          <div className="space-y-4">
            {repPerformance.map((rep, idx) => (
              <div
                key={rep.id}
                className="glass-card p-4 rounded-2xl border border-gray-800 flex items-center justify-between hover:bg-gray-800/40 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : idx === 1
                        ? 'bg-slate-400/20 text-slate-200 border border-slate-400/30'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{rep.name}</h3>
                    <p className="text-xs text-gray-400">{rep.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Assigned</p>
                    <p className="text-sm font-bold text-gray-200">{rep.totalAssigned} leads</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 font-medium">Converted</p>
                    <p className="text-sm font-bold text-emerald-400">{rep.convertedCount} deals</p>
                  </div>

                  <div className="w-20 bg-gray-900 p-2 rounded-xl border border-gray-800 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Rate</p>
                    <p className="text-xs font-extrabold text-blue-400">{rep.conversionRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent System Activity Feed */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Recent Activity Feed</span>
            </h2>
            <span className="text-xs text-gray-500">Live logs</span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {notes.slice(0, 6).map((note) => (
              <div key={note.id} className="glass-card p-4 rounded-xl space-y-2 border-l-2 border-l-blue-500">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-gray-200">{note.userName}</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2">{note.note}</p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">
                    Status: {note.statusAtTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
