import React, { useState } from 'react';
import type { FacultyMember, InvitationStatus, SortField, SortDirection } from '../types';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Check,
  ChevronDown
} from 'lucide-react';

interface FacultyTableProps {
  faculty: FacultyMember[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onStatusChange: (id: string, newStatus: InvitationStatus) => void;
  onEdit: (member: FacultyMember) => void;
  onDelete: (member: FacultyMember) => void;
  onQuickNoteSave: (id: string, notes: string) => void;
  isUpdatingId: string | null;
}

export const FacultyTable: React.FC<FacultyTableProps> = ({
  faculty,
  sortField,
  sortDirection,
  onSort,
  onStatusChange,
  onEdit,
  onDelete,
  onQuickNoteSave,
  isUpdatingId,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const handleStartEditNote = (member: FacultyMember) => {
    setEditingNoteId(member.id);
    setNoteText(member.notes || '');
  };

  const handleSaveNote = (id: string) => {
    onQuickNoteSave(id, noteText);
    setEditingNoteId(null);
  };

  const handleCancelNote = () => {
    setEditingNoteId(null);
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} style={{ opacity: 0.35, marginLeft: 4 }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={11} style={{ color: 'var(--maroon-primary)', marginLeft: 4 }} />
    ) : (
      <ArrowDown size={11} style={{ color: 'var(--maroon-primary)', marginLeft: 4 }} />
    );
  };

  if (faculty.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <p className="empty-state-title">No faculty members found</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            No records match your active search or filters. Try adjusting your filters or add a new faculty member.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="faculty-table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => onSort('name')} style={{ minWidth: '180px' }}>
              <span>Faculty Name & Designation</span>
              {renderSortIcon('name')}
            </th>
            <th className="sortable" onClick={() => onSort('department')} style={{ minWidth: '160px' }}>
              <span>Department</span>
              {renderSortIcon('department')}
            </th>
            <th className="sortable" onClick={() => onSort('faculty_group')} style={{ width: '130px' }}>
              <span>Batch Group</span>
              {renderSortIcon('faculty_group')}
            </th>
            <th className="sortable" onClick={() => onSort('status')} style={{ width: '150px' }}>
              <span>Invitation Status</span>
              {renderSortIcon('status')}
            </th>
            <th style={{ width: '130px' }}>
              <span>Invited By</span>
            </th>
            <th className="sortable" onClick={() => onSort('invited_at')} style={{ width: '130px' }}>
              <span>Time Invited</span>
              {renderSortIcon('invited_at')}
            </th>
            <th style={{ minWidth: '170px' }}>
              <span>Notes & Logistics</span>
            </th>
            <th style={{ width: '90px', textAlign: 'right' }}>
              <span>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {faculty.map((member) => {
            const isUpdating = isUpdatingId === member.id;
            const isJunior = member.faculty_group === 'Junior Batch Faculty';

            return (
              <tr key={member.id} style={{ opacity: isUpdating ? 0.6 : 1 }}>
                {/* Faculty Name & Designation */}
                <td>
                  <div className="faculty-name-cell">{member.name}</div>
                  {member.designation && (
                    <div className="faculty-designation">{member.designation}</div>
                  )}
                </td>

                {/* Department */}
                <td>
                  <span className="dept-pill" title={member.department}>
                    {member.department}
                  </span>
                </td>

                {/* Batch Group */}
                <td>
                  <span className={`group-badge ${isJunior ? 'junior-batch' : 'our-batch'}`}>
                    {isJunior ? 'Junior Batch' : "Our Batch"}
                  </span>
                </td>

                {/* Direct Status Selector */}
                <td>
                  <div className="status-select-wrap">
                    <select
                      className={`status-select status-badge status-${member.status.toLowerCase().replace(/\s+/g, '-')}`}
                      value={member.status}
                      disabled={isUpdating}
                      onChange={(e) => onStatusChange(member.id, e.target.value as InvitationStatus)}
                      title="Update invitation status"
                    >
                      <option value="Not invited">Not invited</option>
                      <option value="Invited">Invited</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Unable to attend">Unable to attend</option>
                    </select>
                    <ChevronDown size={11} className="status-select-arrow" />
                  </div>
                </td>

                {/* Invited By */}
                <td>
                  {member.invited_by ? (
                    <div className="table-meta-subtext" style={{ fontWeight: 500 }}>
                      {member.invited_by}
                    </div>
                  ) : (
                    <span className="table-notes-empty">—</span>
                  )}
                </td>

                {/* Time Invited */}
                <td>
                  <div className="table-meta-subtext">
                    {formatDateTime(member.invited_at)}
                  </div>
                </td>

                {/* Notes */}
                <td>
                  {editingNoteId === member.id ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '3px 6px', fontSize: '11px', height: '26px' }}
                        value={noteText}
                        autoFocus
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNote(member.id);
                          if (e.key === 'Escape') handleCancelNote();
                        }}
                        placeholder="e.g. met in cabin, left card"
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleSaveNote(member.id)}
                        title="Save note"
                      >
                        <Check size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 6px' }}
                        onClick={handleCancelNote}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  ) : member.notes ? (
                    <span
                      className="table-notes-preview"
                      onClick={() => handleStartEditNote(member)}
                      title={`Click to edit note: "${member.notes}"`}
                    >
                      {member.notes}
                    </span>
                  ) : (
                    <span
                      className="table-notes-empty"
                      onClick={() => handleStartEditNote(member)}
                      title="Click to add an organizer note"
                    >
                      + Add note
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 6px', marginRight: '4px' }}
                    onClick={() => onEdit(member)}
                    title="Edit faculty member details"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ padding: '4px 6px' }}
                    onClick={() => onDelete(member)}
                    title="Delete record"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
