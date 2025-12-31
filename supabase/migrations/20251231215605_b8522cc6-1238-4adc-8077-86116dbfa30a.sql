-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('investor', 'corporate', 'nbfc', 'implementer', 'admin');

-- Create enum for KYC status
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for asset status
CREATE TYPE public.asset_status AS ENUM ('planning', 'under_construction', 'operational', 'maintenance');

-- Create enum for risk score
CREATE TYPE public.risk_score AS ENUM ('low', 'medium', 'high');

-- Create enum for investment status
CREATE TYPE public.investment_status AS ENUM ('committed', 'deployed', 'returned');

-- Create enum for funding status
CREATE TYPE public.funding_status AS ENUM ('sanctioned', 'partially_disbursed', 'fully_disbursed', 'closed');

-- Create enum for milestone status
CREATE TYPE public.milestone_status AS ENUM ('pending', 'completed', 'delayed');

-- Create enum for transaction type
CREATE TYPE public.transaction_type AS ENUM ('investment', 'return', 'disbursement', 'billing');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create solar_assets table
CREATE TABLE public.solar_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity_kw NUMERIC NOT NULL,
  status asset_status NOT NULL DEFAULT 'planning',
  installation_date DATE,
  expected_life_years INTEGER NOT NULL DEFAULT 25,
  annual_degradation NUMERIC NOT NULL DEFAULT 0.5,
  corporate_id UUID REFERENCES auth.users(id),
  implementer_id UUID REFERENCES auth.users(id),
  total_investment NUMERIC NOT NULL DEFAULT 0,
  funded_amount NUMERIC NOT NULL DEFAULT 0,
  expected_irr NUMERIC NOT NULL DEFAULT 12,
  risk_score risk_score NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create investments table
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.solar_assets(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  status investment_status NOT NULL DEFAULT 'committed',
  expected_returns NUMERIC NOT NULL DEFAULT 0,
  actual_returns NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  maturity_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create nbfc_funding table
CREATE TABLE public.nbfc_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.solar_assets(id) ON DELETE CASCADE NOT NULL,
  nbfc_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sanctioned_amount NUMERIC NOT NULL,
  disbursed_amount NUMERIC NOT NULL DEFAULT 0,
  status funding_status NOT NULL DEFAULT 'sanctioned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create funding_milestones table
CREATE TABLE public.funding_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_id UUID REFERENCES public.nbfc_funding(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_date DATE NOT NULL,
  completed_date DATE,
  disbursement_amount NUMERIC NOT NULL,
  status milestone_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create energy_generation table
CREATE TABLE public.energy_generation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.solar_assets(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  generated_kwh NUMERIC NOT NULL DEFAULT 0,
  consumed_kwh NUMERIC NOT NULL DEFAULT 0,
  exported_kwh NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  from_entity TEXT NOT NULL,
  to_entity TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status transaction_status NOT NULL DEFAULT 'pending',
  reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nbfc_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own role on signup"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Solar assets policies
CREATE POLICY "Anyone authenticated can view solar assets"
ON public.solar_assets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage solar assets"
ON public.solar_assets FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Implementers can update assigned assets"
ON public.solar_assets FOR UPDATE
TO authenticated
USING (implementer_id = auth.uid());

-- Investments policies
CREATE POLICY "Investors can view own investments"
ON public.investments FOR SELECT
TO authenticated
USING (investor_id = auth.uid());

CREATE POLICY "Investors can create investments"
ON public.investments FOR INSERT
TO authenticated
WITH CHECK (investor_id = auth.uid() AND public.has_role(auth.uid(), 'investor'));

CREATE POLICY "Admins can view all investments"
ON public.investments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- NBFC funding policies
CREATE POLICY "NBFCs can view own funding"
ON public.nbfc_funding FOR SELECT
TO authenticated
USING (nbfc_id = auth.uid());

CREATE POLICY "NBFCs can create funding"
ON public.nbfc_funding FOR INSERT
TO authenticated
WITH CHECK (nbfc_id = auth.uid() AND public.has_role(auth.uid(), 'nbfc'));

CREATE POLICY "Admins can view all funding"
ON public.nbfc_funding FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Funding milestones policies
CREATE POLICY "Users can view milestones for their funding"
ON public.funding_milestones FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.nbfc_funding
    WHERE id = funding_id AND nbfc_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage milestones"
ON public.funding_milestones FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Energy generation policies
CREATE POLICY "Authenticated users can view energy data"
ON public.energy_generation FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Implementers can insert energy data"
ON public.energy_generation FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.solar_assets
    WHERE id = asset_id AND implementer_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage energy data"
ON public.energy_generation FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Transactions policies
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Audit logs policies
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solar_assets_updated_at
  BEFORE UPDATE ON public.solar_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nbfc_funding_updated_at
  BEFORE UPDATE ON public.nbfc_funding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();