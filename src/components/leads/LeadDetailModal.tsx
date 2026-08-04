'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  MapPin,
  Calendar,
  Clock,
  User,
  Plus,
  Send,
  CheckCircle2,
  Trash2,
  Edit2,
  History,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailModal({ lead, isOpen, onClose }: LeadDetailModalProps) {
  const { currentUser, isAdmin } = useAuth();
  const { notes, updateLead, deleteLead, addNote, scheduleFollowup, users } = useCRM();

  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'followup'>('info');
  const [isEditing, setIsEditing] = useState(false);

  // Note form state
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead?.status || 'new');

  // Followup form state
  const [followupDate, setFollowupDate] = useState('');
  const [followupNote, setFollowupNote] = useState('');

  // Editable Lead Info state
  const [editForm, setEditForm] = useState({
    name: lead?.name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    company: lead?.company || '',
    city: lead?.city || '',
    state: lead?.state || '',
    address: lead?.address || '',
    remarks: lead?.remarks || '',
    status: lead?.status || 'new',
    assignedUserId: lead?.assignedUserId || '',
  });

  if (!isOpen || !lead) return null;

  const leadNotes = notes.filter((n) => n.leadId === lead.id);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateLead(lead.id, {
      ...editForm,
      assignedUserId: editForm.assignedUserId || null,
    });
    setIsEditing(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    addNote(lead.id, newNoteText, selectedStatus);
    setNewNoteText('');
  };

  const handleScheduleFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate) return;

    scheduleFollowup(lead.id, followupDate, followupNote);
    setFollowupNote('');
    setFollowupDate('');
    setActiveTab('notes');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(lead.id);
      onClose();
    }
  };

  const statusColors: Record<LeadStatus, string> = {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-950">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-white">{lead.name}</h2>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                    statusColors[lead.status]
                  }`}
                >
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Company: <span className="text-gray-200 font-medium">{lead.company || 'N/A'}</span> • Assigned:{' '}
                <span className="text-blue-400 font-medium">{lead.assignedUserName || 'Unassigned'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-rose-500/20"
                title="Delete Lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Communication Action Buttons */}
        <div className="px-8 py-3 bg-gray-950/60 border-b border-gray-800/80 flex items-center space-x-4">
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call ({lead.phone})</span>
          </a>

          <a
            href={`https://wa.me/${lead.phone.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 rounded-xl text-xs font-semibold transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 px-8 bg-gray-900/30">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Lead Information
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Notes & Activity Timeline ({leadNotes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('followup')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'followup'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Follow-up</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'info' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Lead Information'}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveInfo} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Mobile Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Company</label>
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Lead Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LeadStatus })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm bg-gray-900"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="interested">Interested</option>
                      <option value="not_interested">Not Interested</option>
                      <option value="dnp">DNP (Did Not Pick)</option>
                      <option value="busy">Busy</option>
                      <option value="invalid_number">Invalid Number</option>
                      <option value="converted">Converted</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Assigned User</label>
                    <select
                      value={editForm.assignedUserId}
                      onChange={(e) => setEditForm({ ...editForm, assignedUserId: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm bg-gray-900"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Remarks</label>
                    <textarea
                      value={editForm.remarks}
                      onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                      className="w-full glass-input rounded-xl p-2.5 text-sm h-20"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="glass-card p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Details</h3>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>{lead.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span>{lead.company || 'No company specified'}</span>
                    </div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location & Status</h3>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>
                        {lead.city || 'N/A'}, {lead.state || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <User className="w-4 h-4 text-blue-400" />
                      <span>Assigned to: {lead.assignedUserName || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Follow-up: {lead.followupDate ? new Date(lead.followupDate).toLocaleString() : 'None'}</span>
                    </div>
                  </div>

                  <div className="col-span-2 glass-card p-5 rounded-2xl">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Remarks / Notes</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {lead.remarks || 'No remarks recorded.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add Note & Update Status Form */}
              <form onSubmit={handleAddNote} className="glass-card p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-gray-200">Log Call / Add Interaction Note</h3>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record customer response, feedback, or follow-up details..."
                  className="w-full glass-input rounded-xl p-3 text-sm h-24"
                  required
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400 font-semibold">Update Status to:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                      className="glass-input rounded-xl px-3 py-1.5 text-xs bg-gray-900 text-gray-200 font-medium"
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
                  </div>

                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-950 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Timeline List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Activity History</h3>

                {leadNotes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-4">No notes logged yet.</p>
                ) : (
                  leadNotes.map((note) => (
                    <div key={note.id} className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="font-semibold text-gray-200">{note.userName}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-300">{note.note}</p>
                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Status: {note.statusAtTime}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'followup' && (
            <form onSubmit={handleScheduleFollowup} className="glass-card p-6 rounded-2xl space-y-5 max-w-xl mx-auto">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Schedule Next Follow-up</span>
              </h3>

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 block">Reminder Agenda / Notes</label>
                <textarea
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  placeholder="E.g., Call to review custom enterprise quotation..."
                  className="w-full glass-input rounded-xl p-3 text-sm h-28"
                  required
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Set Follow-up Reminder</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
