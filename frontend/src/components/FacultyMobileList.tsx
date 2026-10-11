import React from 'react';
import type { FacultyMember, InvitationStatus } from '../types';
import { Edit2, Trash2, CheckCircle2, Mail, ChevronDown } from 'lucide-react';

interface FacultyMobileListProps {
  faculty: FacultyMember[];
  onStatusChange: (id: string, newStatus: InvitationStatus) => void;
  onEdit: (member: FacultyMember) => void;
  onDelete: (member: FacultyMember) => void;
  isUpdatingId: string | null;
}

export const FacultyMobileList: React.FC<FacultyMobileListProps> = ({
  faculty,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdatingId,
}) => {
  if (faculty.length === 0) {
    return null;
  }

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return null;
    }
  };

  return (
    <div className="mobile-card-list">
      {faculty.map((member) => {
        const isUpdating = isUpdatingId === member.id;
        const isJunior = member.faculty_group === 'Junior Batch Faculty';
        const timeStr = formatDateTime(member.invited_at);

        return (
          <div key={member.id} className="faculty-card-mobile" style={{ opacity: isUpdating ? 0.6 : 1 }}>
            <div className="mobile-card-header">
              <div>
                <div className="mobile-card-title">{member.name}</div>
                {member.designation && <div className="mobile-card-sub">{member.designation}</div>}
              </div>
              <span className={`group-badge ${isJunior ? 'junior-batch' : 'our-batch'}`}>
                {isJunior ? 'Junior Batch' : 'Our Batch'}
              </span>
            </div>

            <div className="mobile-card-meta">
              <span className="dept-pill" style={{ maxWidth: '100%' }}>
                {member.department}
              </span>
            </div>

            {/* Status direct selector */}
            <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>STATUS:</span>
              <div className="status-select-wrap" style={{ flex: 1 }}>
                <select
                  className={`status-select status-badge status-${member.status.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ width: '100%', padding: '6px 24px 6px 10px', fontSize: '12px' }}
                  value={member.status}
                  disabled={isUpdating}
                  onChange={(e) => onStatusChange(member.id, e.target.value as InvitationStatus)}
                >
                  <option value="Not invited">Not invited</option>
                  <option value="Invited">Invited</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Unable to attend">Unable to attend</option>
                </select>
                <ChevronDown size={12} className="status-select-arrow" />
              </div>
            </div>

            {/* Quick 1-tap buttons for organizers walking around */}
            {member.status === 'Not invited' && (
              <div style={{ marginBottom: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                  onClick={() => onStatusChange(member.id, 'Invited')}
                  disabled={isUpdating}
                >
                  <Mail size={12} />
                  <span>Mark as Contacted / Invited Now</span>
                </button>
              </div>
            )}

            {member.status === 'Invited' && (
              <div style={{ marginBottom: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', padding: '6px', fontSize: '12px', borderColor: '#2b8a3e', color: '#1d5f34' }}
                  onClick={() => onStatusChange(member.id, 'Confirmed')}
                  disabled={isUpdating}
                >
                  <CheckCircle2 size={12} />
                  <span>Mark Confirmed (Attending)</span>
                </button>
              </div>
            )}

            {/* Meta info & Notes */}
            {(member.invited_by || timeStr || member.notes) && (
              <div style={{ background: 'var(--bg-canvas)', padding: '6px 8px', borderRadius: '4px', marginBottom: '8px', fontSize: '11px' }}>
                {member.invited_by && (
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>Invited by:</strong> {member.invited_by} {timeStr ? `(${timeStr})` : ''}
                  </div>
                )}
                {member.notes && (
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                    <strong>Note:</strong> {member.notes}
                  </div>
                )}
              </div>
            )}

            {/* Card footer actions */}
            <div className="mobile-card-actions">
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {member.updated_at ? `Updated ${new Date(member.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEdit(member)}
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(member)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
