-- Fix: recurso de Saque (WithdrawModal) estava quebrado.
--
-- O WithdrawModal fazia (1) INSERT direto em wallet_transactions — bloqueado
-- porque a tabela so tem policy de SELECT (users_own_wallet), sem INSERT — e
-- (2) UPDATE direto de balance — corretamente bloqueado pela trigger
-- protect_profile_fields. Resultado: saque nunca funcionava.
--
-- Solucao: funcao SECURITY DEFINER que valida saldo/minimo no servidor, desconta
-- o saldo (permitido dentro de definer) e registra a solicitacao como 'pending'
-- para o admin processar. Nunca confia no valor vindo do cliente sem revalidar.

CREATE OR REPLACE FUNCTION public.request_withdrawal(p_amount numeric, p_pix_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_id uuid;
    v_balance numeric;
    v_min numeric;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Não autenticado');
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Informe um valor válido para saque');
    END IF;

    IF p_pix_key IS NULL OR btrim(p_pix_key) = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Informe sua chave PIX para recebimento');
    END IF;

    -- valor minimo configuravel (site_settings.min_withdrawal_amount, default 50)
    SELECT COALESCE(NULLIF(value, '')::numeric, 50) INTO v_min
    FROM public.site_settings WHERE key = 'min_withdrawal_amount';
    v_min := COALESCE(v_min, 50);

    IF p_amount < v_min THEN
        RETURN jsonb_build_object('success', false, 'message', 'O valor mínimo para saque é R$ ' || v_min);
    END IF;

    -- trava a linha do perfil para evitar corrida (dois saques simultaneos)
    SELECT balance INTO v_balance
    FROM public.profiles
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_balance IS NULL OR v_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Saldo insuficiente para realizar este saque');
    END IF;

    -- desconta o saldo (dentro de SECURITY DEFINER: current_user = owner, trigger nao reverte)
    UPDATE public.profiles
    SET balance = balance - p_amount
    WHERE user_id = v_user_id;

    -- registra a solicitacao pendente para o admin processar
    INSERT INTO public.wallet_transactions (user_id, amount, type, status, pix_key, description)
    VALUES (v_user_id, p_amount, 'withdrawal', 'pending', p_pix_key, 'Solicitação de Saque');

    RETURN jsonb_build_object('success', true, 'message', 'Solicitação de saque enviada! O valor será processado em breve.');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Erro ao processar saque: ' || SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric, text) TO authenticated;
