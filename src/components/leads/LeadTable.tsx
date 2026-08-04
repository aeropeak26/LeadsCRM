'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  UserCheck,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  Eye,
  CheckSquare,
  Square,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { exportLeadsToExcel } from '@/lib/utils/excel';
import { LeadDetailModal } from './LeadDetailModal';
import { LeadAssignmentModal } from './LeadAssignmentModal';
import { LeadImportModal } from './LeadImportModal';

export function LeadTable() {
  const { currentUser, isAdmin } = useAuth();
  const { leads, users, filters, setFilters, addLead, updateLead } = useCRM();

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeLeadForModal, setActiveLeadForModal] = useState<Lead | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    city: '',
    state: '',
    address: '',
    remarks: '',
    assignedUserId: '',
  });

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Role scoping: Sales Reps can only view assigned leads unless Admin
      if (!isAdmin && lead.assignedUserId !== currentUser.id) {
        return false;
      }

      // Search Query
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(query);
        const matchesPhone = lead.phone.toLowerCase().includes(query);
        const matchesCompany = lead.company?.toLowerCase().includes(query) || false;
        const matchesEmail = lead.email?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesPhone && !matchesCompany && !matchesEmail) {
          return false;
        }
      }

      // Status Filter
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // Assigned User Filter
      if (filters.assignedUserId !== 'all') {
        if (filters.assignedUserId === 'unassigned' && lead.assignedUserId) return false;
        if (filters.assignedUserId !== 'unassigned' && lead.assignedUserId !== filters.assignedUserId) {
          return false;
        }
      }

      // City / State Filter
      if (filters.city !== 'all' && lead.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [leads, filters, isAdmin, currentUser.id]);

  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleQuickStatusChange = (leadId: string, status: LeadStatus) => {
    updateLead(leadId, { status });
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      ...newLeadForm,
      assignedUserId: newLeadForm.assignedUserId || null,
      status: 'new',
      followupDate: null,
    });
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      city: '',
      state: '',
      address: '',
      remarks: '',
      assignedUserId: '',
    });
    setIsCreateModalOpen(false);
  };

  const statusBadgeColors: Record<LeadStatus, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    contacted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    follow_up: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    interested: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    not_interested: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dnp: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    busy: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    invalid_number: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    converted: 'bg-green-500/10 text-green-400 border-green-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-gray-800">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Filter By:</span>
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
            className="glass-input rounded-xl px-3 py-1.5 text-xs bg-gray-900 text-gray-200"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow Up</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
            <option value="dnp">DNP</option>
            <option value="busy">Busy</option>
            <option value="invalid_number">Invalid Number</option>
            <option value="converted">Converted</option>
          </select>

          {/* User Filter Dropdown (Admin only) */}
          {isAdmin && (
            <select
              value={filters.assignedUserId}
              onChange={(e) => setFilters((prev) => ({ ...prev, assignedUserId: e.target.value }))}
              className="glass-input rounded-xl px-3 py-1.5 text-xs bg-gray-900 text-gray-200"
            >
              <option value="all">All Sales Representatives</option>
              <option value="unassigned">Unassigned Only</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {(filters.status !== 'all' || filters.assignedUserId !== 'all' || filters.search) && (
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  status: 'all',
                  assignedUserId: 'all',
                  city: 'all',
                  state: 'all',
                  dateFrom: '',
                  dateTo: '',
                })
              }
              className="text-xs text-rose-400 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Bulk Assign Button (Admin) */}
          {isAdmin && selectedLeadIds.length > 0 && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold animate-pulse transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign ({selectedLeadIds.length})</span>
            </button>
          )}

          {/* Export Excel Button */}
          <button
            onClick={() => exportLeadsToExcel(filteredLeads)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          {/* Import Excel Shortcut */}
          {isAdmin && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
          )}

          {/* Create New Lead Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-950 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Lead</span>
          </button>
        </div>
      </div>

      {/* Main Tabular Grid */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/80 text-gray-400 font-semibold border-b border-gray-800 uppercase text-[11px] tracking-wider">
              <tr>
                {isAdmin && (
                  <th className="p-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="text-gray-400 hover:text-white">
                      {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-5 py-4">Customer Lead</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Assigned Rep</th>
                <th className="px-5 py-4">Follow-up Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No leads found matching your active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-800/40 transition-colors group cursor-pointer"
                    onClick={() => setActiveLeadForModal(lead)}
                  >
                    {isAdmin && (
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleSelect(lead.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {selectedLeadIds.includes(lead.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {/* Customer Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {lead.name}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <span>{lead.phone}</span>
                            </span>
                            {lead.city && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span>{lead.city}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-4 font-medium text-gray-300">
                      {lead.company ? (
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-500" />
                          <span>{lead.company}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>

                    {/* Status Badge & Quick Change Selector */}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleQuickStatusChange(lead.id, e.target.value as LeadStatus)
                        }
                        className={`px-3 py-1 text-xs font-bold rounded-full border bg-gray-900 cursor-pointer ${
                          statusBadgeColors[lead.status]
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="follow_up">Follow Up</option>
                        <option value="interested">Interested</option>
                        <option value="not_interested">Not Interested</option>
                        <option value="dnp">DNP</option>
                        <option value="busy">Busy</option>
                        <option value="invalid_number">Invalid Number</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>

                    {/* Assigned Representative */}
                    <td className="px-5 py-4">
                      {lead.assignedUserName ? (
                        <span className="text-xs font-medium text-gray-300 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800">
                          {lead.assignedUserName}
                        </span>
                      ) : (
                        <span className="text-xs text-rose-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Follow-up Date */}
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {lead.followupDate ? (
                        <div className="flex items-center space-x-1.5 text-amber-300 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(lead.followupDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveLeadForModal(lead)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                        title="View Full Lead Timeline"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Lead Add Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="font-bold text-white text-lg">Add New Lead</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Mobile Number *</label>
                  <input
                    type="text"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Company</label>
                  <input
                    type="text"
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">City</label>
                  <input
                    type="text"
                    value={newLeadForm.city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">State</label>
                  <input
                    type="text"
                    value={newLeadForm.state}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, state: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>

              {isAdmin && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Assign Sales Representative</label>
                  <select
                    value={newLeadForm.assignedUserId}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedUserId: e.target.value })}
                    className="w-full glass-input rounded-xl p-2.5 text-sm bg-gray-900"
                  >
                    <option value="">Leave Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Remarks / Notes</label>
                <textarea
                  value={newLeadForm.remarks}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, remarks: e.target.value })}
                  className="w-full glass-input rounded-xl p-2.5 text-sm h-20"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail & Timeline Modal */}
      {activeLeadForModal && (
        <LeadDetailModal
          lead={activeLeadForModal}
          isOpen={!!activeLeadForModal}
          onClose={() => setActiveLeadForModal(null)}
        />
      )}

      {/* Bulk Assignment Modal */}
      {isAssignModalOpen && (
        <LeadAssignmentModal
          selectedLeadIds={selectedLeadIds}
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => setSelectedLeadIds([])}
        />
      )}

      {/* Excel Import Modal */}
      {isImportModalOpen && (
        <LeadImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      )}
    </div>
  );
}
