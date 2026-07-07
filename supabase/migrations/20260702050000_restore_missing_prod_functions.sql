-- Consolida no historico de migrations as correcoes aplicadas direto no banco
-- de producao em 2026-07-02, para que fiquem versionadas e nao se percam caso
-- o schema seja re-sincronizado no futuro.
--
-- Causa raiz identificada: o banco de producao nunca tinha recebido boa parte
-- das migrations deste repositorio. Varias funcoes usadas pelo site (compra,
-- pagamento, sorteio, jogos) estavam ausentes ou com versoes antigas/incompletas.

-- 1) reserve_tickets: versao em producao nao inseria linhas em public.tickets
CREATE OR REPLACE FUNCTION public.reserve_tickets(
    p_campaign_id UUID,
    p_user_id UUID,
    p_quantity INTEGER,
    p_numbers TEXT[] DEFAULT NULL,
    p_affiliate_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_total_amount NUMERIC;
    v_ticket_price NUMERIC;
    v_price_bundles JSONB;
    v_matched_price NUMERIC;
    v_bundle RECORD;
    v_num TEXT;
    v_total_tickets INTEGER;
    v_pad_len INTEGER;
    v_ticket_type TEXT;
    v_campaign_status TEXT;
    v_draw_date TIMESTAMPTZ;
    v_expiration_interval INTERVAL := '15 minutes';
    v_available_count INTEGER;
    v_generated_count INTEGER := 0;
    v_random_num TEXT;
BEGIN
    SELECT ticket_price, price_bundles, total_tickets, LENGTH(total_tickets::text), ticket_generation_type, status, draw_date
    INTO v_ticket_price, v_price_bundles, v_total_tickets, v_pad_len, v_ticket_type, v_campaign_status, v_draw_date
    FROM public.campaigns WHERE id = p_campaign_id;

    IF v_campaign_status != 'active' THEN
        RAISE EXCEPTION 'Esta campanha não está aceitando novos pedidos (Status: %).', v_campaign_status;
    END IF;

    IF v_draw_date IS NOT NULL AND v_draw_date < now() THEN
        RAISE EXCEPTION 'O período de vendas para esta campanha já encerrou.';
    END IF;

    v_matched_price := NULL;

    IF v_price_bundles IS NOT NULL AND jsonb_array_length(v_price_bundles) > 0 THEN
        FOR v_bundle IN SELECT * FROM jsonb_to_recordset(v_price_bundles) AS x(quantity INTEGER, price NUMERIC) LOOP
            IF v_bundle.quantity = p_quantity THEN
                v_matched_price := v_bundle.price;
                EXIT;
            END IF;
        END LOOP;
    END IF;

    IF v_matched_price IS NOT NULL THEN
        v_total_amount := v_matched_price;
    ELSE
        v_total_amount := v_ticket_price * p_quantity;
    END IF;

    INSERT INTO public.orders (user_id, campaign_id, quantity, total_amount, payment_status, expires_at, affiliate_id)
    VALUES (p_user_id, p_campaign_id, p_quantity, v_total_amount, 'pending', now() + v_expiration_interval, p_affiliate_id)
    RETURNING id INTO v_order_id;

    IF (p_numbers IS NOT NULL AND array_length(p_numbers, 1) > 0) THEN
        FOREACH v_num IN ARRAY p_numbers LOOP
            IF EXISTS (SELECT 1 FROM public.tickets WHERE campaign_id = p_campaign_id AND number = v_num AND (status IN ('confirmed', 'paid') OR (status = 'reserved' AND reservation_expires_at > now()))) THEN
                RAISE EXCEPTION 'O número % já está reservado ou pago.', v_num;
            END IF;

            INSERT INTO public.tickets (campaign_id, user_id, order_id, number, status, reservation_expires_at)
            VALUES (p_campaign_id, p_user_id, v_order_id, v_num, 'reserved', now() + v_expiration_interval);
        END LOOP;
    ELSE
        SELECT v_total_tickets - COUNT(*) INTO v_available_count
        FROM public.tickets
        WHERE campaign_id = p_campaign_id
        AND (status IN ('confirmed', 'paid') OR (status = 'reserved' AND reservation_expires_at > now()));

        IF v_available_count < p_quantity THEN
            RAISE EXCEPTION 'Não há cotas suficientes disponíveis. Disponível: %, Solicitado: %', v_available_count, p_quantity;
        END IF;

        WHILE v_generated_count < p_quantity LOOP
            v_random_num := LPAD(FLOOR(RANDOM() * v_total_tickets)::text, v_pad_len, '0');

            IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE campaign_id = p_campaign_id AND number = v_random_num AND (status IN ('confirmed', 'paid') OR (status = 'reserved' AND reservation_expires_at > now()))) THEN
                INSERT INTO public.tickets (campaign_id, user_id, order_id, number, status, reservation_expires_at)
                VALUES (p_campaign_id, p_user_id, v_order_id, v_random_num, 'reserved', now() + v_expiration_interval);
                v_generated_count := v_generated_count + 1;
            END IF;
        END LOOP;
    END IF;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) handle_order_payment: agora tambem confirma os tickets reservados do pedido
