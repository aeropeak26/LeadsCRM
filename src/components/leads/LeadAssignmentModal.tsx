'use client';

import React, { useState } from 'react';
import { UserCheck, X, Shuffle, CheckCircle2 } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

interface LeadAssignmentModalProps {
  selectedLeadIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LeadAssignmentModal({
  selectedLeadIds,
  isOpen,
  onClose,
  onSuccess,
}: LeadAssignmentModalProps) {
  const { users, assignLeads, autoDistributeLeads } = useCRM();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  if (!isOpen) return null;

  const activeSalesReps = users.filter((u) => u.role === 'sales_rep' && u.status === 'active');

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    assignLeads(selectedLeadIds, selectedUserId || null);
    onSuccess();
    onClose();
  };

  const handleAutoDistribute = () => {
    autoDistributeLeads(selectedLeadIds);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Assign Selected Leads</h2>
              <p className="text-xs text-slate-500">
                Bulk action for <span className="text-blue-600 font-semibold">{selectedLeadIds.length}</span> leads
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Method 1: Manual Assignment */}
          <form onSubmit={handleManualAssign} className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Method 1: Manual User Assignment
            </label>

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full light-input rounded-xl p-2.5 text-xs bg-white text-slate-800"
              required
            >
              <option value="">Select Sales Representative...</option>
              {activeSalesReps.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
              <option value="">Unassign Leads</option>
            </select>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Assign to Selected Representative</span>
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Method 2: Auto Distribution */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Method 2: Equal Auto Distribution
            </label>
            <p className="text-xs text-slate-500">
              Automatically split the {selectedLeadIds.length} selected leads equally among all active representatives.
            </p>

            <button
              type="button"
              onClick={handleAutoDistribute}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Shuffle className="w-4 h-4" />
              <span>Auto-Distribute Equally</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
