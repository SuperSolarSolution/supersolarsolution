-- Create Projects table
create table if not exists public.projects (
  project_id uuid default gen_random_uuid() primary key,
  corporate_id uuid references auth.users(id) not null,
  project_name text not null,
  location text not null,
  status text check (status in ('Proposed', 'Approved', 'Live', 'Inactive')) default 'Proposed',
  estimated_capacity_kw numeric,
  avg_power_consumption_kwh numeric,
  peak_load_kw numeric,
  area_available_sqft numeric,
  lease_duration_years integer,
  billing_model text check (billing_model in ('Fixed', 'Per Unit')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone,
  
  -- Additional fields for form data
  project_type text, -- 'Rooftop', 'Ground-mounted'
  land_ownership_type text, -- 'Owned', 'Leased'
  desired_solar_offset_percentage numeric,
  shadow_free_area boolean,
  roof_type text
);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- Create policies
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = corporate_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = corporate_id);

create policy "Admins can view all projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
