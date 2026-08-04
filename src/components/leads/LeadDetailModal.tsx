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

  const [newNoteText, setNewNoteText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead?.status || 'new');

  const [followupDate, setFollowupDate] = useState('');
  const [followupNote, setFollowupNote] = useState('');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-slate-900">{lead.name}</h2>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Company: <span className="text-slate-800 font-semibold">{lead.company || 'N/A'}</span> • Assigned:{' '}
                <span className="text-blue-600 font-semibold">{lead.assignedUserName || 'Unassigned'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-200"
                title="Delete Lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Communication Quick Triggers */}
        <div className="px-8 py-3 bg-slate-100/60 border-b border-slate-200 flex items-center space-x-3">
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call ({lead.phone})</span>
          </a>

          <a
            href={`https://wa.me/${lead.phone.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-8 bg-slate-50/30">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lead Information
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Notes & Activity Timeline ({leadNotes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('followup')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'followup' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Follow-up</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'info' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Lead Information'}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveInfo} className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full light-input rounded-xl p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 mb-1 block">Mobile Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full light-input rounded-xl p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full light-input rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 mb-1 block">Company</label>
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      className="w-full light-input rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 mb-1 block">Lead Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LeadStatus })}
                      className="w-full light-input rounded-xl p-2.5 bg-white"
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
                  <div>
                    <label className="font-semibold text-slate-600 mb-1 block">Assigned User</label>
                    <select
                      value={editForm.assignedUserId}
                      onChange={(e) => setEditForm({ ...editForm, assignedUserId: e.target.value })}
                      className="w-full light-input rounded-xl p-2.5 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-xs">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider">Contact Details</h3>
                    <div className="flex items-center space-x-3 text-slate-800">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-800">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>{lead.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-800">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>{lead.company || 'No company specified'}</span>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider">Location & Status</h3>
                    <div className="flex items-center space-x-3 text-slate-800">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{lead.city || 'N/A'}, {lead.state || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-800">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Assigned to: {lead.assignedUserName || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-800">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Follow-up: {lead.followupDate ? new Date(lead.followupDate).toLocaleString() : 'None'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <form onSubmit={handleAddNote} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">Add Call / Interaction Note</h3>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record customer feedback or discussion points..."
                  className="w-full light-input rounded-xl p-3 h-20 text-xs"
                  required
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-600">Update Status:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                      className="light-input rounded-lg px-2.5 py-1 text-xs bg-white text-slate-800"
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

                  <button type="submit" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl">
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {leadNotes.map((n) => (
                  <div key={n.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span className="font-bold text-slate-900">{n.userName}</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800">{n.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'followup' && (
            <form onSubmit={handleScheduleFollowup} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 max-w-xl mx-auto text-xs">
              <h3 className="text-sm font-bold text-slate-900">Schedule Follow-up</h3>

              <div>
                <label className="font-semibold text-slate-600 mb-1 block">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full light-input rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 mb-1 block">Agenda / Notes</label>
                <textarea
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  placeholder="Call to review proposal..."
                  className="w-full light-input rounded-xl p-3 h-24"
                  required
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl">
                Set Reminder
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
