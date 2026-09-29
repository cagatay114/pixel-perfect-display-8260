import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatPrice } from "@/lib/data";
import { ORDER_STATUSES, statusLabel } from "@/lib/admin";
import { deleteOrders } from "@/lib/orders.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Status = Database["public"]["Enums"]["order_status"];

export const Route = createFileRoute("/admin/siparisler")({ component: Orders });

function Orders() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Status | "">("");
  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
      if (filter) q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Siparişler</h1>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as Status | "")}>
          <option value="">Tüm durumlar</option>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz sipariş yok. Ödeme adımı eklendiğinde siparişler burada görünecek.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">No</th><th className="p-3">Tarih</th><th className="p-3">Müşteri</th><th className="p-3">Tutar</th><th className="p-3">Durum</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => setOpenId(o.id)}>
                  <td className="p-3">#{o.order_number}</td>
                  <td className="p-3">{new Date(o.created_at).toLocaleString("tr-TR")}</td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3">{formatPrice(Number(o.total))}</td>
                  <td className="p-3 text-gold">{statusLabel(o.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">{openId && <OrderDetail id={openId} />}</DialogContent>
      </Dialog>
    </div>
  );
}

function OrderDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const [status, setStatus] = useState<Status | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);
  if (!data) return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;

  async function save() {
    const { error } = await supabase
      .from("orders")
      .update({ status: status ?? data!.status, tracking_number: (tracking ?? data!.tracking_number ?? "").trim() || null })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Sipariş güncellendi");
    qc.invalidateQueries({ queryKey: ["admin"] });
  }

  return (
    <div className="space-y-4 text-sm">
      <DialogHeader><DialogTitle>Sipariş #{data.order_number}</DialogTitle></DialogHeader>
      <div className="space-y-1 text-muted-foreground">
        <p className="text-foreground">{data.customer_name}</p>
        <p>{data.email} · {data.phone}</p>
        <p>{data.address} {data.city}</p>
        <p>Ödeme: {data.payment_method === "kapida" ? "Kapıda ödeme" : "Kart"}</p>
        {data.note && <p>Not: {data.note}</p>}
      </div>
      <ul className="divide-y divide-border rounded-md border border-border">
        {data.order_items.map((it) => (
          <li key={it.id} className="flex justify-between px-3 py-2">
            <span>{it.product_name} · {it.size} {it.color && `· ${it.color}`} × {it.quantity}</span>
            <span>{formatPrice(Number(it.unit_price) * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1 text-right">
        <p>Ara toplam: {formatPrice(Number(data.subtotal))}</p>
        <p>Kargo: {formatPrice(Number(data.shipping_fee))}</p>
        <p className="font-medium">Toplam: {formatPrice(Number(data.total))}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <select className="h-9 rounded-md border border-input bg-background px-3" value={status ?? data.status} onChange={(e) => setStatus(e.target.value as Status)}>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <Input placeholder="Kargo takip no" value={tracking ?? data.tracking_number ?? ""} onChange={(e) => setTracking(e.target.value)} />
      </div>
      <Button className="w-full" onClick={save}>Kaydet</Button>
    </div>
  );
}
