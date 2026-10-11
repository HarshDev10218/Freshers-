-- ==============================================================================
-- CBIT FRESHERS' DAY 2026 - FACULTY INVITATION TRACKER
-- Database Schema, Indexes, RLS Security Policies & Realtime Broadcast Setup
-- Run this in your Supabase project's SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Create the Faculty Invitations Table
create table if not exists public.faculty_invitations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    designation text,
    department text not null,
    faculty_group text not null check (faculty_group in ('Junior Batch Faculty', 'Our Batch Faculty')),
    status text not null default 'Not invited' check (status in ('Not invited', 'Invited', 'Confirmed', 'Unable to attend')),
    invited_by text,
    invited_at timestamptz,
    notes text default '',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    updated_by text
);

-- 2. Performance Indexes for Filter & Search queries
create index if not exists idx_faculty_invitations_group on public.faculty_invitations(faculty_group);
create index if not exists idx_faculty_invitations_status on public.faculty_invitations(status);
create index if not exists idx_faculty_invitations_department on public.faculty_invitations(department);
create index if not exists idx_faculty_invitations_name on public.faculty_invitations(name);

-- 3. Automatic updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_faculty_updated_at on public.faculty_invitations;
create trigger set_faculty_updated_at
before update on public.faculty_invitations
for each row
execute function public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.faculty_invitations enable row level security;

-- 5. Row Level Security Policies
-- By default in production, only authenticated organizers can view and edit records.
-- Drop any existing policies to avoid conflicts on re-running
drop policy if exists "Organizers can view faculty invitations" on public.faculty_invitations;
drop policy if exists "Organizers can insert faculty invitations" on public.faculty_invitations;
drop policy if exists "Organizers can update faculty invitations" on public.faculty_invitations;
drop policy if exists "Organizers can delete faculty invitations" on public.faculty_invitations;

-- Policy 1: Authenticated organizers can read all records
create policy "Organizers can view faculty invitations"
on public.faculty_invitations
for select
to authenticated
using (true);

-- Policy 2: Authenticated organizers can insert new records
create policy "Organizers can insert faculty invitations"
on public.faculty_invitations
for insert
to authenticated
with check (true);

-- Policy 3: Authenticated organizers can update records
create policy "Organizers can update faculty invitations"
on public.faculty_invitations
for update
to authenticated
using (true)
with check (true);

-- Policy 4: Authenticated organizers can delete records
create policy "Organizers can delete faculty invitations"
on public.faculty_invitations
for delete
to authenticated
using (true);

-- OPTIONAL EMERGENCY OVERRIDE (For fast testing before team accounts are created):
-- If you need unauthenticated access temporarily during initial setup, uncomment the following:
/*
create policy "Public demo access"
on public.faculty_invitations
for all
using (true)
with check (true);
*/

-- 6. Enable Realtime Publications
-- This allows Supabase Realtime to broadcast INSERT, UPDATE, DELETE events to all connected clients!
alter publication supabase_realtime add table public.faculty_invitations;
