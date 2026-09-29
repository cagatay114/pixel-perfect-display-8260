import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import type { Product } from "./data";

export type StorefrontRail = {
  id: string;
  name: string;
  href: string;
  minProducts: number;
  maxProducts: number;
  productIds: string[];
};

let publicClient: SupabaseClient<Database> | null = null;

function storefrontClient() {
  if (publicClient) return publicClient;
  const url = import.meta.env["VITE_SUPABASE_URL"] as string;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
  publicClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  return publicClient;
}

export async function fetchStorefrontRails(): Promise<StorefrontRail[]> {
  const client = storefrontClient();
  const [rails, members] = await Promise.all([
    client.from("storefront_rails").select("id, name, href, min_products, max_products").eq("is_active", true).order("sort_order"),
    client.from("storefront_rail_products").select("rail_id, product_id, sort_order").order("sort_order"),
  ]);
  if (rails.error) throw rails.error;
  if (members.error) throw members.error;
  return rails.data.map((rail) => ({
    id: rail.id,
    name: rail.name,
    href: rail.href,
    minProducts: rail.min_products,
    maxProducts: rail.max_products,
    productIds: members.data.filter((item) => item.rail_id === rail.id).map((item) => item.product_id),
  }));
}

export const storefrontRailsQuery = queryOptions({
  queryKey: ["storefront-rails"],
  queryFn: fetchStorefrontRails,
  staleTime: 60 * 1000,
});

export const useStorefrontRails = () => useSuspenseQuery(storefrontRailsQuery).data;

export function productsForRail(rail: StorefrontRail, products: Product[]) {
  const productsById = new Map(products.map((product) => [product.id, product]));
  return rail.productIds
    .map((id) => productsById.get(id))
    .filter((product): product is Product => Boolean(product))
    .slice(0, rail.maxProducts);
}