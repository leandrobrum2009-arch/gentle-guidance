import AdminLayout from "@/components/AdminLayout";
import { useAdminOrders } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminOrders();

  const statusLabel: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    expired: "Expirado",
    cancelled: "Cancelado",
  };

  const statusVariant = (s: string) =>
    s === "paid" ? "default" : s === "pending" ? "secondary" : "outline";

  return (
    <AdminLayout>
      <h1 className="mb-6 font-display text-2xl font-bold">Pedidos</h1>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !orders?.length ? (
            <p className="p-6 text-center text-muted-foreground">Nenhum pedido encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-sm">
                      {format(new Date(o.created_at), "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{o.campaigns?.title ?? "—"}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell>R$ {Number(o.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(o.payment_status)}>
                        {statusLabel[o.payment_status] ?? o.payment_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
