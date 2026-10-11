import React, { useState } from 'react';
import { updateMongoUri } from '../lib/api';
import type { BackendHealth } from '../lib/api';
import { X, Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface MongoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: BackendHealth | null;
  onConfigUpdated: () => void;
}

export const MongoConfigModal: React.FC<MongoConfigModalProps> = ({
  isOpen,
  onClose,
  health,
  onConfigUpdated,
}) => {
  const [mongoUri, setMongoUri] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid MongoDB connection string.' });
      return;
    }

    setIsSubmitting(true);
    setTestResult(null);

    const result = await updateMongoUri(mongoUri.trim());
    setIsSubmitting(false);

    if (result.success) {
      setTestResult({
        success: true,
        message: 'Successfully connected to MongoDB! Real-time synchronization is live across all organizers.',
      });
      onConfigUpdated();
    } else {
      setTestResult({
        success: false,
        message: result.error || 'Failed to connect to MongoDB with provided URI.',
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="var(--maroon-primary)" />
            <h3 className="modal-title">MongoDB Connection & Backend Configuration</h3>
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
          {/* Current Status Box */}
          <div
            className={`alert-box ${
              health?.isMongoConnected ? 'success' : health?.mongoUriConfigured ? 'warning' : 'info'
            }`}
          >
            {health?.isMongoConnected ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            <div>
              <div style={{ fontWeight: 600 }}>
                {health?.isMongoConnected
                  ? 'MongoDB Database is Connected & Live'
                  : 'MongoDB is Not Connected (Active: Local Resilient Storage)'}
              </div>
              <div style={{ fontSize: '11px', marginTop: '2px' }}>
                {health?.isMongoConnected
                  ? `All ${health.recordCount} records are committed to MongoDB. Real-time updates broadcast to ${health.activeClients} connected organizer devices.`
                  : health?.mongoError
                  ? `Connection error: ${health.mongoError}`
                  : 'The backend is storing changes in local resilient file storage. To synchronize across multiple laptops and phones, connect your MongoDB Atlas cluster URI below.'}
              </div>
            </div>
          </div>

          {/* Form to connect MongoDB */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                MongoDB Connection String (URI) <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/cbit_freshers?retryWrites=true&w=majority"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                autoFocus
              />
              <span className="form-hint">
                Supports MongoDB Atlas (cloud cluster) or local MongoDB (<code>mongodb://127.0.0.1:27017/cbit_freshers</code>).
              </span>
            </div>

            {testResult && (
              <div className={`alert-box ${testResult.success ? 'success' : 'danger'}`} style={{ marginTop: '10px' }}>
                {testResult.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                <RefreshCw size={12} className={isSubmitting ? 'animate-spin' : ''} />
                <span>{isSubmitting ? 'Connecting...' : 'Connect to MongoDB'}</span>
              </button>
            </div>
          </form>

          {/* Step-by-step Setup Guide */}
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', marginBottom: '8px', color: 'var(--text-primary)' }}>
              How to get a Free MongoDB Atlas URI (2-minute setup for the event):
            </h4>
            <ol style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
              <li>
                Visit <strong>cloud.mongodb.com</strong> and create a free account (or log in).
              </li>
              <li>
                Deploy a free <strong>M0 Shared Cluster</strong> (100% free forever, no card required).
              </li>
              <li>
                In <strong>Database Access</strong>: Create a database user (e.g. username: <code>cbit_lead</code>, set a password).
              </li>
              <li>
                In <strong>Network Access</strong>: Click <strong>Add IP Address</strong> and select <strong>Allow Access from Anywhere (0.0.0.0/0)</strong> so your phone and fellow organizers can connect.
              </li>
              <li>
                Click <strong>Connect</strong> &gt; <strong>Drivers (Node.js)</strong> &gt; Copy your connection string.
              </li>
              <li>
                Replace <code>&lt;password&gt;</code> with your password, and paste it in the box above or into your <code>.env</code> file as <code>MONGODB_URI=...</code>.
              </li>
            </ol>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
