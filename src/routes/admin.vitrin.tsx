import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type DragEvent } from "react";
import { GripVertical, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/vitrin")({ component: StorefrontManager });

const adminRailsQuery = {
  queryKey: ["admin", "storefront-rails"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("storefront_rails")
      .select("*, storefront_rail_products(product_id, sort_order)")
      .order("sort_order");
    if (error) throw error;
    return data;
  },
};

const railProductsQuery = {
  queryKey: ["admin", "storefront-products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, images, price, is_active")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return data;
  },
};

type RailRow = NonNullable<Awaited<ReturnType<typeof adminRailsQuery.queryFn>>>[number];
type Draft = {
  id?: string;
  name: string;
  href: string;
  minProducts: number;
  maxProducts: number;
  isActive: boolean;
  productIds: string[];
};

const emptyDraft = (): Draft => ({
  name: "",
  href: "yeni-gelenler",
  minProducts: 4,
  maxProducts: 8,
  isActive: true,
  productIds: [],
});

function toDraft(rail: RailRow): Draft {
  return {
    id: rail.id,
    name: rail.name,
    href: rail.href,
    minProducts: rail.min_products,
    maxProducts: rail.max_products,
    isActive: rail.is_active,
    productIds: [...rail.storefront_rail_products]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => item.product_id),
  };
}

