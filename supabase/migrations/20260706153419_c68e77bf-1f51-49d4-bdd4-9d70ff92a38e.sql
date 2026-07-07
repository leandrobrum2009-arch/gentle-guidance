-- Create dedicated tenant for itskin.com.br while existing data remains under the default Luckskins tenant.
WITH new_tenant AS (
  INSERT INTO public.tenants (slug, name, is_active, plan)
  VALUES ('itskin', 'It Skin', true, 'pro')
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      is_active = EXCLUDED.is_active,
      plan = EXCLUDED.plan
  RETURNING id
)
, ensure_domains AS (
  INSERT INTO public.tenant_domains (tenant_id, domain, is_primary)
  SELECT (SELECT id FROM new_tenant), d.domain, d.is_primary
  FROM (VALUES
    ('itskin.com.br', true),
    ('www.itskin.com.br', false)
  ) AS d(domain, is_primary)
  ON CONFLICT (domain) DO UPDATE
  SET tenant_id = EXCLUDED.tenant_id,
      is_primary = EXCLUDED.is_primary
  RETURNING 1
)
INSERT INTO public.tenant_settings (tenant_id, key, value)
SELECT (SELECT id FROM new_tenant), k, v FROM (VALUES
  ('site_name', 'It Skin'),
  ('site_title', 'It Skin'),
  ('site_description', 'Participe das campanhas It Skin com pagamento via PIX e sorteios online.'),
  ('primary_color', '#E0B000'),
  ('site_theme', 'dark')
) AS s(k, v)
ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value;
