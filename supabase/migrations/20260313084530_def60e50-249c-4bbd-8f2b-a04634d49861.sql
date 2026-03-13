
-- Create SIP status enum
CREATE TYPE public.sip_status AS ENUM ('active', 'paused', 'completed', 'cancelled');

-- Create sip_plans table
CREATE TABLE public.sip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.solar_assets(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  sip_date INTEGER NOT NULL CHECK (sip_date >= 1 AND sip_date <= 28),
  status public.sip_status NOT NULL DEFAULT 'active',
  next_execution_date DATE NOT NULL,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  executions_count INTEGER NOT NULL DEFAULT 0,
  max_executions INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sip_executions table
CREATE TABLE public.sip_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sip_id UUID NOT NULL REFERENCES public.sip_plans(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  failure_reason TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sip_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies for sip_plans
CREATE POLICY "Investors can view own SIPs"
  ON public.sip_plans FOR SELECT TO authenticated
  USING (investor_id = auth.uid());

CREATE POLICY "Investors can create own SIPs"
  ON public.sip_plans FOR INSERT TO authenticated
  WITH CHECK (investor_id = auth.uid() AND has_role(auth.uid(), 'investor'::app_role));

CREATE POLICY "Investors can update own SIPs"
  ON public.sip_plans FOR UPDATE TO authenticated
  USING (investor_id = auth.uid());

CREATE POLICY "Admins can view all SIPs"
  ON public.sip_plans FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for sip_executions
CREATE POLICY "Investors can view own SIP executions"
  ON public.sip_executions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sip_plans WHERE sip_plans.id = sip_executions.sip_id AND sip_plans.investor_id = auth.uid()
  ));

CREATE POLICY "Admins can view all SIP executions"
  ON public.sip_executions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role needs insert on sip_executions (edge function uses service role)
CREATE POLICY "Service can insert SIP executions"
  ON public.sip_executions FOR INSERT TO authenticated
  WITH CHECK (true);

-- Trigger for updated_at on sip_plans
CREATE TRIGGER update_sip_plans_updated_at
  BEFORE UPDATE ON public.sip_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
