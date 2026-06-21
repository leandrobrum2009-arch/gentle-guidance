import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Wallet, Ticket, Trophy, Bell, LogOut, ArrowDownLeft, ArrowUpRight,
  Plus, Minus, ChevronRight, Home, Gift, Settings, Copy, Share2, Loader2, ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  useUserOrders, useUserWalletTransactions, useUserNotifications,
  useUserPrizesByCampaign, useSiteSettings, markNotificationsAsRead,
} from "@/hooks/useData";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SEO } from "@/components/SEO";
import HeaderInline from "@/components/HeaderInline";
import FooterInline from "@/components/inline/FooterInline";
import { DepositModal } from "@/components/DepositModal";
import { WithdrawModal } from "@/components/WithdrawModal";

type TabKey = "home" | "bilhetes" | "premios" | "perfil";

const fmtBRL = (n: number | string | null | undefined) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AccountInline() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsAdmin();
  const { data: siteSettings } = useSiteSettings();

  const { data: orders } = useUserOrders(user?.id || "");
  const { data: txs } = useUserWalletTransactions(user?.id || "");
  const { data: notifications } = useUserNotifications(user?.id || "");
  const { data: prizesData } = useUserPrizesByCampaign(user?.id || "");

  const [profile, setProfile] = useState<any>(null);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("home");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      const { data: a } = await supabase.from("affiliates").select("*").eq("user_id", user.id).maybeSingle();
      setProfile(p); setAffiliate(a); setLoading(false);
    })();
  }, [user]);

  const balance = Number(profile?.balance || 0);
  const unreadCount = (notifications || []).filter((n: any) => !n.read).length;
  const prizes = Array.isArray(prizesData) ? prizesData : [];
  const paidOrders = (orders || []).filter((o: any) => o.payment_status === "paid");

  const copyReferral = async () => {
    if (!affiliate?.referral_code) return toast.error("Você ainda não possui código de indicação.");
    const link = `${window.location.origin}/?ref=${affiliate.referral_code}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markNotificationsAsRead(user.id);
    queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
    toast.success("Notificações marcadas como lidas");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Minha Conta" description="Painel do usuário" />
      <HeaderInline />

      <main className="pt-[calc(var(--header-height,64px)+0.75rem)] pb-32 px-4 space-y-5">
        {/* USER CARD */}
        <section className="rounded-2xl bg-gradient-to-br from-primary/15 via-card to-card border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xl shrink-0 overflow-hidden">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                : (profile?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-black truncate">{profile?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-background/60 border border-border p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Seu saldo</p>
            <p className="text-3xl font-black mt-1">{fmtBRL(balance)}</p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Button
                onClick={() => setDepositOpen(true)}
                className="h-12 rounded-xl text-sm font-black gap-2"
              >
                <Plus className="h-4 w-4" /> Depositar
              </Button>
              <Button
                onClick={() => setWithdrawOpen(true)}
                variant="outline"
                className="h-12 rounded-xl text-sm font-black gap-2"
              >
                <Minus className="h-4 w-4" /> Sacar
              </Button>
            </div>
          </div>
        </section>

        {tab === "home" && (
          <>
            {/* QUICK STATS */}
            <section className="grid grid-cols-3 gap-2.5">
              <StatCard icon={Ticket} label="Bilhetes" value={paidOrders.length} />
              <StatCard icon={Trophy} label="Prêmios" value={prizes.length} />
              <StatCard icon={Bell} label="Avisos" value={unreadCount} highlight={unreadCount > 0} />
            </section>

            {/* NOTIFICATIONS */}
            <section className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase tracking-wide">Notificações</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[11px] font-bold text-primary">
                    Marcar todas
                  </button>
                )}
              </div>
              {(notifications || []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma notificação.</p>
              ) : (
                <div className="space-y-2">
                  {(notifications || []).slice(0, 4).map((n: any) => (
                    <div key={n.id} className={`rounded-xl p-3 border ${n.read ? "border-border bg-background/40" : "border-primary/30 bg-primary/5"}`}>
                      <p className="text-sm font-bold">{n.title}</p>
                      {n.message && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* RECENT TRANSACTIONS */}
            <section className="rounded-2xl bg-card border border-border p-4">
              <h3 className="text-sm font-black uppercase tracking-wide mb-3">Últimas movimentações</h3>
              {(txs || []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Sem movimentações ainda.</p>
              ) : (
                <div className="space-y-2">
                  {(txs || []).slice(0, 5).map((t: any) => {
                    const credit = Number(t.amount) >= 0;
                    const Icon = credit ? ArrowDownLeft : ArrowUpRight;
                    return (
                      <div key={t.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${credit ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{t.description || t.type || "Transação"}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(t.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <p className={`text-sm font-black ${credit ? "text-emerald-500" : "text-rose-500"}`}>
                          {credit ? "+" : ""}{fmtBRL(t.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {tab === "bilhetes" && (
          <section className="rounded-2xl bg-card border border-border p-4">
            <h3 className="text-sm font-black uppercase tracking-wide mb-3">Meus bilhetes</h3>
            {paidOrders.length === 0 ? (
              <EmptyState icon={Ticket} text="Você ainda não tem bilhetes pagos." cta="Ver campanhas" to="/" />
            ) : (
              <div className="space-y-2">
                {paidOrders.map((o: any) => (
                  <Link
                    key={o.id}
                    to={`/campanha/${o.campaign_id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 hover:border-primary/40 transition-colors"
                  >
                    {o.campaigns?.image_url && (
                      <img src={o.campaigns.image_url} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{o.campaigns?.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {(o.tickets || []).length} bilhete(s) · {fmtBRL(o.total)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "premios" && (
          <section className="rounded-2xl bg-card border border-border p-4">
            <h3 className="text-sm font-black uppercase tracking-wide mb-3">Meus prêmios</h3>
            {prizes.length === 0 ? (
              <EmptyState icon={Trophy} text="Nenhum prêmio ainda. Boa sorte!" cta="Jogar agora" to="/roleta-premiada" />
            ) : (
              <div className="space-y-2">
                {prizes.map((p: any) => (
                  <div key={p.campaign?.id} className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-sm font-bold truncate">{p.campaign?.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {p.mainPrize ? `Número premiado: ${p.mainPrize.number}` : `${(p.spins?.length || 0) + (p.scratches?.length || 0) + (p.boxes?.length || 0)} prêmio(s)`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "perfil" && (
          <section className="space-y-3">
            <div className="rounded-2xl bg-card border border-border p-4 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Nome</p>
              <p className="text-sm font-bold">{profile?.name || "—"}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-4 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">E-mail</p>
              <p className="text-sm font-bold break-all">{user?.email}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-4 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">CPF</p>
              <p className="text-sm font-bold">{profile?.cpf || "—"}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-4 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">WhatsApp</p>
              <p className="text-sm font-bold">{profile?.phone || "—"}</p>
            </div>

            {affiliate?.referral_code && (
              <div className="rounded-2xl bg-primary/5 border border-primary/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Seu código de indicação</p>
                <p className="text-base font-black mt-1">{affiliate.referral_code}</p>
                <Button onClick={copyReferral} variant="outline" className="mt-3 w-full h-11 rounded-xl gap-2 text-xs font-black">
                  <Copy className="h-4 w-4" /> Copiar link
                </Button>
              </div>
            )}

            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="w-full h-12 rounded-xl gap-2 text-sm font-black">
                  <ShieldCheck className="h-4 w-4" /> Painel Admin
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              className="w-full h-12 rounded-xl gap-2 text-sm font-black text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 border-rose-500/30"
              onClick={async () => { await signOut(); navigate("/"); }}
            >
              <LogOut className="h-4 w-4" /> Sair da conta
            </Button>
          </section>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="grid grid-cols-4">
          <TabButton icon={Home} label="Início" active={tab === "home"} onClick={() => setTab("home")} />
          <TabButton icon={Ticket} label="Bilhetes" active={tab === "bilhetes"} onClick={() => setTab("bilhetes")} />
          <TabButton icon={Trophy} label="Prêmios" active={tab === "premios"} onClick={() => setTab("premios")} />
          <TabButton icon={User} label="Perfil" active={tab === "perfil"} onClick={() => setTab("perfil")} />
        </div>
      </nav>

      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} balance={balance} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }: any) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
      <Icon className={`h-5 w-5 mx-auto mb-1.5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <p className="text-lg font-black leading-none">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-3 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
}

function EmptyState({ icon: Icon, text, cta, to }: any) {
  return (
    <div className="py-8 text-center">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{text}</p>
      <Link to={to}>
        <Button className="h-11 rounded-xl px-6 text-xs font-black uppercase tracking-wider">{cta}</Button>
      </Link>
    </div>
  );
}