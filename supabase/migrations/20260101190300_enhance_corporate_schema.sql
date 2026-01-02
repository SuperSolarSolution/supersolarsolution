-- Enhance projects table with contract and asset status details
alter table public.projects 
add column if not exists lease_start_date date,
add column if not exists lease_end_date date,
add column if not exists ppa_start_date date,
add column if not exists ppa_end_date date,
add column if not exists ppa_rate numeric,
add column if not exists last_maintenance_date date,
add column if not exists next_maintenance_date date,
add column if not exists health_status text check (health_status in ('Good', 'Fair', 'Critical', 'Offline')) default 'Good';

-- Create Invoices table
create table if not exists public.invoices (
  invoice_id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(project_id) not null,
  month date not null,
  units_consumed numeric not null,
  rate numeric not null,
  amount numeric not null,
  status text check (status in ('Pending', 'Paid', 'Overdue')) default 'Pending',
  pdf_url text, -- URL to the invoice file in storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for invoices
alter table public.invoices enable row level security;

-- Policies for invoices
create policy "Users can view invoices for their projects"
  on public.invoices for select
  using (
    exists (
      select 1 from public.projects
      where project_id = public.invoices.project_id
      and corporate_id = auth.uid()
    )
  );

-- Admins can view all invoices
create policy "Admins can view all invoices"
  on public.invoices for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
