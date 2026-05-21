
-- Enum
CREATE TYPE public.notification_type AS ENUM (
  'return_credited','withdrawal_processed','withdrawal_rejected',
  'new_asset','kyc_approved','kyc_rejected',
  'sip_executed','sip_failed','investment_confirmed','referral_bonus','general'
);

-- Table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL,
  link text,
  metadata jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins view all notifications" ON public.notifications
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE POLICY "System insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Helper
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid, p_type public.notification_type, p_title text,
  p_message text, p_link text DEFAULT NULL, p_metadata jsonb DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.notifications(user_id,type,title,message,link,metadata)
  VALUES(p_user_id,p_type,p_title,p_message,p_link,p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;$$;

-- Withdrawal status trigger
CREATE OR REPLACE FUNCTION public.notify_withdrawal_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'approved' OR NEW.status = 'processed' OR NEW.status = 'completed' THEN
      PERFORM public.create_notification(
        NEW.user_id,'withdrawal_processed','Withdrawal Processed',
        'Your withdrawal of ₹'||NEW.amount||' has been processed successfully.',
        '/dashboard/investor/wallet', jsonb_build_object('amount',NEW.amount,'request_id',NEW.id)
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM public.create_notification(
        NEW.user_id,'withdrawal_rejected','Withdrawal Rejected',
        'Your withdrawal of ₹'||NEW.amount||' was rejected. Amount refunded to wallet.',
        '/dashboard/investor/wallet', jsonb_build_object('amount',NEW.amount,'request_id',NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_notify_withdrawal_status
  AFTER UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_withdrawal_status();

-- KYC status trigger
CREATE OR REPLACE FUNCTION public.notify_kyc_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
    IF NEW.kyc_status = 'approved' THEN
      PERFORM public.create_notification(
        NEW.id,'kyc_approved','KYC Approved',
        'Your KYC has been verified. You can now invest in solar assets.',
        '/dashboard/investor/settings', NULL
      );
    ELSIF NEW.kyc_status = 'rejected' THEN
      PERFORM public.create_notification(
        NEW.id,'kyc_rejected','KYC Rejected',
        'Your KYC verification was rejected. Please re-submit your documents.',
        '/dashboard/investor/settings', NULL
      );
    END IF;
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_notify_kyc_status
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_kyc_status();

-- New asset broadcast
CREATE OR REPLACE FUNCTION public.notify_new_asset()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status::text IN ('funding_open','funding') THEN
    INSERT INTO public.notifications(user_id,type,title,message,link,metadata)
    SELECT p.id,'new_asset','New Solar Asset Available',
      NEW.name||' is now open for investment ('||NEW.expected_irr||'% IRR).',
      '/dashboard/investor/assets',
      jsonb_build_object('asset_id',NEW.id,'asset_name',NEW.name)
    FROM public.profiles p WHERE p.role='investor';
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_notify_new_asset
  AFTER INSERT ON public.solar_assets
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_asset();

-- Transaction notifications (returns, referral, investment)
CREATE OR REPLACE FUNCTION public.notify_transaction()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.status::text NOT IN ('completed','success') THEN RETURN NEW; END IF;

  IF NEW.type::text = 'return' OR NEW.type::text = 'returns' OR NEW.type::text = 'payout' THEN
    PERFORM public.create_notification(
      NEW.user_id,'return_credited','Returns Credited',
      '₹'||NEW.amount||' returns credited to your wallet from '||NEW.from_entity||'.',
      '/dashboard/investor/wallet', jsonb_build_object('amount',NEW.amount)
    );
  ELSIF NEW.type::text = 'referral_bonus' THEN
    PERFORM public.create_notification(
      NEW.user_id,'referral_bonus','Referral Bonus',
      'You earned ₹'||NEW.amount||' as referral bonus.',
      '/dashboard/investor/wallet', jsonb_build_object('amount',NEW.amount)
    );
  ELSIF NEW.type::text = 'investment' THEN
    PERFORM public.create_notification(
      NEW.user_id,'investment_confirmed','Investment Confirmed',
      'Your investment of ₹'||NEW.amount||' in '||NEW.to_entity||' is confirmed.',
      '/dashboard/investor', jsonb_build_object('amount',NEW.amount)
    );
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_notify_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_transaction();
