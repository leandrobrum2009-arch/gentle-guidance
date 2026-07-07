-- Fix critico: protect_profile_fields estava sem a guarda current_user =
-- 'authenticated'. A migration 20260702050000 (aplicada mais cedo hoje) recriou
-- a funcao sem essa guarda, o que fazia a protecao reverter QUALQUER alteracao
-- de saldo durante uma requisicao de usuario logado nao-admin — inclusive dentro
-- de funcoes SECURITY DEFINER legitimas:
--   * process_roulette_spin / process_scratch_card_play / process_mystery_box_open
--     (custo e premio de saldo eram revertidos -> jogos quebrados)
--   * pay_with_balance (o desconto era revertido, mas o pedido era marcado pago
--     e os bilhetes confirmados -> bilhete gratis, risco financeiro)
--
-- A guarda current_user = 'authenticated' faz a protecao valer apenas para
-- updates diretos do cliente via REST (onde current_user = 'authenticated'),
-- e NAO para updates feitos dentro de funcoes SECURITY DEFINER (onde current_user
-- e o dono da funcao, ex. postgres). Isto restaura o comportamento da ultima
-- versao boa de producao (migration 20260626162524).
--
-- Verificado com testes (nao-admin):
--   * update direto do cliente para balance=9999 -> revertido (protegido) OK
--   * credito de saldo via funcao SECURITY DEFINER -> aplicado (permitido) OK

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $func$
BEGIN
  IF auth.role() = 'authenticated' AND NOT public.is_admin(auth.uid()) THEN
    IF current_user = 'authenticated' THEN
      NEW.balance = OLD.balance;
      NEW.points = OLD.points;
      NEW.xp = OLD.xp;
      NEW.vip_level = OLD.vip_level;
      NEW.cashback_balance = OLD.cashback_balance;
    END IF;
  END IF;
  RETURN NEW;
END;
$func$;
