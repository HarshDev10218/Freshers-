import React from 'react';
import type { FacultyMember } from '../types';
import { Users, Clock, MailCheck, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface MetricsBarProps {
  faculty: FacultyMember[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ faculty }) => {
  const total = faculty.length;
  const notInvited = faculty.filter((f) => f.status === 'Not invited').length;
  const invited = faculty.filter((f) => f.status === 'Invited').length;
  const confirmed = faculty.filter((f) => f.status === 'Confirmed').length;
  const unable = faculty.filter((f) => f.status === 'Unable to attend').length;

  const juniorTotal = faculty.filter((f) => f.faculty_group === 'Junior Batch Faculty').length;
  const ourBatchTotal = faculty.filter((f) => f.faculty_group === 'Our Batch Faculty').length;

  // Invitations completed percentage = (Invited + Confirmed) / Total
  const completedCount = invited + confirmed;
  const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const confirmedPercentage = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">
            <span>Total Faculty</span>
            <Users size={13} color="var(--text-tertiary)" />
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{total}</span>
            <span className="metric-subtext">
              ({juniorTotal} Junior • {ourBatchTotal} Batch)
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <span>Not Invited</span>
            <Clock size={13} color="var(--text-secondary)" />
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--text-secondary)' }}>
              {notInvited}
            </span>
            <span className="metric-subtext">Pending action</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <span>Invited</span>
            <MailCheck size={13} color="#875104" />
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: '#875104' }}>
              {invited}
            </span>
            <span className="metric-subtext">Awaiting RSVP</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <span>Confirmed</span>
            <CheckCircle2 size={13} color="#1d5f34" />
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: '#1d5f34' }}>
              {confirmed}
            </span>
            <span className="metric-subtext">Attending event</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <span>Unable to Attend</span>
            <XCircle size={13} color="#8d202b" />
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: '#8d202b' }}>
              {unable}
            </span>
            <span className="metric-subtext">Regrets noted</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <span>Completed Outreach</span>
            <TrendingUp size={13} color="var(--maroon-primary)" />
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--maroon-primary)' }}>
              {completionPercentage}%
            </span>
            <span className="metric-subtext">
              {completedCount} of {total} contacted
            </span>
          </div>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-header">
          <span className="progress-header-title">
            <span>Outreach Completion Progress</span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
              ({confirmed} Confirmed, {invited} Invited, {notInvited} Pending)
            </span>
          </span>
          <span>
            <strong>{completionPercentage}%</strong> reached ({confirmedPercentage}% confirmed)
          </span>
        </div>
        <div className="progress-track" title={`${confirmed} confirmed, ${invited} invited, ${notInvited} pending`}>
          <div
            className="progress-segment-confirmed"
            style={{ width: `${total > 0 ? (confirmed / total) * 100 : 0}%` }}
            title={`Confirmed: ${confirmed}`}
          />
          <div
            className="progress-segment-invited"
            style={{ width: `${total > 0 ? (invited / total) * 100 : 0}%` }}
            title={`Invited: ${invited}`}
          />
        </div>
      </div>
    </div>
  );
};
