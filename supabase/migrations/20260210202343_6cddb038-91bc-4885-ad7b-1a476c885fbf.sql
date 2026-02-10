
-- Add bank details to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bank_account_number text,
ADD COLUMN IF NOT EXISTS bank_ifsc text,
ADD COLUMN IF NOT EXISTS bank_account_holder text;

-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  bank_account_number text NOT NULL,
  bank_ifsc text NOT NULL,
  bank_account_holder text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  razorpay_payout_id text,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawal requests
CREATE POLICY "Users can view own withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update withdrawal requests (for processing)
CREATE POLICY "Admins can update withdrawal requests"
ON public.withdrawal_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_withdrawal_requests_updated_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create request_withdrawal function
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_user_id uuid,
  p_amount numeric,
  p_bank_account_number text,
  p_bank_ifsc text,
  p_bank_account_holder text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_balance numeric;
  v_request_id uuid;
BEGIN
  -- Check balance
  SELECT wallet_balance INTO v_balance
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  IF p_amount < 100 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is ₹100';
  END IF;

  -- Deduct from wallet
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_user_id;

  -- Save bank details to profile
  UPDATE public.profiles
  SET
    bank_account_number = p_bank_account_number,
    bank_ifsc = p_bank_ifsc,
    bank_account_holder = p_bank_account_holder
  WHERE id = p_user_id;

  -- Create withdrawal request
  INSERT INTO public.withdrawal_requests (
    user_id, amount, bank_account_number, bank_ifsc, bank_account_holder, status
  ) VALUES (
    p_user_id, p_amount, p_bank_account_number, p_bank_ifsc, p_bank_account_holder, 'pending'
  ) RETURNING id INTO v_request_id;

  -- Create transaction record
  INSERT INTO public.transactions (
    type, amount, from_entity, to_entity, user_id, status, reference
  ) VALUES (
    'withdrawal', p_amount, 'Wallet', 'Bank Account', p_user_id, 'pending', 'Withdrawal Request #' || v_request_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'request_id', v_request_id,
    'new_balance', v_balance - p_amount
  );
END;
$$;
