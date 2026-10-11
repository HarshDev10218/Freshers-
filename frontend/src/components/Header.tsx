import React from 'react';
import type { SyncState, OrganizerProfile } from '../types';
import { RefreshCw, Database, User, LogOut } from 'lucide-react';
import type { BackendHealth } from '../lib/api';

interface HeaderProps {
  syncState: SyncState;
  health: BackendHealth | null;
  organizer: OrganizerProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenConfig: () => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  syncState,
  health,
  organizer,
  onOpenAuth,
  onSignOut,
  onOpenConfig,
  onManualRefresh,
  isRefreshing,
}) => {
  const getSyncBadge = () => {
    if (syncState === 'offline') {
      return {
        className: 'offline',
        label: 'Offline (Server Disconnected)',
        title: 'Backend server is unreachable.',
      };
    }

    if (syncState === 'syncing') {
      return {
        className: 'syncing',
        label: 'Syncing Changes...',
        title: 'Committing update to database...',
      };
    }

    if (health?.isMongoConnected) {
      return {
        className: 'connected',
        label: `Live Synced (MongoDB Atlas • ${health.activeClients} active)`,
        title: `Connected to MongoDB database. Real-time updates active across ${health.activeClients} connected organizer screens.`,
      };
    }

    return {
      className: 'syncing',
      label: 'Local Mode (Click to connect MongoDB)',
      title: 'Backend running in resilient local storage mode. Connect MongoDB Atlas to share real-time across devices.',
    };
  };

  const badge = getSyncBadge();

  return (
    <header className="masthead">
      <div className="masthead-top">
        <div>
          <div className="college-crest-row">
            <span className="college-pill">CBIT Hyderabad</span>
            <span className="masthead-meta">Chaitanya Bharathi Institute of Technology • Gandipet</span>
          </div>
          <h1 className="masthead-title">Faculty Invitation Tracker</h1>
          <div className="masthead-subtitle">
            <span><strong>Event:</strong> CBIT Freshers' Day</span>
            <span>•</span>
            <span><strong>Date:</strong> Monday, 12 October 2026</span>
            <span>•</span>
            <span
              className="sync-badge"
              style={{ cursor: 'pointer' }}
              onClick={onOpenConfig}
              title={badge.title}
            >
              <span className={`sync-dot ${badge.className}`}></span>
              <span>{badge.label}</span>
            </span>
          </div>
        </div>

        <div className="masthead-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            title="Refresh records from MongoDB"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${health?.isMongoConnected ? 'btn-secondary' : 'btn-primary'}`}
            onClick={onOpenConfig}
            title="Configure MongoDB Atlas Connection"
          >
            <Database size={12} />
            <span>{health?.isMongoConnected ? 'MongoDB (Connected)' : 'Connect MongoDB'}</span>
          </button>

          {organizer ? (
            <div className="user-badge">
              <User size={13} color="var(--maroon-primary)" />
              <span title={organizer.email || organizer.displayName}>
                <strong>{organizer.displayName || organizer.email.split('@')[0]}</strong>
              </span>
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out or switch organizer profile"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px' }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenAuth}
            >
              <User size={12} />
              <span>Organizer Profile</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
