-- Luckskins tenant overlay and required menu toggles.
WITH t AS (
  SELECT id FROM public.tenants WHERE slug = 'default'
)
INSERT INTO public.tenant_settings (tenant_id, key, value)
SELECT (SELECT id FROM t), k, v FROM (VALUES
  ('site_name', 'Luckskins'),
  ('site_title', 'Luckskins'),
  ('site_description', 'A melhor e mais segura plataforma de rifas online. Participe e ganhe premios incriveis!'),
  ('primary_color', '#E0B000'),
  ('site_theme', 'dark')
) AS s(k, v)
ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.site_settings (key, value)
VALUES
  ('menu_campanhas_enabled', 'true'),
  ('menu_ganhadores_enabled', 'true'),
  ('menu_federal_enabled', 'true'),
  ('menu_comunicados_enabled', 'true'),
  ('menu_suporte_enabled', 'true'),
  ('menu_minha_conta_enabled', 'true'),
  ('header_register_button_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

WITH t AS (
  SELECT id FROM public.tenants WHERE slug = 'default'
)
INSERT INTO public.tenant_settings (tenant_id, key, value)
SELECT (SELECT id FROM t), k, v FROM (VALUES
  ('menu_campanhas_enabled', 'true'),
  ('menu_ganhadores_enabled', 'true'),
  ('menu_federal_enabled', 'true'),
  ('menu_comunicados_enabled', 'true'),
  ('menu_suporte_enabled', 'true'),
  ('menu_minha_conta_enabled', 'true'),
  ('header_register_button_enabled', 'true')
) AS s(k, v)
ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value;

WITH t AS (
  SELECT id FROM public.tenants WHERE slug = 'itskin'
)
INSERT INTO public.tenant_settings (tenant_id, key, value)
SELECT (SELECT id FROM t), k, v FROM (VALUES
  ('menu_campanhas_enabled', 'true'),
  ('menu_ganhadores_enabled', 'true'),
  ('menu_federal_enabled', 'true'),
  ('menu_comunicados_enabled', 'true'),
  ('menu_suporte_enabled', 'true'),
  ('menu_minha_conta_enabled', 'true'),
  ('header_register_button_enabled', 'true')
) AS s(k, v)
ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value;

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'edu.matosr6@gmail.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'master')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
