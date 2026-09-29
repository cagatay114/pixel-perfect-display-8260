import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_HERO_SLIDES, siteSettingsQuery, type HeroSlide } from "@/lib/site-settings";
import { uploadImage } from "@/lib/admin";
import { ANNOUNCEMENT, FREE_SHIPPING_LIMIT, WHATSAPP_NUMBER } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/ayarlar")({ component: SettingsPage });

const FIELDS = [
  { key: "announcement_text", label: "Duyuru şeridi metni", placeholder: ANNOUNCEMENT },
  { key: "whatsapp_number", label: "WhatsApp numarası (ülke koduyla)", placeholder: WHATSAPP_NUMBER },
  { key: "free_shipping_limit", label: "Ücretsiz kargo limiti (TL)", placeholder: String(FREE_SHIPPING_LIMIT) },
] as const;

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery(siteSettingsQuery);
  const [values, setValues] = useState<Record<string, string>>({});
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setValues(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])));
    try {
      const parsed: unknown = data["hero_slides"] ? JSON.parse(data["hero_slides"]) : null;
      if (Array.isArray(parsed) && parsed.length >= 3 && parsed.length <= 5) setSlides(parsed as HeroSlide[]);
    } catch {
      setSlides(DEFAULT_HERO_SLIDES);
    }
  }, [data]);

  async function save() {
    const limit = values["free_shipping_limit"];
    if (limit && !(Number(limit) > 0)) { toast.error("Kargo limiti pozitif bir sayı olmalı."); return; }
    if (slides.length < 3 || slides.length > 5) { toast.error("Banner sayısı 3 ile 5 arasında olmalı."); return; }
    if (slides.some((slide) => !slide.title.trim() || !slide.subtitle.trim() || !slide.buttonText.trim() || !slide.buttonLink.trim())) {
      toast.error("Her banner için başlık, açıklama, buton metni ve bağlantı zorunludur."); return;
    }
    setBusy(true);
    const rows = [
      ...FIELDS.map((f) => ({ key: f.key, value: values[f.key]?.trim() || null })),
      { key: "hero_slides", value: JSON.stringify(slides) },
    ];
    const { error } = await supabase.from("site_settings").upsert(rows);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Ayarlar kaydedildi");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
  }

  function updateSlide(id: string, patch: Partial<HeroSlide>) {
    setSlides((current) => current.map((slide) => slide.id === id ? { ...slide, ...patch } : slide));
  }

  function moveSlide(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setSlides((current) => {
      const next = [...current];
      const currentSlide = next[index];
      const targetSlide = next[nextIndex];
      if (!currentSlide || !targetSlide) return current;
      next[index] = targetSlide;
      next[nextIndex] = currentSlide;
      return next;
    });
  }

  function addSlide() {
    if (slides.length >= 5) return;
    setSlides((current) => [...current, {
      id: crypto.randomUUID(), imageUrl: "", eyebrow: "Yeni Seçki", title: "Yeni banner başlığı",
      subtitle: "Kısa bir koleksiyon açıklaması yazın.", buttonText: "Koleksiyonu Keşfet", buttonLink: "yeni-gelenler",
    }]);
  }

  async function onHero(id: string, file?: File) {
    if (!file) return;
    setUploading(id);
    try {
      const url = await uploadImage(file, "hero");
      updateSlide(id, { imageUrl: url });
      toast.success("Görsel yüklendi — kaydetmeyi unutmayın");
    } catch {
      toast.error("Görsel yüklenemedi");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="font-display text-3xl">Site Ayarları</h1>
      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label htmlFor={f.key}>{f.label}</Label>
          {"long" in f ? (
            <Textarea id={f.key} placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
          ) : (
            <Input id={f.key} placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
          )}
        </div>
      ))}
      <section className="space-y-4 border-t border-border pt-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Ana Sayfa</p>
            <h2 className="mt-1 font-display text-2xl">Banner’lar</h2>
            <p className="mt-1 text-sm text-muted-foreground">3–5 banner ekleyebilir ve sıralarını değiştirebilirsiniz.</p>
          </div>
          <Button type="button" variant="outline" onClick={addSlide} disabled={slides.length >= 5}>
            <Plus /> Banner ekle
          </Button>
        </div>

        {slides.map((slide, index) => (
          <article key={slide.id} className="border border-border bg-surface p-4 sm:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4">
              <h3 className="truncate font-display text-xl">{index + 1}. Banner</h3>
              <div className="flex shrink-0 gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => moveSlide(index, -1)} disabled={index === 0} aria-label="Yukarı taşı"><ArrowUp /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1} aria-label="Aşağı taşı"><ArrowDown /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setSlides((current) => current.filter((item) => item.id !== slide.id))} disabled={slides.length <= 3} aria-label="Bannerı sil" className="text-destructive"><Trash2 /></Button>
              </div>
            </div>

            <div className="mt-4 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <div className="aspect-[16/10] overflow-hidden border border-border bg-secondary">
                  {slide.imageUrl ? <img src={slide.imageUrl} alt={`${index + 1}. banner`} className="h-full w-full object-cover" /> : <div className="hero-placeholder h-full w-full" />}
                </div>
                <Label className="mt-3 flex cursor-pointer items-center justify-center gap-2 border border-input bg-background px-3 py-2 text-xs hover:border-gold">
                  <ImagePlus className="h-4 w-4" /> {uploading === slide.id ? "Yükleniyor…" : "Görsel yükle"}
                  <Input className="sr-only" type="file" accept="image/*" disabled={uploading === slide.id} onChange={(event) => onHero(slide.id, event.target.files?.[0])} />
                </Label>
                {slide.imageUrl && <Button type="button" variant="ghost" size="sm" className="mt-1 w-full" onClick={() => updateSlide(slide.id, { imageUrl: "" })}>Görseli kaldır</Button>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Üst yazı</Label><Input value={slide.eyebrow} onChange={(event) => updateSlide(slide.id, { eyebrow: event.target.value })} /></div>
                <div className="space-y-1.5"><Label>Buton metni</Label><Input value={slide.buttonText} onChange={(event) => updateSlide(slide.id, { buttonText: event.target.value })} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Başlık</Label><Input value={slide.title} onChange={(event) => updateSlide(slide.id, { title: event.target.value })} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Açıklama</Label><Textarea value={slide.subtitle} onChange={(event) => updateSlide(slide.id, { subtitle: event.target.value })} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Buton bağlantısı (kategori adresi)</Label><Input value={slide.buttonLink} placeholder="yeni-gelenler" onChange={(event) => updateSlide(slide.id, { buttonLink: event.target.value.replace(/^.*\/kategori\//, "").replace(/^\/+/, "") })} /></div>
              </div>
            </div>
          </article>
        ))}
      </section>
      <Button onClick={save} disabled={busy}>{busy ? "Kaydediliyor…" : "Kaydet"}</Button>
    </div>
  );
}
