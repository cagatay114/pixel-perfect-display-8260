import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/data";
import { LOW_STOCK, slugify, uploadImage } from "@/lib/admin";
import { categoriesQuery } from "./admin.kategoriler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/urunler")({ component: Products });

const productsQuery = {
  queryKey: ["admin", "products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(id, size, stock), categories(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};

type Row = NonNullable<Awaited<ReturnType<typeof productsQuery.queryFn>>>[number];

type Draft = {
  id?: string;
  name: string;
  description: string;
  category_id: string;
  price: string;
  compare_at_price: string;
  color: string;
  images: string[];
  is_active: boolean;
  is_new: boolean;
  sizes: { size: string; stock: string }[];
};

const empty: Draft = {
  name: "", description: "", category_id: "", price: "", compare_at_price: "", color: "", images: [],
  is_active: true, is_new: false,
  sizes: ["S", "M", "L", "XL"].map((size) => ({ size, stock: "0" })),
};

const discount = (price: number, old?: number | null) => (old && old > price ? Math.round((1 - price / old) * 100) : 0);

function Products() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery);
  const [draft, setDraft] = useState<Draft | null>(null);

  function edit(p: Row) {
    setDraft({
      id: p.id, name: p.name, description: p.description, category_id: p.category_id ?? "",
      price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      color: p.color, images: p.images, is_active: p.is_active, is_new: p.is_new,
      sizes: p.product_variants.map((v) => ({ size: v.size, stock: String(v.stock) })),
    });
  }

  async function remove(p: Row) {
    if (!window.confirm(`"${p.name}" silinsin mi?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Ürünler</h1>
        <Button onClick={() => setDraft(structuredClone(empty))}><Plus className="h-4 w-4" /> Ürün ekle</Button>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz ürün eklenmedi.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {products.map((p) => {
            const stock = p.product_variants.reduce((s, v) => s + v.stock, 0);
            const d = discount(Number(p.price), p.compare_at_price ? Number(p.compare_at_price) : null);
            return (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <div className="aspect-[4/5] w-12 shrink-0 overflow-hidden rounded bg-secondary">
                  {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-contain" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{p.name} {!p.is_active && <span className="text-xs text-muted-foreground">(pasif)</span>} {p.is_new && <span className="text-xs text-gold">Yeni</span>}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.categories?.name ?? "Kategorisiz"} · {formatPrice(Number(p.price))}{d > 0 && ` · %${d} indirim`} ·{" "}
                    <span className={stock <= LOW_STOCK ? "text-destructive" : ""}>{stock} stok</span>
                  </p>
                </div>
                <Button size="icon" variant="ghost" aria-label="Düzenle" onClick={() => edit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" aria-label="Sil" onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            );
          })}
        </ul>
      )}
      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {draft && <ProductForm draft={draft} setDraft={setDraft} onSaved={() => { setDraft(null); qc.invalidateQueries({ queryKey: ["admin"] }); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ draft, setDraft, onSaved }: { draft: Draft; setDraft: (d: Draft) => void; onSaved: () => void }) {
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const price = Number(draft.price);
  const old = Number(draft.compare_at_price);
  const pct = discount(price, old);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadImage(f, "products")));
      set({ images: [...draft.images, ...urls] });
    } catch {
      toast.error("Fotoğraf yüklenemedi");
    }
    setUploading(false);
  }

  const move = (i: number, dir: -1 | 1) => {
    const imgs = [...draft.images];
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j]!, imgs[i]!];
    set({ images: imgs });
  };

  async function save() {
    if (!draft.name.trim() || !(price >= 0) || !draft.price) { toast.error("Ad ve fiyat zorunlu."); return; }
    if (draft.compare_at_price && !(old > price)) { toast.error("Eski fiyat, satış fiyatından yüksek olmalı."); return; }
    setBusy(true);
    const row = {
      name: draft.name.trim(),
      slug: slugify(draft.name),
      description: draft.description,
      category_id: draft.category_id || null,
      price,
      compare_at_price: draft.compare_at_price ? old : null,
      color: draft.color.trim(),
      images: draft.images,
      is_active: draft.is_active,
      is_new: draft.is_new,
    };
    const res = draft.id
      ? await supabase.from("products").update(row).eq("id", draft.id).select("id").single()
      : await supabase.from("products").insert(row).select("id").single();
    if (res.error) {
      setBusy(false);
      { toast.error(res.error.code === "23505" ? "Bu isimde bir ürün zaten var." : res.error.message); return; }
    }
    const id = res.data.id;
    const sizes = draft.sizes.filter((s) => s.size.trim());
    await supabase.from("product_variants").delete().eq("product_id", id);
    if (sizes.length) {
      const { error } = await supabase.from("product_variants").insert(
        sizes.map((s) => ({ product_id: id, size: s.size.trim(), stock: Math.max(0, parseInt(s.stock) || 0) })),
      );
      if (error) { setBusy(false); { toast.error("Beden stokları kaydedilemedi: " + error.message); return; } }
    }
    setBusy(false);
    toast.success("Ürün kaydedildi");
    onSaved();
  }

  return (
    <div className="space-y-4">
      <DialogHeader><DialogTitle>{draft.id ? "Ürünü düzenle" : "Yeni ürün"}</DialogTitle></DialogHeader>
      <div className="space-y-2"><Label>Ad</Label><Input value={draft.name} onChange={(e) => set({ name: e.target.value })} /></div>
      <div className="space-y-2"><Label>Açıklama</Label><Textarea rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Kategori</Label>
          <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.category_id} onChange={(e) => set({ category_id: e.target.value })}>
            <option value="">Seçin</option>
            {cats.filter((c) => !c.parent_id).map((r) => [
              <option key={r.id} value={r.id}>{r.name}</option>,
              ...cats.filter((c) => c.parent_id === r.id).map((c) => <option key={c.id} value={c.id}>— {c.name}</option>),
            ])}
          </select>
        </div>
        <div className="space-y-2"><Label>Renk</Label><Input value={draft.color} onChange={(e) => set({ color: e.target.value })} /></div>
        <div className="space-y-2"><Label>Fiyat (TL, KDV dahil)</Label><Input type="number" min="0" step="0.01" value={draft.price} onChange={(e) => set({ price: e.target.value })} /></div>
        <div className="space-y-2">
          <Label>Eski fiyat (isteğe bağlı)</Label>
          <Input type="number" min="0" step="0.01" value={draft.compare_at_price} onChange={(e) => set({ compare_at_price: e.target.value })} />
          {pct > 0 && <p className="text-xs text-gold">%{pct} indirim gösterilecek</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Beden bazlı stok</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {draft.sizes.map((s, i) => (
            <div key={i} className="flex gap-1">
              <Input aria-label="Beden" className="w-16" value={s.size} onChange={(e) => { const sizes = [...draft.sizes]; sizes[i] = { ...s, size: e.target.value }; set({ sizes }); }} />
              <Input aria-label="Stok" type="number" min="0" value={s.stock} onChange={(e) => { const sizes = [...draft.sizes]; sizes[i] = { ...s, stock: e.target.value }; set({ sizes }); }} />
              <Button size="icon" variant="ghost" aria-label="Bedeni kaldır" onClick={() => set({ sizes: draft.sizes.filter((_, j) => j !== i) })}><X className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={() => set({ sizes: [...draft.sizes, { size: "", stock: "0" }] })}>Beden ekle</Button>
      </div>

      <div className="space-y-2">
        <Label>Fotoğraflar (ilki ana fotoğraf, 4:5 önerilir)</Label>
        <div className="flex flex-wrap gap-2">
          {draft.images.map((src, i) => (
            <div key={src} className="relative aspect-[4/5] w-20 overflow-hidden rounded border border-border bg-secondary">
              <img src={src} alt="" className="h-full w-full object-contain" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-overlay p-0.5">
                <button aria-label="Sola taşı" onClick={() => move(i, -1)}><ArrowLeft className="h-3 w-3" /></button>
                <button aria-label="Kaldır" onClick={() => set({ images: draft.images.filter((_, j) => j !== i) })}><X className="h-3 w-3" /></button>
                <button aria-label="Sağa taşı" onClick={() => move(i, 1)}><ArrowRight className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
        <Input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => onFiles(e.target.files)} />
        {uploading && <p className="text-xs text-muted-foreground">Yükleniyor…</p>}
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm"><Switch checked={draft.is_active} onCheckedChange={(v) => set({ is_active: v })} /> Aktif</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={draft.is_new} onCheckedChange={(v) => set({ is_new: v })} /> Yeni</label>
      </div>
      <p className="text-xs text-muted-foreground">"Çok Satan" sıralaması tamamlanan siparişlerden otomatik belirlenir.</p>
      <Button className="w-full" onClick={save} disabled={busy || uploading}>{busy ? "Kaydediliyor…" : "Kaydet"}</Button>
    </div>
  );
}
