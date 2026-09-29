import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsQuery } from "@/lib/site-settings";
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
  { key: "hero_eyebrow", label: "Banner üst yazısı", placeholder: "Sonbahar / Kış 2026" },
  { key: "hero_title", label: "Banner başlığı", placeholder: "Varsayılan başlık" },
  { key: "hero_subtitle", label: "Banner açıklaması", placeholder: "Varsayılan açıklama", long: true },
] as const;

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery(siteSettingsQuery);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setValues(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])));
  }, [data]);

  async function save() {
    const limit = values["free_shipping_limit"];
    if (limit && !(Number(limit) > 0)) return toast.error("Kargo limiti pozitif bir sayı olmalı.");
    setBusy(true);
    const rows = [...FIELDS.map((f) => f.key), "hero_image_url"].map((key) => ({ key, value: values[key]?.trim() || null }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Ayarlar kaydedildi");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
  }

  async function onHero(file?: File) {
    if (!file) return;
    try {
      const url = await uploadImage(file, "hero");
      setValues((v) => ({ ...v, hero_image_url: url }));
      toast.success("Görsel yüklendi — kaydetmeyi unutmayın");
    } catch {
      toast.error("Görsel yüklenemedi");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
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
      <div className="space-y-2">
        <Label>Ana sayfa banner görseli (4:5 önerilir)</Label>
        <div className="flex items-end gap-4">
          <div className="aspect-[4/5] w-32 overflow-hidden rounded-md border border-border bg-secondary">
            {values["hero_image_url"] && <img src={values["hero_image_url"]} alt="Banner" className="h-full w-full object-contain" />}
          </div>
          <div className="space-y-2">
            <Input type="file" accept="image/*" onChange={(e) => onHero(e.target.files?.[0])} />
            {values["hero_image_url"] && <Button variant="ghost" size="sm" onClick={() => setValues({ ...values, hero_image_url: "" })}>Görseli kaldır</Button>}
          </div>
        </div>
      </div>
      <Button onClick={save} disabled={busy}>{busy ? "Kaydediliyor…" : "Kaydet"}</Button>
    </div>
  );
}
