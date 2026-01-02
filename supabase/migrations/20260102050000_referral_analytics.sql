-- Backfill missing referral codes
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    UPDATE public.profiles
    SET referral_code = public.generate_unique_referral_code()
    WHERE id = r.id;
  END LOOP;
END $$;

-- Create referral_analytics table
CREATE TABLE IF NOT EXISTS public.referral_analytics (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  referral_code TEXT,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
ON public.referral_analytics FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Function to maintain analytics
CREATE OR REPLACE FUNCTION public.maintain_referral_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On Profile Create/Update (specifically for referral_code)
  IF TG_TABLE_NAME = 'profiles' THEN
    INSERT INTO public.referral_analytics (id, email, referral_code)
    VALUES (NEW.id, NEW.email, NEW.referral_code)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        referral_code = EXCLUDED.referral_code;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Trigger for Profile changes (New User or Code Update)
CREATE TRIGGER on_profile_analytics_update
  AFTER INSERT OR UPDATE OF referral_code, email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_referral_analytics();

-- Initial hydration of analytics table
INSERT INTO public.referral_analytics (id, email, referral_code)
SELECT id, email, referral_code FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- Function to update counts when referrals change
CREATE OR REPLACE FUNCTION public.update_referral_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_referrer_id := OLD.referrer_id;
  ELSE
    v_referrer_id := NEW.referrer_id;
  END IF;

  UPDATE public.referral_analytics
  SET 
    total_referrals = (SELECT count(*) FROM public.referrals WHERE referrer_id = v_referrer_id),
    pending_referrals = (SELECT count(*) FROM public.referrals WHERE referrer_id = v_referrer_id AND status = 'pending'),
    successful_referrals = (SELECT count(*) FROM public.referrals WHERE referrer_id = v_referrer_id AND status = 'successful')
  WHERE id = v_referrer_id;
  
  RETURN NULL;
END;
$$;

-- Trigger on Referrals table
CREATE TRIGGER on_referral_change_update_analytics
  AFTER INSERT OR UPDATE OR DELETE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_counts();

-- Function to update earnings
CREATE OR REPLACE FUNCTION public.update_referral_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only care about referral_bonus type
  IF NEW.type = 'referral_bonus' THEN
    UPDATE public.referral_analytics
    SET total_earned = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.transactions 
      WHERE user_id = NEW.user_id AND type = 'referral_bonus'
    )
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on Transactions
CREATE TRIGGER on_transaction_referral_bonus
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_earnings();

-- Manually calculate initial stats for existing data
UPDATE public.referral_analytics a
SET 
  total_referrals = (SELECT count(*) FROM public.referrals r WHERE r.referrer_id = a.id),
  pending_referrals = (SELECT count(*) FROM public.referrals r WHERE r.referrer_id = a.id AND r.status = 'pending'),
  successful_referrals = (SELECT count(*) FROM public.referrals r WHERE r.referrer_id = a.id AND r.status = 'successful'),
  total_earned = (SELECT COALESCE(SUM(t.amount), 0) FROM public.transactions t WHERE t.user_id = a.id AND t.type = 'referral_bonus');
