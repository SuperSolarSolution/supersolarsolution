-- Add wallet_balance to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC NOT NULL DEFAULT 0;

-- Create atomic investment function
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
    type,
    amount,
    from_entity,
    to_entity,
    user_id,
    status,
    reference
  ) VALUES (
    'investment',
    p_amount,
    'Wallet',
    v_asset_name,
    p_investor_id,
    'completed',
    'Investment in ' || v_asset_name
  );

  -- 6. Create investment record
  INSERT INTO public.investments (
    asset_id,
    investor_id,
    amount,
    expected_returns,
    status,
    maturity_date
  ) VALUES (
    p_asset_id,
    p_investor_id,
    p_amount,
    p_expected_returns,
    'committed',
    (CURRENT_DATE + interval '1 year' * (SELECT expected_life_years FROM public.solar_assets WHERE id = p_asset_id))
  ) RETURNING id INTO v_investment_id;

  -- 7. Update asset funding status
  UPDATE public.solar_assets
  SET funded_amount = funded_amount + p_amount,
      status = CASE 
        WHEN (funded_amount + p_amount) >= total_investment THEN 'under_construction'::asset_status
        ELSE status 
      END
  WHERE id = p_asset_id;

  RETURN jsonb_build_object(
    'success', true,
    'investment_id', v_investment_id,
    'new_balance', v_user_balance - p_amount
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;
