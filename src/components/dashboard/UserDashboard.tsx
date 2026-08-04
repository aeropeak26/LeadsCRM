'use client';

import React, { useState } from 'react';
import {
  Layers,
  CalendarClock,
  CheckCircle2,
  Phone,
  MessageSquare,
  ThumbsUp,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { LeadDetailModal } from '../leads/LeadDetailModal';
import { Lead } from '@/lib/types';

export function UserDashboard() {
  const { currentUser } = useAuth();
  const { leads, followups, updateFollowupStatus } = useCRM();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filter leads assigned to current logged in sales rep
  const myLeads = leads.filter((l) => l.assignedUserId === currentUser.id);

  const pendingLeads = myLeads.filter((l) => l.status === 'new' || l.status === 'contacted');
  const interestedLeads = myLeads.filter((l) => l.status === 'interested');
  const convertedLeads = myLeads.filter((l) => l.status === 'converted');

  const todayStr = new Date().toISOString().split('T')[0];

  const myFollowups = followups.filter(
    (f) => f.assignedUserId === currentUser.id || myLeads.some((l) => l.id === f.leadId)
  );

  const todayFollowups = myFollowups.filter((f) => {
    const fDate = new Date(f.scheduledAt).toISOString().split('T')[0];
    return fDate === todayStr && f.status !== 'completed';
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 bg-gradient-to-r from-gray-950 via-slate-900 to-cyan-950 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sales Representative Portal</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-sm text-gray-400 max-w-xl">
            You have <span className="text-amber-400 font-semibold">{todayFollowups.length} scheduled follow-ups</span> today and{' '}
            <span className="text-blue-400 font-semibold">{myLeads.length} total assigned leads</span>.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-3xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Assigned Leads</span>
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400 mt-3">{myLeads.length}</p>
          <p className="text-xs text-gray-400 mt-1">Your active portfolio</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Today's Follow-ups</span>
            <CalendarClock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 mt-3">{todayFollowups.length}</p>
          <p className="text-xs text-gray-400 mt-1">Scheduled for today</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Interested Leads</span>
            <ThumbsUp className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400 mt-3">{interestedLeads.length}</p>
          <p className="text-xs text-gray-400 mt-1">In active evaluation</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Converted Deals</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-3">{convertedLeads.length}</p>
          <p className="text-xs text-gray-400 mt-1">Closed customer sales</p>
        </div>
      </div>

      {/* Main Section: Today's Follow-ups Drawer & Quick Lead List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Follow-ups Priority Action List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <CalendarClock className="w-5 h-5 text-amber-400" />
                <span>Today's Priority Follow-ups</span>
              </h2>
              <p className="text-xs text-gray-400">Calls and meetings scheduled for today</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
              {todayFollowups.length} Priority
            </span>
          </div>

          {todayFollowups.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
              <p className="text-base font-semibold text-gray-300">All clear for today!</p>
              <p className="text-xs text-gray-500">No pending follow-ups scheduled right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayFollowups.map((item) => {
                const targetLead = leads.find((l) => l.id === item.leadId);
                return (
                  <div
                    key={item.id}
                    className="glass-card p-5 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 hover:border-amber-500/40 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-base font-bold text-white">{item.leadName}</h3>
                        <span className="text-xs text-gray-400 font-medium">({item.leadCompany})</span>
                      </div>
                      <p className="text-xs text-amber-300 font-medium">Agenda: {item.notes}</p>
                      <p className="text-[11px] text-gray-500">
                        Scheduled Time: {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <a
                        href={`tel:${item.leadPhone}`}
                        className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl transition-all"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${item.leadPhone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 rounded-xl transition-all"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => updateFollowupStatus(item.id, 'completed')}
                        className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-all"
                      >
                        Mark Done
                      </button>

                      {targetLead && (
                        <button
                          onClick={() => setSelectedLead(targetLead)}
                          className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all"
                          title="View Full Lead Details"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assigned Leads Quick Roster */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-base font-bold text-white">Your Assigned Leads</h2>
            <span className="text-xs text-gray-400">{myLeads.length} Total</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {myLeads.slice(0, 8).map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="glass-card p-3.5 rounded-xl border border-gray-800/80 hover:border-gray-700 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{lead.name}</h4>
                  <p className="text-[11px] text-gray-400">{lead.company || lead.phone}</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
