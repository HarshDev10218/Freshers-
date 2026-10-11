export type FacultyGroup = 'Junior Batch Faculty' | 'Our Batch Faculty';

export type InvitationStatus = 'Not invited' | 'Invited' | 'Confirmed' | 'Unable to attend';

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  faculty_group: FacultyGroup;
  status: InvitationStatus;
  invited_by: string | null;
  invited_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  updated_by?: string | null;
}

export type SortField = 'name' | 'department' | 'designation' | 'faculty_group' | 'status' | 'invited_at' | 'updated_at';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  facultyGroup: 'all' | FacultyGroup;
  status: 'all' | InvitationStatus;
  department: string;
  needsInvitationOnly: boolean;
}

export type SyncState = 'connected' | 'connecting' | 'syncing' | 'offline' | 'unconfigured' | 'error';

export interface MongoConfig {
  mongoUri: string;
  dbName: string;
}

export interface OrganizerProfile {
  id: string;
  email: string;
  displayName: string;
}