function StorefrontManager() {
  const queryClient = useQueryClient();
  const { data: rails = [] } = useQuery(adminRailsQuery);
  const { data: products = [] } = useQuery(railProductsQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState<string | null>(null);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const availableProducts = useMemo(() => {
    const value = search.trim().toLocaleLowerCase("tr-TR");
    return products.filter((product) => !draft?.productIds.includes(product.id) && (!value || product.name.toLocaleLowerCase("tr-TR").includes(value)));
  }, [draft?.productIds, products, search]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "storefront-rails"] });
    queryClient.invalidateQueries({ queryKey: ["storefront-rails"] });
  };

  async function save() {
    if (!draft?.name.trim()) { toast.error("Vitrin adı zorunlu."); return; }
    if (draft.minProducts < 1 || draft.maxProducts < draft.minProducts || draft.maxProducts > 24) {
      toast.error("Ürün sınırları 1–24 arasında olmalı; en çok değeri en az değerinden küçük olamaz."); return;
    }
    setBusy(true);
    const row = {
      name: draft.name.trim(),
      href: draft.href.trim().replace(/^.*\/kategori\//, "").replace(/^\/+/, "") || "yeni-gelenler",
      min_products: draft.minProducts,
      max_products: draft.maxProducts,
      is_active: draft.isActive,
      sort_order: draft.id ? rails.find((rail) => rail.id === draft.id)?.sort_order ?? rails.length : rails.length,
    };
    const result = draft.id
      ? await supabase.from("storefront_rails").update(row).eq("id", draft.id).select("id").single()
      : await supabase.from("storefront_rails").insert(row).select("id").single();
    if (result.error) { setBusy(false); toast.error(result.error.message); return; }

    const railId = result.data.id;
    const { error: deleteError } = await supabase.from("storefront_rail_products").delete().eq("rail_id", railId);
    if (deleteError) { setBusy(false); toast.error(deleteError.message); return; }
    if (draft.productIds.length) {
      const { error: insertError } = await supabase.from("storefront_rail_products").insert(
        draft.productIds.map((productId, index) => ({ rail_id: railId, product_id: productId, sort_order: index })),
      );
      if (insertError) { setBusy(false); toast.error(insertError.message); return; }
    }
    setBusy(false);
    setDraft(null);
    setSearch("");
    refresh();
    toast.success("Vitrin kaydedildi");
  }

  async function remove(rail: RailRow) {
    if (!window.confirm(`“${rail.name}” vitrini silinsin mi?`)) return;
    const { error } = await supabase.from("storefront_rails").delete().eq("id", rail.id);
    if (error) { toast.error(error.message); return; }
    refresh();
    toast.success("Vitrin silindi");
  }

  async function moveRail(index: number, direction: -1 | 1) {
    const other = rails[index + direction];
    const current = rails[index];
    if (!other || !current) return;
    const [{ error: firstError }, { error: secondError }] = await Promise.all([
      supabase.from("storefront_rails").update({ sort_order: other.sort_order }).eq("id", current.id),
      supabase.from("storefront_rails").update({ sort_order: current.sort_order }).eq("id", other.id),
    ]);
    if (firstError || secondError) { toast.error("Vitrin sırası değiştirilemedi."); return; }
    refresh();
  }

  function reorderProduct(targetId: string) {
    if (!draft || !draggedProduct || targetId === draggedProduct) return;
    const next = [...draft.productIds];
    const from = next.indexOf(draggedProduct);
    const to = next.indexOf(targetId);
    if (from < 0 || to < 0) return;
    next.splice(from, 1);
    next.splice(to, 0, draggedProduct);
    setDraft({ ...draft, productIds: next });
    setDraggedProduct(null);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl">Vitrin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ana sayfadaki ürün şeritlerini ve ürün sıralarını yönetin.</p>
        </div>
        <Button onClick={() => { setDraft(emptyDraft()); setSearch(""); }}><Plus className="h-4 w-4" /> Yeni şerit</Button>
      </header>

      <div className="space-y-3">
        {rails.map((rail, index) => (
          <article key={rail.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border border-border bg-surface p-4">
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl">{rail.name}</h2>
              <p className="text-xs text-muted-foreground">
                {rail.storefront_rail_products.length} ürün · {rail.min_products}–{rail.max_products} gösterim · {rail.is_active ? "Yayında" : "Gizli"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => moveRail(index, -1)} aria-label={`${rail.name} yukarı taşı`}>↑</Button>
              <Button variant="ghost" size="icon" disabled={index === rails.length - 1} onClick={() => moveRail(index, 1)} aria-label={`${rail.name} aşağı taşı`}>↓</Button>
              <Button variant="ghost" size="icon" onClick={() => { setDraft(toDraft(rail)); setSearch(""); }} aria-label={`${rail.name} düzenle`}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(rail)} aria-label={`${rail.name} sil`} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </article>
        ))}
      </div>

      {draft && (
        <section className="space-y-6 border-t border-border pt-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <h2 className="truncate font-display text-2xl">{draft.id ? "Vitrini düzenle" : "Yeni vitrin"}</h2>
            <Button variant="ghost" size="icon" onClick={() => setDraft(null)} aria-label="Düzenlemeyi kapat"><X /></Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="rail-name">Şerit adı</Label><Input id="rail-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Kış Koleksiyonu" /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="rail-href">Tümünü gör bağlantısı</Label><Input id="rail-href" value={draft.href} onChange={(event) => setDraft({ ...draft, href: event.target.value })} placeholder="mont" /></div>
            <div className="space-y-2"><Label htmlFor="rail-min">En az ürün</Label><Input id="rail-min" type="number" min={1} max={24} value={draft.minProducts} onChange={(event) => setDraft({ ...draft, minProducts: Number(event.target.value) })} /></div>
            <div className="space-y-2"><Label htmlFor="rail-max">En çok ürün</Label><Input id="rail-max" type="number" min={1} max={24} value={draft.maxProducts} onChange={(event) => setDraft({ ...draft, maxProducts: Number(event.target.value) })} /></div>
            <div className="flex items-center gap-3 pt-7 sm:col-span-2"><Switch id="rail-active" checked={draft.isActive} onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })} /><Label htmlFor="rail-active">Ana sayfada yayınla</Label></div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-display text-xl">Seçilen ürünler</h3><span className="text-xs text-muted-foreground">{draft.productIds.length} ürün</span></div>
              {draft.productIds.length === 0 ? (
                <div className="border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">Ürün seçilmezse bu şerit ana sayfada görünmez.</div>
              ) : (
                <ul className="space-y-2">
                  {draft.productIds.map((id, index) => {
                    const product = productById.get(id);
                    if (!product) return null;
                    return (
                      <li
                        key={id}
                        draggable
                        onDragStart={() => setDraggedProduct(id)}
                        onDragOver={(event: DragEvent) => event.preventDefault()}
                        onDrop={() => reorderProduct(id)}
                        className="grid cursor-grab grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border border-border bg-surface p-2 active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="w-5 text-center text-xs text-gold">{index + 1}</span>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="aspect-4/5 w-10 shrink-0 overflow-hidden bg-secondary">{product.images[0] && <img src={product.images[0]} alt="" className="h-full w-full object-contain" />}</div>
                          <span className="truncate text-sm">{product.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setDraft({ ...draft, productIds: draft.productIds.filter((productId) => productId !== id) })} aria-label={`${product.name} vitrinden çıkar`}><X className="h-4 w-4" /></Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-display text-xl">Ürün ekle</h3>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ürün ara" className="pl-9" />
              </div>
              <ul className="mt-3 max-h-[460px] space-y-2 overflow-y-auto pr-1">
                {availableProducts.map((product) => (
                  <li key={product.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-border p-2">
                    <div className="aspect-4/5 w-10 shrink-0 overflow-hidden bg-secondary">{product.images[0] && <img src={product.images[0]} alt="" className="h-full w-full object-contain" />}</div>
                    <span className="truncate text-sm">{product.name}</span>
                    <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, productIds: [...draft.productIds, product.id] })}><Plus className="h-4 w-4" /> Ekle</Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button variant="outline" onClick={() => setDraft(null)}>Vazgeç</Button>
            <Button onClick={save} disabled={busy}>{busy ? "Kaydediliyor…" : "Vitrini kaydet"}</Button>
          </div>
        </section>
      )}
    </div>
  );
}