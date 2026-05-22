-- Schema updates for Solar Investment Platform production-ready gaps

-- 1. Profiles Enhancements
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS bank_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS kyc_approved_at TIMESTAMPTZ;

-- 2. SIP Plans Enhancements
ALTER TABLE public.sip_plans
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'wallet' CHECK (payment_method IN ('wallet', 'mandate')),
ADD COLUMN IF NOT EXISTS mandate_id TEXT DEFAULT NULL;

-- 3. Projects Enhancements (Corporate Contracts)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS lease_agreement_signed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lease_agreement_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lease_agreement_signature_id TEXT,
ADD COLUMN IF NOT EXISTS ppa_agreement_signed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ppa_agreement_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ppa_agreement_signature_id TEXT;

-- 4. P2P Secondary Market table
CREATE TABLE IF NOT EXISTS public.p2p_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES public.solar_assets(id) ON DELETE CASCADE NOT NULL,
  fraction_amount NUMERIC NOT NULL CHECK (fraction_amount > 0),
  sale_price NUMERIC NOT NULL CHECK (sale_price >= 0),
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for P2P Listings
ALTER TABLE public.p2p_listings ENABLE ROW LEVEL SECURITY;

-- Policies for P2P Listings
DROP POLICY IF EXISTS "P2P listings are readable by all authenticated users" ON public.p2p_listings;
CREATE POLICY "P2P listings are readable by all authenticated users"
  ON public.p2p_listings FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Investors can insert their own P2P listings" ON public.p2p_listings;
CREATE POLICY "Investors can insert their own P2P listings"
  ON public.p2p_listings FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "Investors can update their own active listings" ON public.p2p_listings;
CREATE POLICY "Investors can update their own active listings"
  ON public.p2p_listings FOR UPDATE TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- 5. Atomic P2P Listing Purchase RPC
CREATE OR REPLACE FUNCTION public.buy_p2p_listing(
  p_listing_id UUID,
  p_buyer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id UUID;
  v_investment_id UUID;
  v_asset_id UUID;
  v_fraction_amount NUMERIC;
  v_sale_price NUMERIC;
  v_status TEXT;
  
  v_seller_amount NUMERIC;
  v_seller_returns NUMERIC;
  v_seller_actual_returns NUMERIC;
  v_start_date DATE;
  v_maturity_date DATE;
  v_inv_status investment_status;
  
  v_buyer_balance NUMERIC;
  v_seller_name TEXT;
  v_buyer_name TEXT;
  v_asset_name TEXT;
  v_ratio NUMERIC;
  v_buyer_returns NUMERIC;
  
  v_new_investment_id UUID;
BEGIN
  -- 1. Fetch listing details and lock the row
  SELECT seller_id, investment_id, asset_id, fraction_amount, sale_price, status
  INTO v_seller_id, v_investment_id, v_asset_id, v_fraction_amount, v_sale_price, v_status
  FROM public.p2p_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Listing is no longer active';
  END IF;

  IF v_seller_id = p_buyer_id THEN
    RAISE EXCEPTION 'You cannot buy your own listing';
  END IF;

  -- 2. Verify Seller's investment details
  SELECT amount, expected_returns, actual_returns, start_date, maturity_date, status
  INTO v_seller_amount, v_seller_returns, v_seller_actual_returns, v_start_date, v_maturity_date, v_inv_status
  FROM public.investments
  WHERE id = v_investment_id AND investor_id = v_seller_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller investment record not found';
  END IF;

  IF v_seller_amount < v_fraction_amount THEN
    RAISE EXCEPTION 'Seller does not have enough fractional holdings to fulfill this listing';
  END IF;

  -- 3. Verify Buyer's wallet balance
  SELECT wallet_balance, full_name INTO v_buyer_balance, v_buyer_name
  FROM public.profiles
  WHERE id = p_buyer_id
  FOR UPDATE;

  IF v_buyer_balance < v_sale_price THEN
    RAISE EXCEPTION 'Insufficient wallet balance for purchase';
  END IF;

  -- Fetch Seller's full name and Asset name
  SELECT full_name INTO v_seller_name FROM public.profiles WHERE id = v_seller_id;
  SELECT name INTO v_asset_name FROM public.solar_assets WHERE id = v_asset_id;

  -- Calculate returns split ratio
  v_ratio := v_fraction_amount / v_seller_amount;
  v_buyer_returns := v_seller_returns * v_ratio;

  -- 4. Deduct sale price from buyer
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - v_sale_price
  WHERE id = p_buyer_id;

  -- 5. Credit sale price to seller
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + v_sale_price
  WHERE id = v_seller_id;

  -- 6. Adjust investments
  IF ABS(v_seller_amount - v_fraction_amount) < 0.0001 THEN
    -- Transfer the entire investment to the buyer
    UPDATE public.investments
    SET investor_id = p_buyer_id,
        updated_at = now()
    WHERE id = v_investment_id;
    v_new_investment_id := v_investment_id;
  ELSE
    -- Reduce seller's investment
    UPDATE public.investments
    SET amount = amount - v_fraction_amount,
        expected_returns = expected_returns - v_buyer_returns,
        updated_at = now()
    WHERE id = v_investment_id;

    -- Create new investment for buyer
    INSERT INTO public.investments (
      asset_id,
      investor_id,
      amount,
      expected_returns,
      actual_returns,
      start_date,
      maturity_date,
      status
    ) VALUES (
      v_asset_id,
      p_buyer_id,
      v_fraction_amount,
      v_buyer_returns,
      0,
      v_start_date,
      v_maturity_date,
      v_inv_status
    ) RETURNING id INTO v_new_investment_id;
  END IF;

  -- 7. Add Transaction Logs
  -- Transaction for Buyer
  INSERT INTO public.transactions (
    type,
    amount,
    from_entity,
    to_entity,
    user_id,
    status,
    reference
  ) VALUES (
    'investment', -- type must match transaction_type enum, assuming 'investment' is valid
    v_sale_price,
    'Wallet',
    'P2P Seller: ' || v_seller_name,
    p_buyer_id,
    'completed',
    'P2P Purchase of ' || v_fraction_amount || 'kW from ' || v_seller_name || ' for asset: ' || v_asset_name
  );

  -- Transaction for Seller
  INSERT INTO public.transactions (
    type,
    amount,
    from_entity,
    to_entity,
    user_id,
    status,
    reference
  ) VALUES (
    'payout', -- assuming 'payout' or other type is valid; fallback to payout/deposit depending on schema
    v_sale_price,
    'P2P Buyer: ' || v_buyer_name,
    'Wallet',
    v_seller_id,
    'completed',
    'P2P Sale of ' || v_fraction_amount || 'kW to ' || v_buyer_name || ' for asset: ' || v_asset_name
  );

  -- 8. Mark listing as completed
  UPDATE public.p2p_listings
  SET status = 'completed'
  WHERE id = p_listing_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_buyer_balance', v_buyer_balance - v_sale_price,
    'buyer_investment_id', v_new_investment_id
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

-- 6. Allow Corporate users to update their own projects (e.g. for eSigning)
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (auth.uid() = corporate_id)
  WITH CHECK (auth.uid() = corporate_id);

