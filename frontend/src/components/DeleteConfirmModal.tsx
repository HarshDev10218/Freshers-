import React, { useState } from 'react';
import type { FacultyMember } from '../types';
import { Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FacultyMember | null;
  onConfirm: (id: string) => Promise<boolean>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  member,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !member) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    const success = await onConfirm(member.id);
    setIsDeleting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={16} color="#8d202b" />
            <h3 className="modal-title" style={{ fontSize: '16px' }}>
              Confirm Record Deletion
            </h3>
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
          <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            Are you sure you want to permanently delete the invitation record for:
          </p>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
            }}
          >
            <div style={{ fontWeight: 600 }}>{member.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {member.department} • {member.faculty_group}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Current Status: <strong>{member.status}</strong>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            This change will immediately sync across all organizers' devices.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
};
