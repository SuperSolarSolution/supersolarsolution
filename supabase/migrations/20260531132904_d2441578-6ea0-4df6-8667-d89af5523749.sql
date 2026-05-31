CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referral_code TEXT;
  v_referrer_code TEXT;
  v_referrer_id UUID;
  v_role app_role;
BEGIN
  v_referral_code := public.generate_unique_referral_code();

  -- Derive role from metadata; fall back to investor
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'investor'::app_role);
  EXCEPTION WHEN OTHERS THEN
    v_role := 'investor'::app_role;
  END;

  INSERT INTO public.profiles (id, email, full_name, referral_code, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    v_referral_code,
    v_role
  );

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
$function$;