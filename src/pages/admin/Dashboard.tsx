import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminCampaigns, useAdminOrders } from "@/hooks/useAdmin";
import { Loader2, Megaphone, ShoppingCart, DollarSign, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: campaigns, isLoading: lc } = useAdminCampaigns();
  const { data: orders, isLoading: lo } = useAdminOrders();

  const loading = lc || lo;

  const totalRevenue = orders?.reduce((s, o) => s + (o.payment_status === "paid" ? Number(o.total_amount) : 0), 0) ?? 0;
  const pendingOrders = orders?.filter((o) => o.payment_status === "pending").length ?? 0;
  const activeCampaigns = campaigns?.filter((c) => c.status === "active").length ?? 0;

  const stats = [
    { label: "Campanhas Ativas", value: activeCampaigns, icon: Megaphone, color: "text-primary" },
    { label: "Pedidos Pendentes", value: pendingOrders, icon: ShoppingCart, color: "text-warning" },
    { label: "Receita Total", value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-success" },
    { label: "Total Pedidos", value: orders?.length ?? 0, icon: Users, color: "text-info" },
  ];

  return (
    <AdminLayout>
      <h1 className="mb-6 font-display text-2xl font-bold">Dashboard</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
