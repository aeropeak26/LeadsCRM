'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { parseExcelFile } from '@/lib/utils/excel';
import { ParsedLeadRecord } from '@/lib/types';
import { useCRM } from '@/context/CRMContext';

export default function ImportPage() {
  const { leads, users, importExcelRecords } = useCRM();

  const [file, setFile] = useState<File | null>(null);
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  const [parsedData, setParsedData] = useState<{
    records: ParsedLeadRecord[];
    summary: {
      totalRecords: number;
      importedCount: number;
      duplicateCount: number;
      invalidCount: number;
    };
  } | null>(null);

  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const existingPhones = new Set(leads.map((l) => l.phone.replace(/[^\d+]/g, '')));

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      if (buffer) {
        const result = parseExcelFile(buffer, existingPhones);
        setParsedData(result);
      }
    };
    reader.readAsArrayBuffer(selected);
  };

  const handleImport = () => {
    if (!parsedData || !file) return;

    importExcelRecords(parsedData.records, file.name);
    setIsSuccess(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header matching Screenshot #4 */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Import Leads</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Bulk upload leads from CSV or Excel files.</p>
      </div>

      {/* Main Import Card matching Screenshot #4 */}
      <div className="light-card p-8 rounded-2xl space-y-6 bg-white border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">File Upload</h2>
          <p className="text-xs text-slate-500 mt-1">
            File must include 'firstName', 'lastName', and 'email' columns. 'company', 'phone', and 'source' are optional.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Leads Imported Successfully!</h3>
            <p className="text-xs text-slate-500">
              Imported {parsedData?.summary.importedCount} valid records from {file?.name}.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                setFile(null);
                setParsedData(null);
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
            >
              Import Another File
            </button>
          </div>
        ) : (
          <>
            {/* Dotted Upload Zone matching Screenshot #4 */}
            <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50 group">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                {file ? file.name : 'Drag & drop your file here'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Supports .csv and .xlsx</p>

              <div className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200">
                Browse Files
              </div>

              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Optional Assignee Dropdown matching Screenshot #4 */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                Assign Imported Leads To (Optional)
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full light-input rounded-xl p-3 text-xs bg-white text-slate-700 border border-slate-200"
              >
                <option value="">Do not assign</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Import Button matching Screenshot #4 */}
            <button
              onClick={handleImport}
              disabled={!file}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Import Leads</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
