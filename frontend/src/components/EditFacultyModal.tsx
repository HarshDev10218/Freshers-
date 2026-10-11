import React, { useState, useEffect } from 'react';
import type { FacultyMember, FacultyGroup, InvitationStatus } from '../types';
import { CBIT_DEPARTMENTS, CBIT_DESIGNATIONS } from '../data/cbitDirectory';
import { X, Edit2, AlertTriangle } from 'lucide-react';

interface EditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FacultyMember | null;
  onSave: (id: string, updates: Partial<Omit<FacultyMember, 'id' | 'created_at'>>) => Promise<boolean>;
  currentOrganizerName: string;
}

export const EditFacultyModal: React.FC<EditFacultyModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  currentOrganizerName,
}) => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [customDept, setCustomDept] = useState('');
  const [facultyGroup, setFacultyGroup] = useState<FacultyGroup>('Junior Batch Faculty');
  const [status, setStatus] = useState<InvitationStatus>('Not invited');
  const [invitedBy, setInvitedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setDesignation(member.designation || '');
      if ((CBIT_DEPARTMENTS as readonly string[]).includes(member.department)) {
        setDepartment(member.department);
        setCustomDept('');
      } else {
        setDepartment('Other');
        setCustomDept(member.department);
      }
      setFacultyGroup(member.faculty_group);
      setStatus(member.status);
      setInvitedBy(member.invited_by || '');
      setNotes(member.notes || '');
      setError(null);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const finalDepartment = department === 'Other' ? customDept.trim() : department;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide the faculty member’s name.');
      return;
    }
    if (!finalDepartment) {
      setError('Please specify a department.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const statusChanged = member.status !== status;
    const isNowContacted = (status === 'Invited' || status === 'Confirmed');
    
    let updatedInvitedAt = member.invited_at;
    let updatedInvitedBy = invitedBy.trim() || member.invited_by;

    if (statusChanged && isNowContacted && !member.invited_at) {
      updatedInvitedAt = new Date().toISOString();
      if (!updatedInvitedBy) {
        updatedInvitedBy = currentOrganizerName || 'Organizer';
      }
    } else if (status === 'Not invited') {
      updatedInvitedAt = null;
      updatedInvitedBy = null;
    }

    const updates: Partial<Omit<FacultyMember, 'id' | 'created_at'>> = {
      name: name.trim(),
      designation: designation.trim(),
      department: finalDepartment,
      faculty_group: facultyGroup,
      status: status,
      invited_by: updatedInvitedBy,
      invited_at: updatedInvitedAt,
      notes: notes.trim(),
      updated_by: currentOrganizerName || null,
    };

    const success = await onSave(member.id, updates);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={16} color="var(--maroon-primary)" />
            <h3 className="modal-title">Edit Faculty Record</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert-box danger">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Faculty Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation / Title</label>
              <input
                type="text"
                list="edit-designations"
                className="form-input"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
              <datalist id="edit-designations">
                {CBIT_DESIGNATIONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">
                Department <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {CBIT_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="Other">Other / Custom</option>
              </select>

              {department === 'Other' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '6px' }}
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Batch Group</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="editFacultyGroup"
                    value="Junior Batch Faculty"
                    checked={facultyGroup === 'Junior Batch Faculty'}
                    onChange={() => setFacultyGroup('Junior Batch Faculty')}
                  />
                  <span>Junior Batch Faculty</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="editFacultyGroup"
                    value="Our Batch Faculty"
                    checked={facultyGroup === 'Our Batch Faculty'}
                    onChange={() => setFacultyGroup('Our Batch Faculty')}
                  />
                  <span>Our Batch Faculty</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Invitation Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as InvitationStatus)}
              >
                <option value="Not invited">Not invited</option>
                <option value="Invited">Invited</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Unable to attend">Unable to attend</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Invited By (Organizer Name / Email)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sravan, Harshith, Pranay"
                value={invitedBy}
                onChange={(e) => setInvitedBy(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logistics Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
