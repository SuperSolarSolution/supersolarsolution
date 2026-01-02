-- Allow Admins to update projects
create policy "Admins can update all projects"
  on public.projects for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow Admins to update solar_assets
create policy "Admins can update all solar_assets"
  on public.solar_assets for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
