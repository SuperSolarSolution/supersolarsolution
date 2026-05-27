-- Update invest_in_asset RPC to remove referral logic
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

  RETURN jsonb_build_object(
    'success', true,
    'investment_id', v_investment_id,
    'new_balance', (v_user_balance - p_amount)
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;


-- Update add_funds RPC to handle referral rewards on deposit of at least 5000
CREATE OR REPLACE FUNCTION public.add_funds(
  p_user_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance NUMERIC;
  v_total_deposits NUMERIC;
  v_referral_record RECORD;
  v_reward NUMERIC;
BEGIN
  -- 1. Update balance
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_user_id
  RETURNING wallet_balance INTO v_new_balance;

  -- 2. Create transaction record for deposit
  INSERT INTO public.transactions (
    type,
    amount,
    from_entity,
    to_entity,
    user_id,
    status,
    reference
  ) VALUES (
    'deposit',
    p_amount,
    'Bank Account',
    'Wallet',
    p_user_id,
    'completed',
    'Wallet Top-up'
  );

  -- 3. Calculate total completed deposits for this user
  SELECT COALESCE(SUM(amount), 0) INTO v_total_deposits
  FROM public.transactions
  WHERE user_id = p_user_id
    AND type = 'deposit'
    AND status = 'completed';

  -- 4. Check referral and reward if eligible (total deposits >= 5000)
  IF v_total_deposits >= 5000 THEN
    SELECT * INTO v_referral_record
    FROM public.referrals
    WHERE referee_id = p_user_id 
      AND status IN ('registered', 'pending')
    FOR UPDATE; -- Lock to prevent duplicate rewards if deposits happen concurrently
    
    IF FOUND THEN
      v_reward := COALESCE(v_referral_record.reward_amount, 250);
      
      -- Update referral status
      UPDATE public.referrals
      SET status = 'successful', updated_at = now()
      WHERE id = v_referral_record.id;
      
      -- Credit Referrer
      UPDATE public.profiles
      SET wallet_balance = wallet_balance + v_reward
      WHERE id = v_referral_record.referrer_id;
      
      INSERT INTO public.transactions (
        type, amount, from_entity, to_entity, user_id, status, reference
      ) VALUES (
        'referral_bonus', v_reward, 'System', 'Wallet', v_referral_record.referrer_id, 'completed', 'Referral Bonus (Friend Deposit)'
      );
      
      -- Credit Referee (The current user adding funds)
      UPDATE public.profiles
      SET wallet_balance = wallet_balance + v_reward
      WHERE id = p_user_id
      RETURNING wallet_balance INTO v_new_balance; -- Update returning balance
       
      INSERT INTO public.transactions (
        type, amount, from_entity, to_entity, user_id, status, reference
      ) VALUES (
        'referral_bonus', v_reward, 'System', 'Wallet', p_user_id, 'completed', 'Referral Bonus (Signup Reward)'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance
  );
END;
$$;


-- Backfill referral rewards for existing referrals that already meet the deposit criteria of >= 5000
DO $$
DECLARE
  r RECORD;
  v_total_deposits NUMERIC;
  v_reward NUMERIC;
BEGIN
  FOR r IN 
    SELECT id, referrer_id, referee_id, reward_amount 
    FROM public.referrals 
    WHERE status IN ('registered', 'pending')
  LOOP
    SELECT COALESCE(SUM(amount), 0) INTO v_total_deposits
    FROM public.transactions
    WHERE user_id = r.referee_id
      AND type = 'deposit'
      AND status = 'completed';
      
    IF v_total_deposits >= 5000 THEN
      v_reward := COALESCE(r.reward_amount, 250);
      
      -- Update referral status
      UPDATE public.referrals
      SET status = 'successful', updated_at = now()
      WHERE id = r.id;
      
      -- Credit Referrer
      UPDATE public.profiles
      SET wallet_balance = wallet_balance + v_reward
      WHERE id = r.referrer_id;
      
      INSERT INTO public.transactions (
        type, amount, from_entity, to_entity, user_id, status, reference
      ) VALUES (
        'referral_bonus', v_reward, 'System', 'Wallet', r.referrer_id, 'completed', 'Referral Bonus (Friend Deposit - Backfilled)'
      );
      
      -- Credit Referee (The friend)
      UPDATE public.profiles
      SET wallet_balance = wallet_balance + v_reward
      WHERE id = r.referee_id;
      
      INSERT INTO public.transactions (
        type, amount, from_entity, to_entity, user_id, status, reference
      ) VALUES (
        'referral_bonus', v_reward, 'System', 'Wallet', r.referee_id, 'completed', 'Referral Bonus (Signup Reward - Backfilled)'
      );
    END IF;
  END LOOP;
END $$;
