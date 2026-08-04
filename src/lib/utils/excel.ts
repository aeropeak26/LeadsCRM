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
    // Map column variations flexible matching
    const name = String(
      row['Name'] || row['Full Name'] || row['Customer Name'] || row['name'] || ''
    ).trim();

    const phoneRaw = String(
      row['Mobile Number'] || row['Mobile'] || row['Phone'] || row['Phone Number'] || row['Contact'] || row['phone'] || ''
    ).trim();

    const email = String(
      row['Email'] || row['Email Address'] || row['email'] || ''
    ).trim();

    const company = String(
      row['Company Name'] || row['Company'] || row['Organization'] || row['company'] || ''
    ).trim();

    const city = String(
      row['City'] || row['Location'] || row['city'] || ''
    ).trim();

    const state = String(
      row['State'] || row['Region'] || row['state'] || ''
    ).trim();

    const address = String(
      row['Address'] || row['Street'] || row['address'] || ''
    ).trim();

    const remarks = String(
      row['Remarks'] || row['Notes'] || row['Comment'] || row['remarks'] || ''
    ).trim();

    // Clean phone number (strip spaces, hyphens)
    const cleanPhone = phoneRaw.replace(/[^\d+]/g, '');

    // Validation checks
    let isValid = true;
    let validationError = '';

    if (!name) {
      isValid = false;
      validationError = 'Missing Customer Name';
    } else if (!cleanPhone || cleanPhone.length < 7) {
      isValid = false;
      validationError = 'Invalid Mobile Number';
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
    'Customer Name': l.name,
    'Mobile Number': l.phone,
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
