import * as XLSX from 'xlsx';
import { Lead, ParsedLeadRecord } from '../types';

export function parseExcelFile(
  fileBuffer: ArrayBuffer,
  existingPhones: Set<string>
): {
  records: ParsedLeadRecord[];
  summary: {
    totalRecords: number;
    importedCount: number;
    duplicateCount: number;
    invalidCount: number;
  };
} {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to JSON rows
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const records: ParsedLeadRecord[] = [];
  let importedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  const seenInCurrentUpload = new Set<string>();

  rawRows.forEach((row) => {
    // Find keys case-insensitively
    const rowKeys = Object.keys(row);

    const getValueByKeys = (possibleKeys: string[]) => {
      // Direct exact check
      for (const k of possibleKeys) {
        if (row[k] !== undefined && String(row[k]).trim() !== '') {
          return String(row[k]).trim();
        }
      }
      // Case-insensitive substring fallback check
      for (const k of possibleKeys) {
        const foundKey = rowKeys.find((rk) => rk.toLowerCase().includes(k.toLowerCase()));
        if (foundKey && row[foundKey] !== undefined && String(row[foundKey]).trim() !== '') {
          return String(row[foundKey]).trim();
        }
      }
      return '';
    };

    // Smart Column Header Mapping: Title, Name, Phone, Mobile, Email, Company, City, State, Address, Remarks
    const name = getValueByKeys(['Title', 'title', 'Name', 'name', 'Full Name', 'Customer Name', 'Customer', 'firstName']);
    const phoneRaw = getValueByKeys(['Phone', 'phone', 'Mobile Number', 'Mobile', 'mobile', 'Contact', 'Phone Number', 'Contact Number']);
    const email = getValueByKeys(['Email', 'email', 'Email Address']);
    const company = getValueByKeys(['Company', 'company', 'Company Name', 'Organization']);
    const city = getValueByKeys(['City', 'city', 'Location']);
    const state = getValueByKeys(['State', 'state', 'Region']);
    const address = getValueByKeys(['Address', 'address', 'Street']);
    const remarks = getValueByKeys(['Remarks', 'remarks', 'Notes', 'Comment']);

    // Clean phone number (strip spaces, hyphens, non-digits except +)
    const cleanPhone = phoneRaw.replace(/[^\d+]/g, '');

    // Validation checks
    let isValid = true;
    let validationError = '';

    if (!name) {
      isValid = false;
      validationError = 'Missing Title / Customer Name';
    } else if (!cleanPhone || cleanPhone.length < 5) {
      isValid = false;
      validationError = 'Invalid Phone / Mobile Number';
    }

    // Duplicate checks
    const isDuplicate = existingPhones.has(cleanPhone) || seenInCurrentUpload.has(cleanPhone);

    if (cleanPhone) {
      seenInCurrentUpload.add(cleanPhone);
    }

    if (!isValid) {
      invalidCount++;
    } else if (isDuplicate) {
      duplicateCount++;
    } else {
      importedCount++;
    }

    records.push({
      name,
      phone: cleanPhone || phoneRaw,
      email,
      company,
      city,
      state,
      address,
      remarks,
      isValid,
      isDuplicate,
      validationError,
    });
  });

  return {
    records,
    summary: {
      totalRecords: rawRows.length,
      importedCount,
      duplicateCount,
      invalidCount,
    },
  };
}

export function exportLeadsToExcel(leads: Lead[], filename = 'LeadsSquare_Export.xlsx') {
  const exportData = leads.map((l) => ({
    'Lead ID': l.id,
    'Title / Customer Name': l.name,
    'Mobile / Phone Number': l.phone,
    Email: l.email,
    Company: l.company,
    City: l.city,
    State: l.state,
    Address: l.address,
    Status: l.status.toUpperCase().replace('_', ' '),
    'Assigned Representative': l.assignedUserName || 'Unassigned',
    'Follow-up Date': l.followupDate ? new Date(l.followupDate).toLocaleString() : 'N/A',
    Remarks: l.remarks,
    'Created Date': new Date(l.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, filename);
}
