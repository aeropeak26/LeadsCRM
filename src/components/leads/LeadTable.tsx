'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Phone,
  Mail,
  UserCheck,
  CheckSquare,
  Square,
  FileSpreadsheet,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { exportLeadsToExcel } from '@/lib/utils/excel';
import { LeadDetailModal } from './LeadDetailModal';
import { LeadAssignmentModal } from './LeadAssignmentModal';

export function LeadTable() {
  const { currentUser, isAdmin } = useAuth();
  const { leads, users, filters, setFilters, addLead, updateLead, deleteLead } = useCRM();

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeLeadForModal, setActiveLeadForModal] = useState<Lead | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (!isAdmin && lead.assignedUserId !== currentUser?.id) {
        return false;
      }

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

      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [leads, filters, isAdmin, currentUser?.id]);

  // Reset pagination when filters or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

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

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(filteredLeads.length, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header matching Screenshot #2 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage and track your pipeline.</p>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin && selectedLeadIds.length > 0 && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign ({selectedLeadIds.length})</span>
            </button>
          )}

          <button
            onClick={() => exportLeadsToExcel(filteredLeads)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, company, or email..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 text-xs light-input rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
          className="light-input rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-white"
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
      </div>

      {/* Clean White Table Grid */}
      <div className="light-card rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                {isAdmin && (
                  <th className="p-3.5 w-10 text-center">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-700">
                      {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Company</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Assignee</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80 text-slate-700 bg-white">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setActiveLeadForModal(lead)}
                  >
                    {isAdmin && (
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleSelect(lead.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {selectedLeadIds.includes(lead.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}

                    <td className="px-5 py-3.5 font-bold text-slate-900">{lead.name}</td>

                    <td className="px-5 py-3.5 text-slate-600 font-medium">{lead.company || '—'}</td>

                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => handleQuickStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 cursor-pointer"
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

                    <td className="px-5 py-3.5 text-slate-500 font-medium">Excel Import</td>

                    <td className="px-5 py-3.5 font-medium text-slate-600">
                      {lead.assignedUserName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredLeads.length > 0 && (
          <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{startIndex}</span> to{' '}
              <span className="font-bold text-slate-900">{endIndex}</span> of{' '}
              <span className="font-bold text-slate-900">{filteredLeads.length}</span> leads
            </div>

            <div className="flex items-center space-x-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Prev / Next Pagination Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add New Lead</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full light-input rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Mobile Number *</label>
                  <input
                    type="text"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full light-input rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full light-input rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Company</label>
                  <input
                    type="text"
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    className="w-full light-input rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Remarks / Notes</label>
                <textarea
                  value={newLeadForm.remarks}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, remarks: e.target.value })}
                  className="w-full light-input rounded-xl p-2.5 text-xs h-20"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeLeadForModal && (
        <LeadDetailModal lead={activeLeadForModal} isOpen={!!activeLeadForModal} onClose={() => setActiveLeadForModal(null)} />
      )}

      {isAssignModalOpen && (
        <LeadAssignmentModal selectedLeadIds={selectedLeadIds} isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} onSuccess={() => setSelectedLeadIds([])} />
      )}
    </div>
  );
}
