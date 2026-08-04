'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { parseExcelFile } from '@/lib/utils/excel';
import { ParsedLeadRecord } from '@/lib/types';
import { useCRM } from '@/context/CRMContext';

interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeadImportModal({ isOpen, onClose }: LeadImportModalProps) {
  const { leads, importExcelRecords } = useCRM();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{
    records: ParsedLeadRecord[];
    summary: {
      totalRecords: number;
      importedCount: number;
      duplicateCount: number;
      invalidCount: number;
    };
  } | null>(null);

  const [previewTab, setPreviewTab] = useState<'all' | 'valid' | 'duplicates' | 'invalid'>('all');
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const existingPhones = new Set(leads.map((l) => l.phone.replace(/[^\d+]/g, '')));

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      if (buffer) {
        const result = parseExcelFile(buffer, existingPhones);
        setParsedData(result);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleConfirmImport = () => {
    if (!parsedData || !file) return;

    importExcelRecords(parsedData.records, file.name);
    setIsDone(true);
  };

  const filteredRecords = parsedData?.records.filter((r) => {
    if (previewTab === 'valid') return r.isValid && !r.isDuplicate;
    if (previewTab === 'duplicates') return r.isDuplicate;
    if (previewTab === 'invalid') return !r.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Bulk Lead Excel Import</h2>
              <p className="text-xs text-gray-400">Supported Formats: .xlsx, .xls, .csv</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {isDone ? (
            /* Success Summary View */
            <div className="text-center py-12 space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Leads Successfully Imported!</h3>
              <p className="text-sm text-gray-400">
                Processed <span className="text-gray-200 font-semibold">{parsedData?.summary.totalRecords}</span> total rows from file{' '}
                <span className="text-blue-400">{file?.name}</span>.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-4 text-left">
                <div className="glass-card p-4 rounded-xl text-center">
                  <span className="text-2xl font-bold text-emerald-400">
                    {parsedData?.summary.importedCount}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Valid Imported</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <span className="text-2xl font-bold text-amber-400">
                    {parsedData?.summary.duplicateCount}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Duplicates Skipped</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <span className="text-2xl font-bold text-rose-400">
                    {parsedData?.summary.invalidCount}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Invalid Skipped</p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-950"
                >
                  Done & View Directory
                </button>
              </div>
            </div>
          ) : !parsedData ? (
            /* Drag & Drop Upload Zone */
            <div className="max-w-xl mx-auto space-y-6 py-8">
              <label className="border-2 border-dashed border-gray-700 hover:border-emerald-500/60 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-900/40 hover:bg-gray-900/80 group">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 group-hover:scale-110 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 transition-all">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-gray-200">
                  Click to select or drag & drop Excel file
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Expected columns: Name, Mobile Number, Email, Company, City, State, Remarks
                </p>

                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* Excel Validation Preview Grid */
            <div className="space-y-6">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Total Rows</p>
                    <p className="text-xl font-bold text-white mt-0.5">{parsedData.summary.totalRecords}</p>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>

                <div className="glass-card p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500">
                  <div>
                    <p className="text-xs font-bold text-emerald-400 uppercase">Ready to Import</p>
                    <p className="text-xl font-bold text-white mt-0.5">{parsedData.summary.importedCount}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="glass-card p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500">
                  <div>
                    <p className="text-xs font-bold text-amber-400 uppercase">Duplicates Detected</p>
                    <p className="text-xl font-bold text-white mt-0.5">{parsedData.summary.duplicateCount}</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>

                <div className="glass-card p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-rose-500">
                  <div>
                    <p className="text-xs font-bold text-rose-400 uppercase">Invalid Records</p>
                    <p className="text-xl font-bold text-white mt-0.5">{parsedData.summary.invalidCount}</p>
                  </div>
                  <X className="w-5 h-5 text-rose-400" />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex space-x-2">
                  {(['all', 'valid', 'duplicates', 'invalid'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPreviewTab(tab)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                        previewTab === tab
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-gray-400">
                  Showing {filteredRecords?.length} of {parsedData.summary.totalRecords} records
                </span>
              </div>

              {/* Data Preview Table */}
              <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900/80 text-gray-400 font-semibold sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Customer Name</th>
                      <th className="px-4 py-3">Mobile Number</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {filteredRecords?.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-800/40">
                        <td className="px-4 py-2.5">
                          {!r.isValid ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Invalid: {r.validationError}
                            </span>
                          ) : r.isDuplicate ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Duplicate Phone
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Valid
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-white">{r.name || '—'}</td>
                        <td className="px-4 py-2.5">{r.phone || '—'}</td>
                        <td className="px-4 py-2.5">{r.email || '—'}</td>
                        <td className="px-4 py-2.5">{r.company || '—'}</td>
                        <td className="px-4 py-2.5">
                          {r.city ? `${r.city}, ${r.state}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {parsedData && !isDone && (
          <div className="px-8 py-4 border-t border-gray-800 bg-gray-900/50 flex items-center justify-between">
            <button
              onClick={() => setParsedData(null)}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
            >
              Choose Different File
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={parsedData.summary.importedCount === 0}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-950 disabled:opacity-50 transition-all"
            >
              <span>Save & Import {parsedData.summary.importedCount} Leads</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
