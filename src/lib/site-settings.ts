import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ANNOUNCEMENT, FREE_SHIPPING_LIMIT, WHATSAPP_NUMBER } from "@/lib/data";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
};

const PRIMARY_HERO_SLIDE: HeroSlide = {
  id: "yeni-sezon", imageUrl: "", eyebrow: "Yeni Sezon", title: "Sade kalıplar, güçlü bir duruş", subtitle: "Günün her anına uyum sağlayan seçkin parçalarla stilinizi tamamlayın.", buttonText: "Koleksiyonu Keşfet", buttonLink: "yeni-gelenler",
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  PRIMARY_HERO_SLIDE,
  { id: "dis-giyim", imageUrl: "", eyebrow: "Dış Giyim", title: "Mevsime karşı kusursuz katmanlar", subtitle: "Net çizgiler, dengeli dokular ve uzun süre dolabınızda kalacak tasarımlar.", buttonText: "Dış Giyimi Gör", buttonLink: "mont" },
  { id: "pantolon", imageUrl: "", eyebrow: "Modern Klasikler", title: "Her adımda rahat, her görünümde özenli", subtitle: "Günlük şehir stilinin temelini oluşturan pantolon koleksiyonunu keşfedin.", buttonText: "Pantolonları İncele", buttonLink: "pantolon" },
];

function readHeroSlides(raw?: string | null): HeroSlide[] | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return null;
    const slides = value.filter((item): item is HeroSlide => {
      if (!item || typeof item !== "object") return false;
      const slide = item as Record<string, unknown>;
      return ["id", "imageUrl", "eyebrow", "title", "subtitle", "buttonText", "buttonLink"].every((key) => typeof slide[key] === "string");
    });
    return slides.length >= 3 && slides.length <= 5 ? slides : null;
  } catch {
    return null;
  }
}

export const siteSettingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    return Object.fromEntries(data.map((setting) => [setting.key, setting.value]));
  },
  staleTime: 5 * 60 * 1000,
});

/** Editable storefront values with safe fallbacks until the admin sets them. */
export function useStoreSettings() {
  const { data } = useQuery(siteSettingsQuery);
  const limit = Number(data?.["free_shipping_limit"]);
  const storedSlides = readHeroSlides(data?.["hero_slides"]);
  const legacySlide: HeroSlide | null = data?.["hero_image_url"] || data?.["hero_title"] || data?.["hero_subtitle"]
    ? {
        ...PRIMARY_HERO_SLIDE,
        id: "legacy-banner",
        imageUrl: data?.["hero_image_url"] || "",
        eyebrow: data?.["hero_eyebrow"] || PRIMARY_HERO_SLIDE.eyebrow,
        title: data?.["hero_title"] || PRIMARY_HERO_SLIDE.title,
        subtitle: data?.["hero_subtitle"] || PRIMARY_HERO_SLIDE.subtitle,
      }
    : null;
  const heroSlides = storedSlides ?? (legacySlide ? [legacySlide, ...DEFAULT_HERO_SLIDES.slice(1)] : DEFAULT_HERO_SLIDES);
  return {
    announcement: data?.["announcement_text"] || ANNOUNCEMENT,
    whatsappNumber: (data?.["whatsapp_number"] || WHATSAPP_NUMBER).replace(/\D/g, ""),
    freeShippingLimit: Number.isFinite(limit) && limit > 0 ? limit : FREE_SHIPPING_LIMIT,
    heroImageUrl: data?.["hero_image_url"] || null,
    heroEyebrow: data?.["hero_eyebrow"] || "Sonbahar / Kış 2026",
    heroTitle: data?.["hero_title"] || null,
    heroSubtitle: data?.["hero_subtitle"] || null,
    heroSlides,
  };
}
