import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ANNOUNCEMENT, FREE_SHIPPING_LIMIT, WHATSAPP_NUMBER } from "@/lib/data";

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
  return {
    announcement: data?.["announcement_text"] || ANNOUNCEMENT,
    whatsappNumber: (data?.["whatsapp_number"] || WHATSAPP_NUMBER).replace(/\D/g, ""),
    freeShippingLimit: Number.isFinite(limit) && limit > 0 ? limit : FREE_SHIPPING_LIMIT,
    heroImageUrl: data?.["hero_image_url"] || null,
    heroEyebrow: data?.["hero_eyebrow"] || "Sonbahar / Kış 2026",
    heroTitle: data?.["hero_title"] || null,
    heroSubtitle: data?.["hero_subtitle"] || null,
  };
}
