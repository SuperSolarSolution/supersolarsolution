UPDATE public.profiles p
SET role = ((u.raw_user_meta_data ->> 'role')::app_role)
FROM auth.users u
WHERE p.id = u.id
  AND u.raw_user_meta_data ->> 'role' IS NOT NULL
  AND u.raw_user_meta_data ->> 'role' <> ''
  AND p.role::text <> (u.raw_user_meta_data ->> 'role');