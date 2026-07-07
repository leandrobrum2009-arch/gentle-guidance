-- Fix: a barra de progresso da campanha (frontend le campaigns.sold_tickets)
-- nunca atualizava, porque nem reserve_tickets nem handle_order_payment
-- incrementavam sold_tickets. Resultado: barra travada em 0% mesmo com vendas.
--
-- Correcao:
-- 1) handle_order_payment passa a recalcular sold_tickets (contagem autoritativa
--    de tickets confirmed/paid) ao confirmar um pedido de campanha.
-- 2) Backfill: acerta sold_tickets de todas as campanhas existentes.

CREATE OR REPLACE FUNCTION public.handle_order_payment(p_order_id UUID, p_payment_id TEXT DEFAULT NULL, p_payment_provider TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
    DECLARE
        v_campaign_id UUID;
        v_user_id UUID;
        v_quantity INTEGER;
        v_current_status TEXT;
        v_total_amount NUMERIC;
        v_is_deposit BOOLEAN;
        v_affiliate_id UUID;
        v_commission_rate NUMERIC;
        v_commission_amount NUMERIC;
        v_referred_by_code TEXT;
    BEGIN
        SELECT o.campaign_id, o.user_id, o.quantity, o.payment_status, o.total_amount, o.affiliate_id
        INTO v_campaign_id, v_user_id, v_quantity, v_current_status, v_total_amount, v_affiliate_id
        FROM public.orders o
        WHERE o.id = p_order_id
        FOR UPDATE;

        v_is_deposit := (v_campaign_id = '00000000-0000-0000-0000-000000000001');

        IF v_current_status != 'paid' THEN
            UPDATE public.orders
            SET payment_status = 'paid',
                paid_at = now(),
                payment_id = COALESCE(p_payment_id, orders.payment_id),
                payment_provider = COALESCE(p_payment_provider, orders.payment_provider)
            WHERE id = p_order_id;

            IF v_is_deposit THEN
                UPDATE public.profiles
                SET balance = balance + v_total_amount
                WHERE user_id = v_user_id;

                INSERT INTO public.wallet_transactions (user_id, amount, type, status, description)
                VALUES (v_user_id, v_total_amount, 'deposit', 'completed', 'Depósito via PIX');
            ELSE
                -- confirma os tickets reservados deste pedido
                UPDATE public.tickets
                SET status = 'confirmed', reservation_expires_at = NULL
                WHERE order_id = p_order_id AND status = 'reserved';

                -- >>> mantem sold_tickets em dia para a barra de progresso <<<
                UPDATE public.campaigns
                SET sold_tickets = (
                    SELECT COUNT(*) FROM public.tickets
                    WHERE campaign_id = v_campaign_id AND status IN ('confirmed','paid')
                )
                WHERE id = v_campaign_id;

                IF v_affiliate_id IS NULL THEN
                    SELECT referred_by_code INTO v_referred_by_code FROM public.profiles WHERE user_id = v_user_id;
                    IF v_referred_by_code IS NOT NULL THEN
                        SELECT id INTO v_affiliate_id FROM public.affiliates WHERE referral_code = v_referred_by_code AND is_active = true LIMIT 1;

                        IF v_affiliate_id IS NOT NULL THEN
                            UPDATE public.orders SET affiliate_id = v_affiliate_id WHERE id = p_order_id;
                        END IF;
                    END IF;
                END IF;

                IF v_affiliate_id IS NOT NULL THEN
                    SELECT commission_rate INTO v_commission_rate FROM public.affiliates WHERE id = v_affiliate_id;
                    v_commission_amount := v_total_amount * v_commission_rate;

                    INSERT INTO public.affiliate_commissions (affiliate_id, order_id, campaign_id, amount, status)
                    VALUES (v_affiliate_id, p_order_id, v_campaign_id, v_commission_amount, 'pending');

                    UPDATE public.affiliates
                    SET total_earned = total_earned + v_commission_amount
                    WHERE id = v_affiliate_id;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM public.roulette_spins
                    WHERE user_id = v_user_id AND campaign_id = v_campaign_id AND prize_label IS NULL
                ) THEN
                    INSERT INTO public.roulette_spins (user_id, campaign_id, is_free)
                    VALUES (v_user_id, v_campaign_id, true);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM public.scratch_card_scratches
                    WHERE user_id = v_user_id AND (campaign_id = v_campaign_id OR campaign_id IS NULL) AND prize_label IS NULL
                ) THEN
                    INSERT INTO public.scratch_card_scratches (user_id, campaign_id, prize_label, cost, is_winner)
                    VALUES (v_user_id, v_campaign_id, NULL, 0, false);
                END IF;
            END IF;
        END IF;
    END;
$$;

-- Backfill: acerta o contador de todas as campanhas com a contagem real
UPDATE public.campaigns c
SET sold_tickets = (
    SELECT COUNT(*) FROM public.tickets t
    WHERE t.campaign_id = c.id AND t.status IN ('confirmed','paid')
);
