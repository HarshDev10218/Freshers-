import React, { useState } from 'react';
import { saveStoredOrganizer } from '../lib/api';
import type { OrganizerProfile } from '../types';
import { X, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizer: OrganizerProfile | null;
  onAuthSuccess: (profile: OrganizerProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  organizer,
  onAuthSuccess,
}) => {
  const [displayName, setDisplayName] = useState(organizer?.displayName || '');
  const [email, setEmail] = useState(organizer?.email || '');
  const [committeeRole, setCommitteeRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please provide your name or committee role.');
      return;
    }

    const fullTag = committeeRole.trim()
      ? `${displayName.trim()} (${committeeRole.trim()})`
      : displayName.trim();

    saveStoredOrganizer({ displayName: fullTag, email: email.trim() });

    const newProfile: OrganizerProfile = {
      id: email.trim() || fullTag,
      email: email.trim(),
      displayName: fullTag,
    };

    onAuthSuccess(newProfile);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--maroon-primary)" />
            <h3 className="modal-title">Organizer Identification</h3>
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
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Identify yourself so fellow organizers know who contacted or confirmed each faculty member in the live MongoDB ledger.
            </p>

            <div className="form-group">
              <label className="form-label">
                Organizer Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Harshith, Sravan, Vikram"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / Committee Role</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ECE Core, Stage & Hospitality, CSE 3rd Year"
                value={committeeRole}
                onChange={(e) => setCommitteeRole(e.target.value)}
              />
              <span className="form-hint">Appears in the "Invited By" audit column on each record.</span>
            </div>

            <div className="form-group">
              <label className="form-label">CBIT College Email (Optional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="organizer@cbit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="alert-box danger">
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Set Active Organizer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
