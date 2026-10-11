import React from 'react';
import type { FilterState } from '../types';
import { CBIT_DEPARTMENTS } from '../data/cbitDirectory';
import { Search, Plus, Upload, Download, X } from 'lucide-react';

interface ToolbarProps {
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onOpenAddModal: () => void;
  onOpenCsvModal: () => void;
  onExportCsv: () => void;
  totalFilteredCount: number;
  totalCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  filter,
  onFilterChange,
  onResetFilters,
  onOpenAddModal,
  onOpenCsvModal,
  onExportCsv,
  totalFilteredCount,
  totalCount,
}) => {
  const hasActiveFilters =
    Boolean(filter.searchQuery) ||
    filter.facultyGroup !== 'all' ||
    filter.status !== 'all' ||
    Boolean(filter.department) ||
    filter.needsInvitationOnly;

  return (
    <div className="toolbar">
      <div className="toolbar-primary">
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            className="search-input"
            placeholder="Search faculty name, department, or notes..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          />
          {filter.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
              }}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddModal}
            title="Add a single faculty member record"
          >
            <Plus size={13} />
            <span>Add Faculty</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenCsvModal}
            title="Import faculty records from CSV file"
          >
            <Upload size={13} />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onExportCsv}
            title="Export faculty checklist to CSV"
            disabled={totalCount === 0}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="filter-row">
        <span className="filter-label">Group:</span>
        <button
          type="button"
          className={`filter-pill ${filter.facultyGroup === 'all' && !filter.needsInvitationOnly ? 'active' : ''}`}
          onClick={() => onFilterChange({ facultyGroup: 'all' })}
        >
          All Faculty
        </button>
        <button
          type="button"
          className={`filter-pill ${filter.facultyGroup === 'Junior Batch Faculty' ? 'active' : ''}`}
          onClick={() => onFilterChange({ facultyGroup: 'Junior Batch Faculty' })}
        >
          Junior Batch Faculty
        </button>
        <button
          type="button"
          className={`filter-pill ${filter.facultyGroup === 'Our Batch Faculty' ? 'active' : ''}`}
          onClick={() => onFilterChange({ facultyGroup: 'Our Batch Faculty' })}
        >
          Our Batch Faculty
        </button>

        <span style={{ margin: '0 4px', color: 'var(--border-strong)' }}>|</span>

        <span className="filter-label">Status:</span>
        <button
          type="button"
          className={`filter-pill ${filter.needsInvitationOnly ? 'urgent-active' : ''}`}
          onClick={() =>
            onFilterChange({
              needsInvitationOnly: !filter.needsInvitationOnly,
              status: !filter.needsInvitationOnly ? 'Not invited' : 'all',
            })
          }
          title="Fast shortcut to show only faculty still needing invitations"
        >
          🚨 Needs Invitation ({filter.needsInvitationOnly ? 'Active' : 'Show'})
        </button>
        <button
          type="button"
          className={`filter-pill ${filter.status === 'all' && !filter.needsInvitationOnly ? 'active' : ''}`}
          onClick={() => onFilterChange({ status: 'all', needsInvitationOnly: false })}
        >
          All Statuses
        </button>
        <button
          type="button"
          className={`filter-pill ${filter.status === 'Invited' ? 'active' : ''}`}
          onClick={() => onFilterChange({ status: 'Invited', needsInvitationOnly: false })}
        >
          Invited
        </button>
        <button
          type="button"
          className={`filter-pill ${filter.status === 'Confirmed' ? 'active' : ''}`}
          onClick={() => onFilterChange({ status: 'Confirmed', needsInvitationOnly: false })}
        >
          Confirmed
        </button>
        <button
          type="button"
          className={`filter-pill ${filter.status === 'Unable to attend' ? 'active' : ''}`}
          onClick={() => onFilterChange({ status: 'Unable to attend', needsInvitationOnly: false })}
        >
          Unable to Attend
        </button>

        <span style={{ margin: '0 4px', color: 'var(--border-strong)' }}>|</span>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span className="filter-label">Department:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '3px 8px', fontSize: '11px', height: '26px' }}
            value={filter.department}
            onChange={(e) => onFilterChange({ department: e.target.value })}
          >
            <option value="">All Departments</option>
            {CBIT_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            style={{ marginLeft: 'auto', fontSize: '11px' }}
            title="Reset all filters"
          >
            <X size={11} />
            <span>Reset Filters ({totalFilteredCount}/{totalCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
