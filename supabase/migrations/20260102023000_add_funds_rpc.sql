-- Add 'deposit' and 'withdrawal' to transaction_type enum
-- Note: executed inside a DO block to handle "IF NOT EXISTS" logic for individual enum values which isn't standard SQL
DO $$
BEGIN
    ALTER TYPE public.transaction_type ADD VALUE 'deposit';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE public.transaction_type ADD VALUE 'withdrawal';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create add_funds function
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
BEGIN
  -- Update balance
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_user_id
  RETURNING wallet_balance INTO v_new_balance;

  -- Create transaction record
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

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance
  );
END;
$$;
