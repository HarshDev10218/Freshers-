import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import type { FacultyMember, FacultyGroup, InvitationStatus } from '../types';
import { SAMPLE_CSV_CONTENT, VERIFIED_CBIT_STARTER_DATA } from '../data/cbitDirectory';
import { X, Upload, Download, FileText, AlertTriangle, Layers } from 'lucide-react';

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchImport: (records: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>[]) => Promise<number>;
  existingFaculty: FacultyMember[];
  currentOrganizerName: string;
}

interface ParsedPreviewRow {
  name: string;
  designation: string;
  department: string;
  faculty_group: FacultyGroup;
  status: InvitationStatus;
  invited_by: string | null;
  notes: string;
  isDuplicate: boolean;
}

export const CsvModal: React.FC<CsvModalProps> = ({
  isOpen,
  onClose,
  onBatchImport,
  existingFaculty,
  currentOrganizerName,
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedPreviewRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cbit_freshers_faculty_invitations_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadOfficialStarterData = () => {
    const existingNames = new Set(
      existingFaculty.map((f) => f.name.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim())
    );

    const rows: ParsedPreviewRow[] = VERIFIED_CBIT_STARTER_DATA.map((item) => {
      const clean = item.name.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
      return {
        name: item.name,
        designation: item.designation,
        department: item.department,
        faculty_group: item.faculty_group,
        status: item.status,
        invited_by: item.invited_by,
        notes: item.notes || '',
        isDuplicate: existingNames.has(clean),
      };
    });

    setParsedRows(rows);
    setFileName('Official CBIT Leadership & HODs (Verified Directory)');
    setParseError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setParseError(`Failed to parse CSV: ${results.errors[0].message}`);
          return;
        }

        const existingNames = new Set(
          existingFaculty.map((f) => f.name.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim())
        );

        const rows: ParsedPreviewRow[] = [];

        for (const raw of results.data as Record<string, string>[]) {
          // Normalize column headers
          const getVal = (possibleKeys: string[]) => {
            for (const key of possibleKeys) {
              const foundKey = Object.keys(raw).find((k) => k.trim().toLowerCase() === key.toLowerCase());
              if (foundKey && raw[foundKey] !== undefined) {
                return raw[foundKey].trim();
              }
            }
            return '';
          };

          const name = getVal(['name', 'faculty name', 'faculty', 'professor name']);
          if (!name) continue; // skip row without name

          const designation = getVal(['designation', 'role', 'title', 'post']);
          const department = getVal(['department', 'dept', 'branch']) || 'General Engineering';

          const rawGroup = getVal(['group', 'faculty group', 'batch group', 'batch']).toLowerCase();
          const faculty_group: FacultyGroup =
            rawGroup.includes('junior') || rawGroup.includes('1st') || rawGroup.includes('first')
              ? 'Junior Batch Faculty'
              : 'Our Batch Faculty';

          const rawStatus = getVal(['status', 'invitation status', 'invited status']).toLowerCase();
          let status: InvitationStatus = 'Not invited';
          if (rawStatus.includes('confirm')) status = 'Confirmed';
          else if (rawStatus.includes('invite') && !rawStatus.includes('not')) status = 'Invited';
          else if (rawStatus.includes('unable') || rawStatus.includes('decline') || rawStatus.includes('reject'))
            status = 'Unable to attend';

          const invited_by = getVal(['invited by', 'invited_by', 'organizer']) || null;
          const notes = getVal(['notes', 'note', 'remarks', 'comments']) || '';

          const clean = name.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();

          rows.push({
            name,
            designation,
            department,
            faculty_group,
            status,
            invited_by,
            notes,
            isDuplicate: existingNames.has(clean),
          });
        }

        if (rows.length === 0) {
          setParseError('No valid faculty records found in CSV. Please verify that a "Name" column exists.');
        } else {
          setParsedRows(rows);
        }
      },
      error: (err) => {
        setParseError(`CSV Parse Error: ${err.message}`);
      },
    });
  };

  const handleCommitImport = async () => {
    let toImport = parsedRows;
    if (skipDuplicates) {
      toImport = toImport.filter((r) => !r.isDuplicate);
    }

    if (toImport.length === 0) {
      setParseError('No new faculty records to import (all parsed records are duplicates).');
      return;
    }

    setIsImporting(true);
    setParseError(null);

    const now = new Date().toISOString();

    const formattedRecords: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>[] = toImport.map((r) => {
      const isContacted = r.status === 'Invited' || r.status === 'Confirmed';
      return {
        name: r.name,
        designation: r.designation,
        department: r.department,
        faculty_group: r.faculty_group,
        status: r.status,
        invited_by: r.invited_by || (isContacted ? (currentOrganizerName || 'Organizer') : null),
        invited_at: isContacted ? now : null,
        notes: r.notes,
        updated_by: currentOrganizerName || null,
      };
    });

    const count = await onBatchImport(formattedRecords);
    setIsImporting(false);

    if (count > 0) {
      onClose();
    }
  };

  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;
  const newCount = parsedRows.length - duplicateCount;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--maroon-primary)" />
            <h3 className="modal-title">Import Faculty List from CSV</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Guidance and Sample Download */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Upload your organizing committee's prepared spreadsheet or CSV file.
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Supported columns: <code>Name</code>, <code>Designation</code>, <code>Department</code>, <code>Group</code>, <code>Status</code>, <code>Notes</code>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleDownloadSampleCsv}
                title="Download CSV format template"
              >
                <Download size={12} />
                <span>Download Sample Template</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLoadOfficialStarterData}
                title="Populate verified official CBIT Principals & HODs list"
              >
                <Layers size={12} />
                <span>Load Verified CBIT HODs</span>
              </button>
            </div>
          </div>

          {/* File Picker */}
          <div
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: '6px',
              padding: '24px 16px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-canvas)',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Upload size={24} style={{ color: 'var(--maroon-primary)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {fileName ? fileName : 'Click to select CSV file from your computer or phone'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Standard comma-separated format (.csv)
            </p>
          </div>

          {parseError && (
            <div className="alert-box danger">
              <AlertTriangle size={14} />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontSize: '12px',
                }}
              >
                <span>
                  <strong>Preview:</strong> {parsedRows.length} records ready ({newCount} new, {duplicateCount} already listed)
                </span>
                {duplicateCount > 0 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                    />
                    <span>Skip duplicate names ({duplicateCount})</span>
                  </label>
                )}
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
                <table className="faculty-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '6px 10px' }}>Faculty Name</th>
                      <th style={{ padding: '6px 10px' }}>Designation</th>
                      <th style={{ padding: '6px 10px' }}>Department</th>
                      <th style={{ padding: '6px 10px' }}>Group</th>
                      <th style={{ padding: '6px 10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor: row.isDuplicate ? '#fff9f0' : undefined,
                          opacity: row.isDuplicate && skipDuplicates ? 0.45 : 1,
                        }}
                      >
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>
                          {row.name}
                          {row.isDuplicate && (
                            <span style={{ fontSize: '10px', color: '#8c5807', marginLeft: '6px' }}>(duplicate)</span>
                          )}
                        </td>
                        <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{row.designation || '—'}</td>
                        <td style={{ padding: '6px 10px' }}>{row.department}</td>
                        <td style={{ padding: '6px 10px' }}>{row.faculty_group}</td>
                        <td style={{ padding: '6px 10px' }}>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isImporting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCommitImport}
            disabled={isImporting || parsedRows.length === 0}
          >
            {isImporting
              ? 'Importing into Database...'
              : `Import ${skipDuplicates ? newCount : parsedRows.length} Faculty Records`}
          </button>
        </div>
      </div>
    </div>
  );
};
