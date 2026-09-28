import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const siteSettingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    return Object.fromEntries(data.map((setting) => [setting.key, setting.value]));
  },
  staleTime: 5 * 60 * 1000,
});