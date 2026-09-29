import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/data";
import { LOW_STOCK } from "@/lib/admin";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "summary"],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const [today, all, low] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", start.toISOString()),
        supabase.from("orders").select("total").neq("status", "iptal"),
        supabase.from("product_variants").select("size, stock, products(id, name)").lte("stock", LOW_STOCK).order("stock"),
      ]);
      return {
        todayCount: today.count ?? 0,
        revenue: (all.data ?? []).reduce((s, o) => s + Number(o.total), 0),
        lowStock: low.data ?? [],
      };
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Özet</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Bugünkü sipariş" value={String(data?.todayCount ?? "–")} />
        <Stat label="Toplam ciro (iptaller hariç)" value={data ? formatPrice(data.revenue) : "–"} />
        <Stat label={`Düşük stok (≤${LOW_STOCK})`} value={String(data?.lowStock.length ?? "–")} />
      </div>
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">Düşük stoklu ürünler</h2>
        {data?.lowStock.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {data.lowStock.map((v, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <Link to="/admin/urunler" className="hover:text-gold">{v.products?.name ?? "Ürün"} · {v.size}</Link>
                <span className={v.stock === 0 ? "text-destructive" : "text-gold"}>{v.stock} adet</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Düşük stoklu ürün yok.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
