import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import type {
  FacultyMember,
  InvitationStatus,
  FilterState,
  SortField,
  SortDirection,
  SyncState,
  OrganizerProfile,
} from './types';
import {
  fetchAllFaculty,
  insertFacultyRecord,
  batchInsertFaculty,
  updateFacultyRecord,
  deleteFacultyRecord,
  fetchHealth,
  getStoredOrganizer,
  clearStoredOrganizer,
} from './lib/api';
import type { BackendHealth } from './lib/api';
import { realtimeSocket } from './lib/socket';
import type { SocketMessage } from './lib/socket';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { Toolbar } from './components/Toolbar';
import { FacultyTable } from './components/FacultyTable';
import { FacultyMobileList } from './components/FacultyMobileList';
import { AddFacultyModal } from './components/AddFacultyModal';
import { EditFacultyModal } from './components/EditFacultyModal';
import { CsvModal } from './components/CsvModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AuthModal } from './components/AuthModal';
import { MongoConfigModal } from './components/MongoConfigModal';
import { Database, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
  // Primary State
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // Health and Sync
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('connecting');

  // Active Organizer
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(getStoredOrganizer());

  // Filter State
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    facultyGroup: 'all',
    status: 'all',
    department: '',
    needsInvitationOnly: false,
  });

  // Sort State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FacultyMember | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<FacultyMember | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Initial Data Fetch
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    const [healthRes, facultyRes] = await Promise.all([fetchHealth(), fetchAllFaculty()]);

    if (healthRes.data) {
      setHealth(healthRes.data);
    }

    if (facultyRes.data) {
      setFaculty(facultyRes.data);
      setLoadError(null);
    } else if (facultyRes.error) {
      setLoadError(facultyRes.error);
    }

    if (isRefresh) setIsRefreshing(false);
    else setIsLoading(false);
  }, []);

  // Initialize Socket and Load Initial Data
  useEffect(() => {
    loadData();

    // Connect WebSocket
    realtimeSocket.connect();

    const unsubscribeStatus = realtimeSocket.onStatus((status) => {
      if (status === 'connected') {
        setSyncState('connected');
      } else if (status === 'connecting') {
        setSyncState('connecting');
      } else {
        setSyncState('offline');
      }
    });

    const unsubscribeMessage = realtimeSocket.onMessage((msg: SocketMessage) => {
      console.log('[Realtime Event Received]:', msg.type, msg.payload);

      switch (msg.type) {
        case 'FACULTY_INSERTED': {
          const newDoc = msg.payload as FacultyMember;
          setFaculty((prev) => {
            const exists = prev.some((f) => f.id === newDoc.id);
            if (exists) return prev;
            return [newDoc, ...prev];
          });
          break;
        }

        case 'FACULTY_UPDATED': {
          const updatedDoc = msg.payload as FacultyMember;
          setFaculty((prev) =>
            prev.map((f) => (f.id === updatedDoc.id ? { ...f, ...updatedDoc } : f))
          );
          break;
        }

        case 'FACULTY_DELETED': {
          const { id } = msg.payload;
          setFaculty((prev) => prev.filter((f) => f.id !== id));
          break;
        }

        case 'FACULTY_BATCH_INSERTED': {
          const newDocs = msg.payload as FacultyMember[];
          setFaculty((prev) => {
            const existingIds = new Set(prev.map((f) => f.id));
            const fresh = newDocs.filter((d) => !existingIds.has(d.id));
            return [...fresh, ...prev];
          });
          break;
        }

        case 'CONFIG_UPDATED':
        case 'INIT_STATUS': {
          fetchHealth().then((res) => {
            if (res.data) setHealth(res.data);
          });
          break;
        }
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
      realtimeSocket.disconnect();
    };
  }, [loadData]);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter Updates
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilter({
      searchQuery: '',
      facultyGroup: 'all',
      status: 'all',
      department: '',
      needsInvitationOnly: false,
    });
  };

  // Status Change Handler with Real-time Optimistic Sync
  const handleStatusChange = async (id: string, newStatus: InvitationStatus) => {
    const member = faculty.find((f) => f.id === id);
    if (!member || member.status === newStatus) return;

    const previousStatus = member.status;
    const previousInvitedBy = member.invited_by;
    const previousInvitedAt = member.invited_at;

    const now = new Date().toISOString();
    const isNowContacted = newStatus === 'Invited' || newStatus === 'Confirmed';

    const organizerTag = organizer?.displayName || 'Organizer';

    const updates: Partial<Omit<FacultyMember, 'id' | 'created_at'>> = {
      status: newStatus,
      updated_by: organizerTag,
    };

    if (isNowContacted) {
      updates.invited_at = member.invited_at || now;
      updates.invited_by = member.invited_by || organizerTag;
    } else if (newStatus === 'Not invited') {
      updates.invited_at = null;
      updates.invited_by = null;
    }

    // Optimistic Update
    setIsUpdatingId(id);
    setFaculty((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updated_at: now } : f))
    );

    const { error } = await updateFacultyRecord(id, updates);
    setIsUpdatingId(null);

    if (error) {
      console.error('Failed to update status:', error);
      alert(`Could not save status change: ${error}`);
      // Rollback
      setFaculty((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: previousStatus,
                invited_by: previousInvitedBy,
                invited_at: previousInvitedAt,
              }
            : f
        )
      );
    }
  };

  // Quick Note Save
  const handleQuickNoteSave = async (id: string, notes: string) => {
    const member = faculty.find((f) => f.id === id);
    if (!member) return;

    const previousNotes = member.notes;
    const now = new Date().toISOString();

    setFaculty((prev) =>
      prev.map((f) => (f.id === id ? { ...f, notes, updated_at: now } : f))
    );

    const { error } = await updateFacultyRecord(id, {
      notes,
      updated_by: organizer?.displayName || null,
    });

    if (error) {
      alert(`Could not save note: ${error}`);
      setFaculty((prev) =>
        prev.map((f) => (f.id === id ? { ...f, notes: previousNotes } : f))
      );
    }
  };

  // Add Faculty
  const handleAddFaculty = async (
    newRecord: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    const { data, error } = await insertFacultyRecord(newRecord);
    if (error) {
      alert(`Failed to add faculty: ${error}`);
      return false;
    }
    if (data) {
      setFaculty((prev) => [data, ...prev]);
    }
    return true;
  };

  // Batch Import
  const handleBatchImport = async (
    records: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<number> => {
    const { count, error } = await batchInsertFaculty(records);
    if (error) {
      alert(`Failed to import records: ${error}`);
      return 0;
    }
    // Refresh list from server
    await loadData(true);
    return count;
  };

  // Save Edited Faculty
  const handleSaveEditedFaculty = async (
    id: string,
    updates: Partial<Omit<FacultyMember, 'id' | 'created_at'>>
  ): Promise<boolean> => {
    const { data, error } = await updateFacultyRecord(id, updates);
    if (error) {
      alert(`Failed to update faculty: ${error}`);
      return false;
    }
    if (data) {
      setFaculty((prev) => prev.map((f) => (f.id === id ? data : f)));
    }
    return true;
  };

  // Delete Faculty
  const handleConfirmDelete = async (id: string): Promise<boolean> => {
    const { success, error } = await deleteFacultyRecord(id);
    if (error) {
      alert(`Failed to delete record: ${error}`);
      return false;
    }
    if (success) {
      setFaculty((prev) => prev.filter((f) => f.id !== id));
    }
    return true;
  };

  // Export CSV
  const handleExportCsv = () => {
    if (faculty.length === 0) return;

    const dataToExport = filteredFaculty.map((f, idx) => ({
      'S.No': idx + 1,
      Name: f.name,
      Designation: f.designation || '',
      Department: f.department,
      'Batch Group': f.faculty_group,
      'Invitation Status': f.status,
      'Invited By': f.invited_by || '',
      'Date/Time Invited': f.invited_at ? new Date(f.invited_at).toLocaleString('en-IN') : '',
      'Notes & Logistics': f.notes || '',
      'Last Updated': f.updated_at ? new Date(f.updated_at).toLocaleString('en-IN') : '',
    }));

    const csvString = Papa.unparse(dataToExport);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `cbit_freshers_faculty_invitations_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered and Sorted Faculty List
  const filteredFaculty = useMemo(() => {
    return faculty
      .filter((member) => {
        // Search Query
        if (filter.searchQuery.trim()) {
          const query = filter.searchQuery.toLowerCase();
          const matchName = member.name.toLowerCase().includes(query);
          const matchDept = member.department.toLowerCase().includes(query);
          const matchDesig = (member.designation || '').toLowerCase().includes(query);
          const matchNotes = (member.notes || '').toLowerCase().includes(query);
          const matchInvitedBy = (member.invited_by || '').toLowerCase().includes(query);
          if (!matchName && !matchDept && !matchDesig && !matchNotes && !matchInvitedBy) {
            return false;
          }
        }

        // Group Filter
        if (filter.facultyGroup !== 'all' && member.faculty_group !== filter.facultyGroup) {
          return false;
        }

        // Needs Invitation Quick Filter
        if (filter.needsInvitationOnly) {
          if (member.status !== 'Not invited') return false;
        } else if (filter.status !== 'all' && member.status !== filter.status) {
          return false;
        }

        // Department Filter
        if (filter.department && member.department !== filter.department) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortField) {
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'department':
            valA = a.department.toLowerCase();
            valB = b.department.toLowerCase();
            break;
          case 'designation':
            valA = (a.designation || '').toLowerCase();
            valB = (b.designation || '').toLowerCase();
            break;
          case 'faculty_group':
            valA = a.faculty_group;
            valB = b.faculty_group;
            break;
          case 'status':
            valA = a.status;
            valB = b.status;
            break;
          case 'invited_at':
            valA = a.invited_at ? new Date(a.invited_at).getTime() : 0;
            valB = b.invited_at ? new Date(b.invited_at).getTime() : 0;
            break;
          case 'updated_at':
            valA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            valB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            break;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [faculty, filter, sortField, sortDirection]);

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        syncState={syncState}
        health={health}
        organizer={organizer}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={() => {
          clearStoredOrganizer();
          setOrganizer(null);
        }}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onManualRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Database Notice if MongoDB Not Connected */}
      {!health?.isMongoConnected && !isLoading && (
        <div
          className="alert-box warning"
          style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={16} />
            <div>
              <strong>MongoDB Not Connected:</strong> Running in local file storage mode. Your updates persist locally, but to share in real time across other organizers' phones and laptops, connect your MongoDB Atlas URI.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsConfigModalOpen(true)}
          >
            Connect MongoDB
          </button>
        </div>
      )}

      {/* Load Error Alert if Any */}
      {loadError && (
        <div className="alert-box danger" style={{ marginBottom: '16px' }}>
          <AlertTriangle size={16} />
          <span>Error loading faculty records: {loadError}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <MetricsBar faculty={faculty} />

      {/* Filter and Action Toolbar */}
      <Toolbar
        filter={filter}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onExportCsv={handleExportCsv}
        totalFilteredCount={filteredFaculty.length}
        totalCount={faculty.length}
      />

      {/* Main Faculty Table (Laptops and Tablets) */}
      <FacultyTable
        faculty={filteredFaculty}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onStatusChange={handleStatusChange}
        onEdit={(member) => {
          setEditingMember(member);
          setIsEditModalOpen(true);
        }}
        onDelete={(member) => {
          setDeletingMember(member);
          setIsDeleteModalOpen(true);
        }}
        onQuickNoteSave={handleQuickNoteSave}
        isUpdatingId={isUpdatingId}
      />

      {/* Mobile Card List (Phones walking around campus) */}
      <FacultyMobileList
        faculty={filteredFaculty}
        onStatusChange={handleStatusChange}
        onEdit={(member) => {
          setEditingMember(member);
          setIsEditModalOpen(true);
        }}
        onDelete={(member) => {
          setDeletingMember(member);
          setIsDeleteModalOpen(true);
        }}
        isUpdatingId={isUpdatingId}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div>
          CBIT Freshers' Day 2026 • Organizing Committee Coordination Ledger • Gandipet, Hyderabad
        </div>
        <div>
          Live Sync via WebSocket &amp; MongoDB • Auto-refreshes on peer updates
        </div>
      </footer>

      {/* Modals */}
      <AddFacultyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddFaculty}
        existingFaculty={faculty}
        currentOrganizerName={organizer?.displayName || ''}
      />

      <EditFacultyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onSave={handleSaveEditedFaculty}
        currentOrganizerName={organizer?.displayName || ''}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingMember(null);
        }}
        member={deletingMember}
        onConfirm={handleConfirmDelete}
      />

      <CsvModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onBatchImport={handleBatchImport}
        existingFaculty={faculty}
        currentOrganizerName={organizer?.displayName || ''}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        organizer={organizer}
        onAuthSuccess={(profile) => setOrganizer(profile)}
      />

      <MongoConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        health={health}
        onConfigUpdated={() => loadData(true)}
      />
    </div>
  );
};

export default App;
