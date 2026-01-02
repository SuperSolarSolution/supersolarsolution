-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Create referral_status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
    CREATE TYPE public.referral_status AS ENUM ('registered', 'pending', 'successful');
  END IF;
END $$;

-- Add referral_bonus to transaction_type
DO $$ BEGIN
  ALTER TYPE public.transaction_type ADD VALUE 'referral_bonus';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) NOT NULL,
  referee_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE, -- One referrer per user
  status referral_status NOT NULL DEFAULT 'registered',
  reward_amount NUMERIC DEFAULT 250,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (referrer_id = auth.uid());

-- Function to generate unique code
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
  v_exists BOOLEAN;
BEGIN
  LOOP
    result := 'S3-' || substr(md5(random()::text), 1, 8); -- Simple random hex like S3-8502B286
    -- Make it uppercase
    result := upper(result);
    
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = result) INTO v_exists;
    IF NOT v_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

-- Update handle_new_user to handle referral code generation and tracking
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code TEXT;
  v_referrer_code TEXT;
  v_referrer_id UUID;
BEGIN
  -- Generate new code for this user
  v_referral_code := public.generate_unique_referral_code();
  
  INSERT INTO public.profiles (id, email, full_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    v_referral_code
  );

  -- Check if they were referred
  v_referrer_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF v_referrer_code IS NOT NULL AND v_referrer_code <> '' THEN
    SELECT id INTO v_referrer_id FROM public.profiles WHERE referral_code = v_referrer_code;
    
    IF v_referrer_id IS NOT NULL AND v_referrer_id != NEW.id THEN
      INSERT INTO public.referrals (referrer_id, referee_id, status)
      VALUES (v_referrer_id, NEW.id, 'registered');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for email verification
-- Changes status from registered to pending
CREATE OR REPLACE FUNCTION public.handle_user_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If email_confirmed_at was null and is now set
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.referrals
    SET status = 'pending', updated_at = now()
    WHERE referee_id = NEW.id AND status = 'registered';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users for verification
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_verification();

-- Update invest_in_asset RPC to handle referral rewards
-- We will replace the function completely.
CREATE OR REPLACE FUNCTION public.invest_in_asset(
  p_asset_id UUID,
  p_investor_id UUID,
  p_amount NUMERIC,
  p_expected_returns NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_asset_name TEXT;
  v_current_funding NUMERIC;
  v_total_investment NUMERIC;
  v_user_balance NUMERIC;
  v_investment_id UUID;
  v_referral_record RECORD;
BEGIN
  -- 1. Check if asset exists and get details
  SELECT name, funded_amount, total_investment 
  INTO v_asset_name, v_current_funding, v_total_investment
  FROM public.solar_assets
  WHERE id = p_asset_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset not found';
  END IF;

  -- 2. Check if asset is fully funded
  IF (v_current_funding + p_amount) > v_total_investment THEN
    RAISE EXCEPTION 'Investment exceeds required funding amount';
  END IF;

  -- 3. Check user balance
  SELECT wallet_balance INTO v_user_balance
  FROM public.profiles
  WHERE id = p_investor_id;

  IF v_user_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- 4. Deduct from wallet
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_investor_id;

  -- 5. Create transaction record
  INSERT INTO public.transactions (
    type, amount, from_entity, to_entity, user_id, status, reference
  ) VALUES (
    'investment', p_amount, 'Wallet', v_asset_name, p_investor_id, 'completed', 'Investment in ' || v_asset_name
  );

  -- 6. Create investment record
  INSERT INTO public.investments (
    asset_id, investor_id, amount, expected_returns, status, maturity_date
  ) VALUES (
    p_asset_id, p_investor_id, p_amount, p_expected_returns, 'committed',
    (CURRENT_DATE + interval '1 year' * (SELECT expected_life_years FROM public.solar_assets WHERE id = p_asset_id))
  ) RETURNING id INTO v_investment_id;

  -- 7. Update asset funding
  UPDATE public.solar_assets
  SET funded_amount = funded_amount + p_amount,
      status = CASE 
        WHEN (funded_amount + p_amount) >= total_investment THEN 'under_construction'::asset_status
        ELSE status 
      END
  WHERE id = p_asset_id;

  -- === REFERRAL LOGIC START ===
  -- Check if this user has a pending referral and investment >= 1000
  IF p_amount >= 1000 THEN
    SELECT * INTO v_referral_record
    FROM public.referrals
    WHERE referee_id = p_investor_id AND status = 'pending';
    
    IF FOUND THEN
      -- Update referral status
      UPDATE public.referrals
      SET status = 'successful', updated_at = now()
      WHERE id = v_referral_record.id;
      
      -- Credit Referrer
      UPDATE public.profiles
      SET wallet_balance = wallet_balance + 250
      WHERE id = v_referral_record.referrer_id;
      
      INSERT INTO public.transactions (
        type, amount, from_entity, to_entity, user_id, status, reference
      ) VALUES (
        'referral_bonus', 250, 'System', 'Wallet', v_referral_record.referrer_id, 'completed', 'Referral Bonus for ' || v_asset_name
      );
      
      -- Credit Referee (The Investor)
      UPDATE public.profiles
      SET wallet_balance = wallet_balance + 250
      WHERE id = p_investor_id;
       
      INSERT INTO public.transactions (
        type, amount, from_entity, to_entity, user_id, status, reference
      ) VALUES (
        'referral_bonus', 250, 'System', 'Wallet', p_investor_id, 'completed', 'Referral Bonus (Signup Reward)'
      );
    END IF;
  END IF;
  -- === REFERRAL LOGIC END ===

  RETURN jsonb_build_object(
    'success', true,
    'investment_id', v_investment_id,
    'new_balance', (v_user_balance - p_amount) -- UI will refresh anyway
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;