--    (producao so atualizava orders.payment_status, tickets ficavam 'reserved'
--    para sempre e expiravam em 15 minutos mesmo apos o pagamento ser aprovado)
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
                UPDATE public.tickets
                SET status = 'confirmed', reservation_expires_at = NULL
                WHERE order_id = p_order_id AND status = 'reserved';

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

-- 3) release_expired_tickets, perform_draw, manual_perform_draw, repair_order:
--    ausentes em producao (existiam apenas nas migrations, nunca aplicadas).
--    Corpo identico ao das migrations originais, com draw_date/draw_number
--    tratados como TEXT (tipo real da coluna em producao).
CREATE OR REPLACE FUNCTION public.release_expired_tickets()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    DELETE FROM public.tickets
    WHERE status = 'reserved' AND reservation_expires_at < now();

    UPDATE public.orders
    SET payment_status = 'expired'
    WHERE payment_status = 'pending' AND expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.perform_draw(
    p_campaign_id uuid,
    p_executed_by uuid DEFAULT NULL,
    p_prize_index integer DEFAULT 1,
    p_allow_unassigned boolean DEFAULT false
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_winner_id UUID;
    v_campaign RECORD;
    v_winner_name TEXT;
    v_user_id UUID;
    v_winning_number TEXT;
    v_prize_desc TEXT;
BEGIN
    SELECT * INTO v_campaign FROM public.campaigns WHERE id = p_campaign_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campanha não encontrada.';
    END IF;

    v_prize_desc := v_campaign.title || ' - ' || p_prize_index || 'º Prêmio';

    IF p_allow_unassigned THEN
        v_winning_number := LPAD(FLOOR(RANDOM() * v_campaign.total_tickets)::TEXT, LENGTH((v_campaign.total_tickets - 1)::TEXT), '0');

        SELECT t.user_id, p.name INTO v_user_id, v_winner_name
        FROM public.tickets t
        JOIN public.profiles p ON p.user_id = t.user_id
        WHERE t.campaign_id = p_campaign_id AND t.number = v_winning_number AND t.status IN ('confirmed', 'paid')
        LIMIT 1;

        IF v_winner_name IS NULL THEN
            v_winner_name := 'Número não vendido';
            v_user_id := NULL;
        END IF;
    ELSE
        SELECT t.number, t.user_id, p.name INTO v_winning_number, v_user_id, v_winner_name
        FROM public.tickets t
        JOIN public.profiles p ON p.user_id = t.user_id
        WHERE t.campaign_id = p_campaign_id AND t.status IN ('confirmed', 'paid')
        ORDER BY random()
        LIMIT 1;

        IF v_winning_number IS NULL THEN
            RAISE EXCEPTION 'Nenhum bilhete confirmado ou pago encontrado para esta campanha.';
        END IF;
    END IF;

    DELETE FROM public.winners
    WHERE campaign_id = p_campaign_id
    AND winner_type = 'raffle'
    AND prize_index = p_prize_index;

    INSERT INTO public.winners (
        campaign_id, user_id, winner_name, ticket_number,
        prize_description, draw_date, winner_type, prize_index
    )
    VALUES (
        p_campaign_id, v_user_id, v_winner_name, v_winning_number,
        v_prize_desc, CURRENT_DATE, 'raffle', p_prize_index
    )
    RETURNING id INTO v_winner_id;

    INSERT INTO public.draw_logs (campaign_id, winner_id, executed_by, draw_method, details)
    VALUES (p_campaign_id, v_winner_id, p_executed_by, 'automatic', jsonb_build_object(
        'ticket_number', v_winning_number,
        'user_id', v_user_id,
        'prize_index', p_prize_index,
        'allow_unassigned', p_allow_unassigned,
        'execution_time', now()
    ));

    IF p_prize_index = 1 THEN
        UPDATE public.campaigns
        SET status = 'completed',
            draw_number = v_winning_number,
            draw_date = now()::text
        WHERE id = p_campaign_id;
    END IF;

    RETURN v_winner_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.manual_perform_draw(
    p_campaign_id uuid,
    p_ticket_number text,
    p_prize_index integer DEFAULT 1
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_winner_id UUID;
    v_campaign RECORD;
    v_winner_name TEXT;
    v_user_id UUID;
    v_prize_desc TEXT;
BEGIN
    SELECT * INTO v_campaign FROM public.campaigns WHERE id = p_campaign_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campanha não encontrada.';
    END IF;

    v_prize_desc := v_campaign.title || ' - ' || p_prize_index || 'º Prêmio (Manual)';

    SELECT t.user_id, p.name INTO v_user_id, v_winner_name
    FROM public.tickets t
    JOIN public.profiles p ON p.user_id = t.user_id
    WHERE t.campaign_id = p_campaign_id AND t.number = p_ticket_number AND t.status IN ('confirmed', 'paid')
    LIMIT 1;

    IF v_winner_name IS NULL THEN
        v_winner_name := 'Sorteado (Não vendido)';
        v_user_id := NULL;
    END IF;

    DELETE FROM public.winners
    WHERE campaign_id = p_campaign_id
    AND winner_type = 'raffle'
    AND prize_index = p_prize_index;

    INSERT INTO public.winners (
        campaign_id, user_id, winner_name, ticket_number,
        prize_description, draw_date, winner_type, prize_index
    )
    VALUES (
        p_campaign_id, v_user_id, v_winner_name, p_ticket_number,
        v_prize_desc, CURRENT_DATE, 'raffle', p_prize_index
    )
    RETURNING id INTO v_winner_id;

    IF p_prize_index = 1 THEN
        UPDATE public.campaigns
        SET status = 'completed',
            draw_number = p_ticket_number,
            draw_date = now()::text
        WHERE id = p_campaign_id;
    END IF;

    RETURN v_winner_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.repair_order(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_campaign RECORD;
    v_pad_len INTEGER;
    v_count INTEGER := 0;
    v_max_attempts INTEGER := 0;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;

    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pedido não encontrado');
    END IF;

    IF v_order.payment_status != 'paid' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Apenas pedidos pagos podem ser auditados');
    END IF;

    IF v_order.paid_at IS NULL THEN
        UPDATE public.orders SET paid_at = v_order.created_at WHERE id = p_order_id;
    END IF;

    SELECT * INTO v_campaign FROM public.campaigns WHERE id = v_order.campaign_id;
    v_pad_len := LENGTH(v_campaign.total_tickets::text);

    UPDATE public.tickets
    SET status = 'confirmed',
        reservation_expires_at = NULL
    WHERE order_id = p_order_id AND status != 'confirmed';

    IF v_campaign.ticket_generation_type = 'auto' THEN
        SELECT count(*) INTO v_count FROM public.tickets WHERE order_id = p_order_id;

        WHILE v_count < v_order.quantity AND v_max_attempts < (v_order.quantity * 5) LOOP
            v_max_attempts := v_max_attempts + 1;

            INSERT INTO public.tickets (order_id, campaign_id, user_id, number, status)
            SELECT p_order_id, v_order.campaign_id, v_order.user_id, LPAD(floor(random() * v_campaign.total_tickets)::text, v_pad_len, '0'), 'confirmed'
            WHERE NOT EXISTS (
               SELECT 1 FROM public.tickets WHERE campaign_id = v_order.campaign_id AND number = LPAD(floor(random() * v_campaign.total_tickets)::text, v_pad_len, '0')
            )
            ON CONFLICT DO NOTHING;

            SELECT count(*) INTO v_count FROM public.tickets WHERE order_id = p_order_id;
        END LOOP;
    ELSE
        SELECT count(*) INTO v_count FROM public.tickets WHERE order_id = p_order_id;
    END IF;

    UPDATE public.campaigns
    SET sold_tickets = (SELECT count(*) FROM public.tickets WHERE campaign_id = v_order.campaign_id AND status = 'confirmed')
    WHERE id = v_order.campaign_id;

    RETURN jsonb_build_object('success', true, 'message', 'Pedido auditado e corrigido. Total de tickets: ' || v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) Jogos opcionais (roleta, raspadinha, caixa misteriosa) e ferramentas de
--    diagnostico do admin: tambem ausentes/incompletas em producao. Restauradas
--    para que fiquem prontas caso sejam ativadas no futuro.
CREATE OR REPLACE FUNCTION public.reprocess_order_prizes(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_status TEXT;
    v_user_id UUID;
BEGIN
    SELECT payment_status, user_id INTO v_status, v_user_id FROM orders WHERE id = p_order_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pedido não encontrado');
    END IF;

    IF v_status != 'paid' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pedido ainda não está pago');
    END IF;

    PERFORM public.handle_order_payment(p_order_id);

    RETURN jsonb_build_object('success', true, 'message', 'Prêmios reprocessados com sucesso');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_order_inconsistencies()
RETURNS TABLE (
    id UUID,
    customer_name TEXT,
    quantity INTEGER,
    tickets_generated BIGINT,
    payment_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        p.name as customer_name,
        o.quantity,
        COUNT(t.id) as tickets_generated,
        o.payment_status
    FROM public.orders o
    LEFT JOIN public.profiles p ON o.user_id = p.user_id
    LEFT JOIN public.tickets t ON o.id = t.order_id
    WHERE o.payment_status = 'paid'
    GROUP BY o.id, p.name, o.quantity, o.payment_status
    HAVING COUNT(t.id) != o.quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.audit_all_paid_orders()
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_total_paid INTEGER := 0;
BEGIN
    FOR v_order_id IN SELECT id FROM public.orders WHERE payment_status = 'paid' LOOP
        v_total_paid := v_total_paid + 1;
        PERFORM public.repair_order(v_order_id);
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Auditoria completa realizada em ' || v_total_paid || ' pedidos pagos.',
        'total_audited', v_total_paid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.diagnose_table_permissions()
RETURNS TABLE (
  table_name TEXT,
  can_select BOOLEAN,
  can_insert BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN
) AS $$
DECLARE
  tables_to_check TEXT[] := ARRAY['site_settings', 'orders', 'tickets', 'campaigns', 'winners', 'user_roles', 'profiles'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables_to_check LOOP
    table_name := t;
    can_select := has_table_privilege('authenticated', 'public.' || t, 'SELECT');
    can_insert := has_table_privilege('authenticated', 'public.' || t, 'INSERT');
    can_update := has_table_privilege('authenticated', 'public.' || t, 'UPDATE');
    can_delete := has_table_privilege('authenticated', 'public.' || t, 'DELETE');
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.pay_with_balance(p_order_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_order_amount NUMERIC;
    v_user_balance NUMERIC;
    v_order_status TEXT;
BEGIN
    SELECT total_amount, payment_status
    INTO v_order_amount, v_order_status
    FROM orders
    WHERE id = p_order_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pedido não encontrado ou não pertence a este usuário');
    END IF;

    IF v_order_status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Este pedido já consta como pago');
    END IF;

    SELECT balance INTO v_user_balance FROM profiles WHERE user_id = p_user_id;

    IF v_user_balance < v_order_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Saldo insuficiente. Seu saldo atual é R$ ' || COALESCE(v_user_balance, 0));
    END IF;

    UPDATE profiles SET balance = balance - v_order_amount WHERE user_id = p_user_id;

    PERFORM public.handle_order_payment(p_order_id, 'balance_' || p_order_id::text, 'balance');

    RETURN jsonb_build_object('success', true, 'message', 'Pagamento realizado com sucesso via saldo!');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Erro inesperado: ' || SQLERRM);
END;
$function$;

DROP FUNCTION IF EXISTS public.process_roulette_spin(uuid, numeric);
CREATE OR REPLACE FUNCTION public.process_roulette_spin(p_campaign_id uuid, p_multiplier integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_campaign_record RECORD;
  v_spin_cost NUMERIC;
  v_total_cost NUMERIC;
  v_user_balance NUMERIC;
  v_selected_prize RECORD;
  v_random_val NUMERIC;
  v_final_value NUMERIC := 0;
  v_is_free BOOLEAN := FALSE;
  v_pre_awarded_spin_id UUID;
  v_prize_label TEXT := 'Tente novamente';
  v_prize_type TEXT := 'none';
  v_prize_color TEXT := '#ef4444';
  v_is_win BOOLEAN := FALSE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT * INTO v_campaign_record
  FROM public.campaigns
  WHERE id = p_campaign_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campanha não encontrada';
  END IF;

  IF NOT v_campaign_record.roulette_enabled THEN
    RAISE EXCEPTION 'Roleta desativada';
  END IF;

  IF p_multiplier < 1 OR p_multiplier > COALESCE(v_campaign_record.roulette_multiplier_max, 10) THEN
    RAISE EXCEPTION 'Multiplicador inválido';
  END IF;

  SELECT id INTO v_pre_awarded_spin_id
  FROM public.roulette_spins
  WHERE user_id = v_user_id
    AND campaign_id = p_campaign_id
    AND prize_label IS NULL
    AND is_free = TRUE
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_pre_awarded_spin_id IS NOT NULL THEN
    v_is_free := TRUE;
    v_total_cost := 0;
  ELSE
    v_spin_cost := COALESCE(v_campaign_record.roulette_spin_cost, 0);
    v_total_cost := v_spin_cost * p_multiplier;

    IF v_total_cost > 0 THEN
      SELECT balance INTO v_user_balance
      FROM public.profiles
      WHERE user_id = v_user_id;

      IF v_user_balance IS NULL OR v_user_balance < v_total_cost THEN
        RAISE EXCEPTION 'Saldo insuficiente';
      END IF;

      UPDATE public.profiles
      SET balance = balance - v_total_cost
      WHERE user_id = v_user_id;
    ELSIF v_spin_cost = 0 AND COALESCE(v_campaign_record.roulette_free_tickets, 0) > 0 THEN
      RAISE EXCEPTION 'Sem giros disponíveis';
    END IF;
  END IF;

  v_random_val := random() * 100;

  WITH configured_slots AS (
    SELECT
      rp.*,
      row_number() OVER (PARTITION BY rp.label ORDER BY rp.id) AS slot_number
    FROM public.roulette_prizes rp
    WHERE rp.campaign_id = p_campaign_id
      AND COALESCE(rp.chance_percent, 0) > 0
      AND rp.label IS NOT NULL
      AND rp.label <> 'Tente novamente'
      AND COALESCE(rp.prize_type, '') <> 'none'
  ), taken_by_label AS (
    SELECT
      rs.prize_label,
      count(*)::integer AS taken_count
    FROM public.roulette_spins rs
    WHERE rs.campaign_id = p_campaign_id
      AND rs.prize_label IS NOT NULL
      AND rs.prize_label <> 'Tente novamente'
      AND COALESCE(rs.prize_type, '') <> 'none'
    GROUP BY rs.prize_label
  ), available_slots AS (
    SELECT cs.*
    FROM configured_slots cs
    LEFT JOIN taken_by_label tb ON tb.prize_label = cs.label
    WHERE cs.slot_number > COALESCE(tb.taken_count, 0)
  ), weighted AS (
    SELECT
      available_slots.*,
      SUM(COALESCE(chance_percent, 0)) OVER (ORDER BY id) AS cumulative_weight
    FROM available_slots
  )
  SELECT * INTO v_selected_prize
  FROM weighted
  WHERE cumulative_weight >= v_random_val
  ORDER BY cumulative_weight ASC
  LIMIT 1;

  IF v_selected_prize IS NOT NULL THEN
    v_is_win := TRUE;
    v_prize_label := v_selected_prize.label;
    v_prize_type := v_selected_prize.prize_type;
    v_prize_color := COALESCE(v_selected_prize.color, '#FACC15');
    v_final_value := COALESCE(v_selected_prize.value, 0) * p_multiplier;
  END IF;

  IF v_pre_awarded_spin_id IS NOT NULL THEN
    UPDATE public.roulette_spins
    SET prize_label = v_prize_label,
        prize_type = v_prize_type,
        prize_value = v_final_value,
        created_at = now()
    WHERE id = v_pre_awarded_spin_id;
  ELSE
    INSERT INTO public.roulette_spins (user_id, campaign_id, prize_label, prize_type, prize_value, is_free)
    VALUES (v_user_id, p_campaign_id, v_prize_label, v_prize_type, v_final_value, FALSE);
  END IF;

  IF v_is_win THEN
    IF v_prize_type IN ('balance', 'fixed_value') THEN
      UPDATE public.profiles
      SET balance = balance + v_final_value
      WHERE user_id = v_user_id;
    ELSIF v_prize_type = 'points' THEN
      UPDATE public.profiles
      SET points = COALESCE(points, 0) + v_final_value::integer
      WHERE user_id = v_user_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'prize', CASE
      WHEN v_is_win THEN row_to_json(v_selected_prize)
      ELSE json_build_object('label', v_prize_label, 'prize_type', v_prize_type, 'color', v_prize_color)
    END,
    'final_value', v_final_value,
    'is_free', v_is_free,
    'new_balance', (SELECT balance FROM public.profiles WHERE user_id = v_user_id)
  );
END;
$function$;

DROP FUNCTION IF EXISTS public.process_scratch_card_play(uuid, numeric);
CREATE OR REPLACE FUNCTION public.process_scratch_card_play(p_campaign_id uuid, p_cost numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_id uuid;
    v_prize record;
    v_is_winner boolean := false;
    v_prize_id uuid := NULL;
    v_prize_label text := 'Tente novamente';
    v_prize_value numeric := 0;
    v_prize_type text := 'none';
    v_new_balance numeric;
    v_total_chance numeric := 0;
    v_random_val numeric;
    v_current_chance numeric := 0;
    v_credit_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Não autorizado';
    END IF;

    SELECT id INTO v_credit_id
    FROM public.scratch_card_scratches
    WHERE user_id = v_user_id
      AND (campaign_id = p_campaign_id OR (p_campaign_id IS NULL AND campaign_id IS NULL))
      AND prize_label IS NULL
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_credit_id IS NULL AND p_cost > 0 THEN
        SELECT balance INTO v_new_balance
        FROM public.profiles
        WHERE user_id = v_user_id
        FOR UPDATE;

        IF v_new_balance IS NULL OR v_new_balance < p_cost THEN
            RAISE EXCEPTION 'Saldo insuficiente';
        END IF;

        UPDATE public.profiles
        SET balance = balance - p_cost
        WHERE user_id = v_user_id;
    ELSIF v_credit_id IS NULL AND p_cost = 0 THEN
        RAISE EXCEPTION 'Você não possui raspadinhas disponíveis!';
    END IF;

    SELECT COALESCE(SUM(sp.chance_percent), 0) INTO v_total_chance
    FROM public.scratch_card_prizes sp
    WHERE sp.is_active = true
      AND COALESCE(sp.chance_percent, 0) > 0
      AND (sp.campaign_id = p_campaign_id OR (p_campaign_id IS NULL AND sp.campaign_id IS NULL))
      AND NOT EXISTS (
          SELECT 1
          FROM public.scratch_card_scratches s
          WHERE s.prize_id = sp.id
            AND s.is_winner = true
      );

    IF v_total_chance > 0 THEN
        v_random_val := random() * 100;

        IF v_random_val <= v_total_chance THEN
            FOR v_prize IN
                SELECT sp.*
                FROM public.scratch_card_prizes sp
                WHERE sp.is_active = true
                  AND COALESCE(sp.chance_percent, 0) > 0
                  AND (sp.campaign_id = p_campaign_id OR (p_campaign_id IS NULL AND sp.campaign_id IS NULL))
                  AND NOT EXISTS (
                      SELECT 1
                      FROM public.scratch_card_scratches s
                      WHERE s.prize_id = sp.id
                        AND s.is_winner = true
                  )
                ORDER BY sp.created_at ASC, sp.id ASC
                FOR UPDATE SKIP LOCKED
            LOOP
                v_current_chance := v_current_chance + COALESCE(v_prize.chance_percent, 0);
                IF v_random_val <= v_current_chance THEN
                    v_is_winner := true;
                    v_prize_id := v_prize.id;
                    v_prize_label := v_prize.label;
                    v_prize_value := COALESCE(v_prize.value, 0);
                    v_prize_type := COALESCE(v_prize.prize_type, 'none');
                    EXIT;
                END IF;
            END LOOP;
        END IF;
    END IF;

    IF v_is_winner THEN
        IF v_prize_type IN ('balance', 'cash', 'fixed_value') THEN
            UPDATE public.profiles
            SET balance = balance + v_prize_value
            WHERE user_id = v_user_id;
        ELSIF v_prize_type = 'points' THEN
            UPDATE public.profiles
            SET points = COALESCE(points, 0) + v_prize_value::integer
            WHERE user_id = v_user_id;
        END IF;
    END IF;

    IF v_credit_id IS NOT NULL THEN
        UPDATE public.scratch_card_scratches
        SET prize_id = v_prize_id,
            prize_label = v_prize_label,
            prize_value = v_prize_value,
            prize_type = v_prize_type,
            is_winner = v_is_winner,
            created_at = now()
        WHERE id = v_credit_id;
    ELSE
        INSERT INTO public.scratch_card_scratches (
            user_id, prize_id, prize_label, prize_value, prize_type, cost, is_winner, campaign_id
        ) VALUES (
            v_user_id, v_prize_id, v_prize_label, v_prize_value, v_prize_type, p_cost, v_is_winner, p_campaign_id
        );
    END IF;

    SELECT balance INTO v_new_balance
    FROM public.profiles
    WHERE user_id = v_user_id;

    RETURN json_build_object(
        'is_winner', v_is_winner,
        'prize', json_build_object(
            'id', v_prize_id,
            'label', v_prize_label,
            'value', v_prize_value,
            'prize_type', v_prize_type
        ),
        'new_balance', v_new_balance
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_mystery_box_open(p_config_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_id uuid;
    v_box record;
    v_prize record;
    v_user_balance numeric;
    v_total_chance numeric := 0;
    v_random_val numeric;
    v_current_chance numeric := 0;
    v_win_id uuid;
    v_new_balance numeric;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Entre para abrir caixas!';
    END IF;

    SELECT mbc.*, c.mystery_box_enabled
    INTO v_box
    FROM public.mystery_box_configs mbc
    JOIN public.campaigns c ON c.id = mbc.campaign_id
    WHERE mbc.id = p_config_id
      AND mbc.is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caixa indisponível no momento';
    END IF;

    IF NOT COALESCE(v_box.mystery_box_enabled, false) THEN
        RAISE EXCEPTION 'Caixa desativada nesta campanha';
    END IF;

    SELECT COALESCE(SUM(mbp.chance_percent), 0) INTO v_total_chance
    FROM public.mystery_box_prizes mbp
    WHERE mbp.config_id = p_config_id
      AND COALESCE(mbp.chance_percent, 0) > 0
      AND NOT EXISTS (
          SELECT 1
          FROM public.mystery_box_wins mbw
          WHERE mbw.prize_id = mbp.id
      );

    IF v_total_chance <= 0 THEN
        RAISE EXCEPTION 'Todos os prêmios desta caixa já foram contemplados';
    END IF;

    SELECT balance INTO v_user_balance
    FROM public.profiles
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_user_balance IS NULL OR v_user_balance < COALESCE(v_box.cost, 0) THEN
        RAISE EXCEPTION 'Saldo insuficiente!';
    END IF;

    v_random_val := random() * v_total_chance;

    FOR v_prize IN
        SELECT mbp.*
        FROM public.mystery_box_prizes mbp
        WHERE mbp.config_id = p_config_id
          AND COALESCE(mbp.chance_percent, 0) > 0
          AND NOT EXISTS (
              SELECT 1
              FROM public.mystery_box_wins mbw
              WHERE mbw.prize_id = mbp.id
          )
        ORDER BY mbp.created_at ASC, mbp.id ASC
        FOR UPDATE SKIP LOCKED
    LOOP
        v_current_chance := v_current_chance + COALESCE(v_prize.chance_percent, 0);
        IF v_random_val <= v_current_chance THEN
            EXIT;
        END IF;
    END LOOP;

    IF v_prize.id IS NULL THEN
        RAISE EXCEPTION 'Nenhum prêmio disponível nesta caixa';
    END IF;

    IF COALESCE(v_box.cost, 0) > 0 THEN
        UPDATE public.profiles
        SET balance = balance - v_box.cost
        WHERE user_id = v_user_id;
    END IF;

    INSERT INTO public.mystery_box_wins (
        user_id, box_id, config_id, prize_id, prize_title, prize_value
    ) VALUES (
        v_user_id, p_config_id, p_config_id, v_prize.id, v_prize.title, v_prize.prize_value
    )
    RETURNING id INTO v_win_id;

    IF v_prize.prize_type IN ('balance', 'cash', 'fixed_value') THEN
        UPDATE public.profiles
        SET balance = balance + COALESCE(v_prize.prize_value, 0)
        WHERE user_id = v_user_id;
    ELSIF v_prize.prize_type = 'points' THEN
        UPDATE public.profiles
        SET points = COALESCE(points, 0) + COALESCE(v_prize.prize_value, 0)::integer
        WHERE user_id = v_user_id;
    END IF;

    SELECT balance INTO v_new_balance
    FROM public.profiles
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object(
        'win_id', v_win_id,
        'new_balance', v_new_balance,
        'prize', jsonb_build_object(
            'id', v_prize.id,
            'title', v_prize.title,
            'description', v_prize.description,
            'prize_type', v_prize.prize_type,
            'prize_value', v_prize.prize_value,
            'image_url', v_prize.image_url,
            'rarity', v_prize.rarity
        )
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_campaign_mystery_box_wins(p_campaign_id uuid, p_limit integer DEFAULT 200)
RETURNS TABLE(id uuid, config_id uuid, box_name text, prize_title text, prize_value numeric, created_at timestamp with time zone, winner_name text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    w.id,
    w.config_id,
    c.name AS box_name,
    w.prize_title,
    w.prize_value,
    w.created_at,
    COALESCE(NULLIF(p.name, ''), 'Ganhador') AS winner_name,
    p.avatar_url
  FROM public.mystery_box_wins w
  INNER JOIN public.mystery_box_configs c ON c.id = w.config_id
  LEFT JOIN public.profiles p ON p.user_id = w.user_id
  WHERE c.campaign_id = p_campaign_id
  ORDER BY w.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 500));
$function$;

GRANT EXECUTE ON FUNCTION public.get_campaign_mystery_box_wins(uuid, integer) TO anon, authenticated, service_role;

-- get_campaign_roulette_wins / get_campaign_scratch_wins: sem migration original
-- (nunca foram versionadas); reconstruidas seguindo o mesmo padrao da funcao
-- irmã (get_campaign_mystery_box_wins) acima.
CREATE OR REPLACE FUNCTION public.get_campaign_roulette_wins(p_campaign_id uuid, p_limit integer DEFAULT 200)
RETURNS TABLE(id uuid, campaign_id uuid, prize_label text, prize_type text, prize_value numeric, is_free boolean, created_at timestamp with time zone, winner_name text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    rs.id,
    rs.campaign_id,
    rs.prize_label,
    rs.prize_type,
    rs.prize_value,
    rs.is_free,
    rs.created_at,
    COALESCE(NULLIF(p.name, ''), 'Ganhador') AS winner_name,
    p.avatar_url
  FROM public.roulette_spins rs
  LEFT JOIN public.profiles p ON p.user_id = rs.user_id
  WHERE rs.campaign_id = p_campaign_id
    AND rs.prize_label IS NOT NULL
    AND rs.prize_label <> 'Tente novamente'
    AND COALESCE(rs.prize_type, 'none') <> 'none'
  ORDER BY rs.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 500));
$function$;

GRANT EXECUTE ON FUNCTION public.get_campaign_roulette_wins(uuid, integer) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_campaign_scratch_wins(p_campaign_id uuid, p_limit integer DEFAULT 200)
RETURNS TABLE(id uuid, campaign_id uuid, prize_label text, prize_type text, prize_value numeric, created_at timestamp with time zone, winner_name text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    s.id,
    s.campaign_id,
    s.prize_label,
    s.prize_type,
    s.prize_value,
    s.created_at,
    COALESCE(NULLIF(p.name, ''), 'Ganhador') AS winner_name,
    p.avatar_url
  FROM public.scratch_card_scratches s
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  WHERE s.campaign_id = p_campaign_id
    AND s.is_winner = true
  ORDER BY s.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 200), 500));
$function$;

GRANT EXECUTE ON FUNCTION public.get_campaign_scratch_wins(uuid, integer) TO anon, authenticated, service_role;

-- run_lucky_hour_draw: ausente em producao. Corpo original tinha um bug latente
-- (JOIN profiles p ON t.user_id = p.id, quando deveria ser p.user_id) que nunca
-- acharia ganhador; corrigido aqui.
CREATE OR REPLACE FUNCTION public.run_lucky_hour_draw(p_lucky_hour_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lucky_hour RECORD;
    v_campaign RECORD;
    v_winner_name TEXT;
    v_winner_number TEXT;
BEGIN
    SELECT * INTO v_lucky_hour FROM lucky_hours WHERE id = p_lucky_hour_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sorteio não encontrado.');
    END IF;

    IF v_lucky_hour.status = 'completed' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Este sorteio já foi realizado.');
    END IF;

    SELECT * INTO v_campaign FROM campaigns WHERE id = v_lucky_hour.campaign_id;

    IF v_lucky_hour.draw_type = 'hourly' THEN
        SELECT t.number, p.name INTO v_winner_number, v_winner_name
        FROM tickets t
        JOIN profiles p ON t.user_id = p.user_id
        WHERE t.campaign_id = v_lucky_hour.campaign_id
          AND t.status IN ('confirmed', 'paid')
        ORDER BY random()
        LIMIT 1;
    ELSIF v_lucky_hour.draw_type = 'greater_smaller' THEN
        IF v_lucky_hour.title ILIKE '%menor%' OR v_lucky_hour.prize_description ILIKE '%menor%' THEN
            SELECT t.number, p.name INTO v_winner_number, v_winner_name
            FROM tickets t
            JOIN profiles p ON t.user_id = p.user_id
            WHERE t.campaign_id = v_lucky_hour.campaign_id
              AND t.status IN ('confirmed', 'paid')
            ORDER BY t.number ASC
            LIMIT 1;
        ELSE
            SELECT t.number, p.name INTO v_winner_number, v_winner_name
            FROM tickets t
            JOIN profiles p ON t.user_id = p.user_id
            WHERE t.campaign_id = v_lucky_hour.campaign_id
              AND t.status IN ('confirmed', 'paid')
            ORDER BY t.number DESC
            LIMIT 1;
        END IF;
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Tipo de sorteio desconhecido.');
    END IF;

    IF v_winner_name IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Nenhum bilhete vendido encontrado para esta campanha.');
    END IF;

    UPDATE lucky_hours
    SET
        winner_name = v_winner_name,
        winning_number = v_winner_number,
        status = 'completed',
        is_approved = true,
        approved_at = now(),
        updated_at = now(),
        audit_log = COALESCE(audit_log, '[]'::jsonb) || jsonb_build_object(
            'timestamp', now(),
            'action', 'auto_draw',
            'details', jsonb_build_object(
                'winner_name', v_winner_name,
                'winning_number', v_winner_number
            )
        )
    WHERE id = p_lucky_hour_id;

    INSERT INTO winners (
        campaign_id, winner_name, ticket_number, prize_description, draw_date, winner_type
    ) VALUES (
        v_lucky_hour.campaign_id, v_winner_name, v_winner_number, v_lucky_hour.prize_description, now(), 'lucky_number'
    );

    RETURN jsonb_build_object(
        'success', true,
        'winner_name', v_winner_name,
        'winning_number', v_winner_number
    );
END;
$$;

-- 5) Views publicas usadas na home (feeds de ganhadores) — ausentes em producao.
DROP VIEW IF EXISTS public.roulette_spins_public;
CREATE VIEW public.roulette_spins_public AS
  SELECT
    rs.id,
    rs.campaign_id,
    rs.prize_label,
    rs.prize_type,
    rs.prize_value,
    rs.is_free,
    rs.created_at,
    COALESCE(NULLIF(p.name, ''), 'Ganhador') AS winner_name,
    p.avatar_url
  FROM public.roulette_spins rs
  LEFT JOIN public.profiles p ON p.user_id = rs.user_id
  WHERE rs.prize_label IS NOT NULL
    AND rs.prize_label <> 'Tente novamente'
    AND COALESCE(rs.prize_type, 'none') <> 'none';
GRANT SELECT ON public.roulette_spins_public TO anon, authenticated;

DROP VIEW IF EXISTS public.scratch_card_scratches_public;
CREATE VIEW public.scratch_card_scratches_public AS
  SELECT
    s.id,
    s.campaign_id,
    s.prize_label,
    s.prize_type,
    s.prize_value,
    s.is_winner,
    s.created_at,
    COALESCE(NULLIF(p.name, ''), 'Ganhador') AS winner_name,
    p.avatar_url
  FROM public.scratch_card_scratches s
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  WHERE s.is_winner = true;
GRANT SELECT ON public.scratch_card_scratches_public TO anon, authenticated;

-- 6) Protecao do campo balance contra alteracao pelo proprio cliente (trigger
--    que ja havia sido corrigida via SQL direto em 2026-07-01, agora versionada).
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $func$
BEGIN
  IF auth.role() = 'authenticated' AND NOT public.is_admin(auth.uid()) THEN
    NEW.balance = OLD.balance;
    NEW.points = OLD.points;
    NEW.xp = OLD.xp;
    NEW.vip_level = OLD.vip_level;
    NEW.cashback_balance = OLD.cashback_balance;
  END IF;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trigger_protect_profile_fields ON public.profiles;
CREATE TRIGGER trigger_protect_profile_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_fields();

DROP POLICY IF EXISTS "admins_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update profiles except master" ON public.profiles;
DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;

CREATE POLICY "Admins update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
