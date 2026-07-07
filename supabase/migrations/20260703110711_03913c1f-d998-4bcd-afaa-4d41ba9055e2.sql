INSERT INTO public.user_roles (user_id, role)
SELECT '4fafa2fe-b0f1-4e29-b71f-055308798366', 'master'
WHERE EXISTS (
  SELECT 1
  FROM auth.users
  WHERE id = '4fafa2fe-b0f1-4e29-b71f-055308798366'
)
ON CONFLICT (user_id, role) DO NOTHING;
