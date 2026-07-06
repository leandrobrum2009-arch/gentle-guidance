
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com';

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (v_user_id, 'Admin', 'admin@admin.com')
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
