import React, { useState } from 'react';
import type { FacultyMember, FacultyGroup, InvitationStatus } from '../types';
import { CBIT_DEPARTMENTS, CBIT_DESIGNATIONS } from '../data/cbitDirectory';
import { X, AlertTriangle, PlusCircle } from 'lucide-react';

interface AddFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newRecord: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  existingFaculty: FacultyMember[];
  currentOrganizerName: string;
}

export const AddFacultyModal: React.FC<AddFacultyModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingFaculty,
  currentOrganizerName,
}) => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState<string>(CBIT_DEPARTMENTS[0]);
  const [customDept, setCustomDept] = useState('');
  const [facultyGroup, setFacultyGroup] = useState<FacultyGroup>('Junior Batch Faculty');
  const [status, setStatus] = useState<InvitationStatus>('Not invited');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalDepartment = department === 'Other' ? customDept.trim() : department;

  const checkForDuplicates = (checkName: string) => {
    if (!checkName.trim()) return;
    const trimmed = checkName.trim().toLowerCase();
    const existing = existingFaculty.find(
      (f) =>
        f.name.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim() ===
        trimmed.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim()
    );

    if (existing) {
      setDuplicateWarning(
        `Note: "${existing.name}" is already listed under ${existing.department} (${existing.faculty_group}). Verify before adding a duplicate.`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter the faculty member’s name.');
      return;
    }

    if (!finalDepartment) {
      setError('Please select or specify a department.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const isContacted = status === 'Invited' || status === 'Confirmed';

    const newRecord: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'> = {
      name: name.trim(),
      designation: designation.trim(),
      department: finalDepartment,
      faculty_group: facultyGroup,
      status: status,
      invited_by: isContacted ? (currentOrganizerName || 'Organizer') : null,
      invited_at: isContacted ? now : null,
      notes: notes.trim(),
      updated_by: currentOrganizerName || null,
    };

    const success = await onAdd(newRecord);
    setIsSubmitting(false);

    if (success) {
      // Reset form
      setName('');
      setDesignation('');
      setNotes('');
      setStatus('Not invited');
      setDuplicateWarning(null);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={16} color="var(--maroon-primary)" />
            <h3 className="modal-title">Add Faculty Member</h3>
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

            {duplicateWarning && (
              <div className="alert-box warning">
                <AlertTriangle size={14} />
                <span>{duplicateWarning}</span>
              </div>
            )}

            {/* Faculty Name */}
            <div className="form-group">
              <label className="form-label">
                Faculty Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Prof. S. China Ramu or Dr. K. Vasanth"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  checkForDuplicates(e.target.value);
                }}
                required
                autoFocus
              />
              <span className="form-hint">Refer to official CBIT directory for exact spelling.</span>
            </div>

            {/* Designation */}
            <div className="form-group">
              <label className="form-label">Designation / Role</label>
              <input
                type="text"
                list="designation-suggestions"
                className="form-input"
                placeholder="e.g. Professor & HOD, Assistant Professor"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
              <datalist id="designation-suggestions">
                {CBIT_DESIGNATIONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            {/* Department */}
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
                <option value="Other">Other / Custom Department</option>
              </select>

              {department === 'Other' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '6px' }}
                  placeholder="Enter custom department name"
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Batch Group */}
            <div className="form-group">
              <label className="form-label">
                Batch Group <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="facultyGroup"
                    value="Junior Batch Faculty"
                    checked={facultyGroup === 'Junior Batch Faculty'}
                    onChange={() => setFacultyGroup('Junior Batch Faculty')}
                  />
                  <span>Junior Batch Faculty</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="facultyGroup"
                    value="Our Batch Faculty"
                    checked={facultyGroup === 'Our Batch Faculty'}
                    onChange={() => setFacultyGroup('Our Batch Faculty')}
                  />
                  <span>Our Batch's Faculty</span>
                </label>
              </div>
            </div>

            {/* Initial Invitation Status */}
            <div className="form-group">
              <label className="form-label">Invitation Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as InvitationStatus)}
              >
                <option value="Not invited">Not invited (default - pending outreach)</option>
                <option value="Invited">Invited (already handed invitation card)</option>
                <option value="Confirmed">Confirmed (attending)</option>
                <option value="Unable to attend">Unable to attend</option>
              </select>
              <span className="form-hint">
                Only mark as invited if an organizer has already physically or formally contacted them.
              </span>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Logistics / Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. cabin in L-block 3rd floor, will meet after 2 PM class"
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
              {isSubmitting ? 'Saving...' : 'Add to Checklist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
