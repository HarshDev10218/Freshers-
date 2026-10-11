import type { FacultyMember, OrganizerProfile } from '../types';

const STORAGE_KEY_ORGANIZER_NAME = 'cbit_organizer_name';
const STORAGE_KEY_ORGANIZER_EMAIL = 'cbit_organizer_email';

export function getStoredOrganizer(): OrganizerProfile | null {
  if (typeof window === 'undefined') return null;
  const name = localStorage.getItem(STORAGE_KEY_ORGANIZER_NAME);
  const email = localStorage.getItem(STORAGE_KEY_ORGANIZER_EMAIL);
  if (name || email) {
    return {
      id: email || name || 'organizer_1',
      email: email || '',
      displayName: name || (email ? email.split('@')[0] : 'Organizer'),
    };
  }
  return null;
}

export function saveStoredOrganizer(profile: { displayName: string; email?: string }): void {
  if (typeof window === 'undefined') return;
  if (profile.displayName) localStorage.setItem(STORAGE_KEY_ORGANIZER_NAME, profile.displayName.trim());
  if (profile.email) localStorage.setItem(STORAGE_KEY_ORGANIZER_EMAIL, profile.email.trim());
}

export function clearStoredOrganizer(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_ORGANIZER_NAME);
  localStorage.removeItem(STORAGE_KEY_ORGANIZER_EMAIL);
}

export interface BackendHealth {
  status: string;
  isMongoConnected: boolean;
  mongoError: string | null;
  mongoUriConfigured: boolean;
  activeClients: number;
  recordCount: number;
}

const API_BASE = (import.meta.env.VITE_API_URL?.trim() || '').replace(/\/$/, '');

/**
 * Check backend and MongoDB connection status
 */
export async function fetchHealth(): Promise<{ data: BackendHealth | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) {
      return { data: null, error: `Server responded with ${res.status}` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Cannot reach backend server' };
  }
}

/**
 * Fetch all faculty records from MongoDB / Backend
 */
export async function fetchAllFaculty(): Promise<{ data: FacultyMember[] | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/faculty`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { data: null, error: errJson.error || `HTTP error ${res.status}` };
    }
    const data = await res.json();
    return { data: data as FacultyMember[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch faculty records' };
  }
}

/**
 * Insert a single faculty member
 */
export async function insertFacultyRecord(
  record: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: FacultyMember | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { data: null, error: errJson.error || `HTTP error ${res.status}` };
    }

    const data = await res.json();
    return { data: data as FacultyMember, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to insert record' };
  }
}

/**
 * Batch insert faculty members (from CSV import)
 */
export async function batchInsertFaculty(
  records: Omit<FacultyMember, 'id' | 'created_at' | 'updated_at'>[]
): Promise<{ count: number; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/faculty/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { count: 0, error: errJson.error || `HTTP error ${res.status}` };
    }

    const data = await res.json();
    return { count: data.count || 0, error: null };
  } catch (err: any) {
    return { count: 0, error: err.message || 'Failed to batch insert records' };
  }
}

/**
 * Update an existing faculty member
 */
export async function updateFacultyRecord(
  id: string,
  updates: Partial<Omit<FacultyMember, 'id' | 'created_at'>>
): Promise<{ data: FacultyMember | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/faculty/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { data: null, error: errJson.error || `HTTP error ${res.status}` };
    }

    const data = await res.json();
    return { data: data as FacultyMember, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to update record' };
  }
}

/**
 * Delete a faculty member
 */
export async function deleteFacultyRecord(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/faculty/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson.error || `HTTP error ${res.status}` };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete record' };
  }
}

/**
 * Update MongoDB URI on backend
 */
export async function updateMongoUri(uri: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/config/mongo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Connection failed' };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}
