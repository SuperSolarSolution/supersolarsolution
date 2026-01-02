-- Add project_id to nbfc_funding
ALTER TABLE public.nbfc_funding ADD COLUMN project_id UUID REFERENCES public.projects(project_id) ON DELETE CASCADE;

-- Make asset_id nullable since funding might start at project stage
ALTER TABLE public.nbfc_funding ALTER COLUMN asset_id DROP NOT NULL;

-- Policies for NBFCs to view projects
-- specific policy to allow NBFC role to view all projects that are 'Approved' (ready for funding)
CREATE POLICY "NBFCs can view approved projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    status = 'Approved' 
    AND public.has_role(auth.uid(), 'nbfc')
  );

-- Update nbfc_funding policies if needed
-- Existing: "NBFCs can view own funding" (nbfc_id = auth.uid()) - OK
-- Existing: "NBFCs can create funding" (nbfc_id = auth.uid() AND has_role('nbfc')) - OK
