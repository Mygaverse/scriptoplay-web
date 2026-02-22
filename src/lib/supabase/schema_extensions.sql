
-- 5. WAITLIST REQUESTS (For public signups)
create table waitlist_requests (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  company text,
  role text,
  purpose text,
  message text,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamptz default now()
);

-- RLS for Waitlist
alter table waitlist_requests enable row level security;

-- Allow public to insert (INSERT only)
create policy "Public can submit waitlist requests."
  on waitlist_requests for insert
  with check ( true );

-- Only admins can view/update (Assuming admin role logic or service role)
-- For now, just disabling select for public is enough privacy.

-- 6. CONTACT MESSAGES
create table contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  message text,
  created_at timestamptz default now()
);

alter table contact_messages enable row level security;

-- Allow public insert
create policy "Public can submit contact messages."
  on contact_messages for insert
  with check ( true );
