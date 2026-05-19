import AdminLayout from "@/components/AdminLayout";
import { useAdminBanners } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminBanners() {
  const { data: banners, isLoading } = useAdminBanners();

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Banners Promocionais</h1>
          <p className="text-muted-foreground mt-1">Gerencie os banners do carrossel da página inicial.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-foreground font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none">
          <Plus className="mr-2 h-4 w-4" /> Novo Banner
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : banners?.map((banner) => (
          <Card key={banner.id} className="border-border bg-card/50 backdrop-blur-xl overflow-hidden group">
            <div className="aspect-[21/9] w-full relative overflow-hidden bg-slate-900">
              <img 
                src={banner.image_url} 
                alt={banner.title} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] to-transparent opacity-60" />
              <div className="absolute top-2 right-2">
                <Badge className={banner.is_active ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20" : "bg-secondary/500/20 text-muted-foreground border-slate-500/20"}>
                  {banner.is_active ? "ATIVO" : "INATIVO"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground tracking-tight">{banner.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{banner.subtitle || "Sem subtítulo"}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-card/10">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                  <ExternalLink className="h-3 w-3" />
                  Link: {banner.link_url ? banner.link_url.substring(0, 20) + '...' : 'Nenhum'}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ordem: {banner.order_index}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && banners?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl">
            <ImageIcon className="h-12 w-12 text-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium font-display">Nenhum banner cadastrado ainda.</p>
            <Button variant="link" className="text-primary mt-2">Clique aqui para criar o primeiro</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
