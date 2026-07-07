-- Fix: recurso de "Depositar via PIX" (carteira/saldo) estava 100% quebrado.
--
-- O DepositModal (src/components/DepositModal.tsx) cria um pedido com
-- campaign_id = '00000000-0000-0000-0000-000000000001' (campanha especial de
-- deposito). Existe uma FK orders.campaign_id -> campaigns.id, mas essa linha
-- de campanha nunca foi criada em producao, entao QUALQUER tentativa de
-- deposito falhava na hora com foreign_key_violation ("paga e nao muda saldo").
--
-- handle_order_payment ja trata esse campaign_id como deposito (credita balance
-- + registra wallet_transaction); so faltava a linha da campanha existir.
--
-- status = 'archived' para nao aparecer nas listagens do site (a home filtra por
-- status 'active' / 'completed' / 'finished' / 'drawn').

INSERT INTO public.campaigns (id, title, slug, status, ticket_price, total_tickets)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Depósito de Saldo',
    'deposito-saldo',
    'archived',
    1,
    0
)
ON CONFLICT (id) DO NOTHING;
