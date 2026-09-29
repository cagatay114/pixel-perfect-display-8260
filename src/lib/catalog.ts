import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import type { Category, Product } from "./data";

export type Catalog = { categories: Category[]; products: Product[] };

/** Virtual collections that are computed from product fields, not stored as categories. */
const VIRTUAL: Category[] = [
  { slug: "indirim", name: "İndirim" },
  { slug: "yeni-gelenler", name: "Yeni Gelenler" },
];

let publicClient: SupabaseClient<Database> | null = null;
/** Anonymous, session-less client so the catalog reads the same on server and browser. */
function catalogClient() {
  if (publicClient) return publicClient;
  const url = import.meta.env["VITE_SUPABASE_URL"] as string;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
  publicClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  return publicClient;
}

export async function fetchCatalog(client: SupabaseClient<Database> = catalogClient()): Promise<Catalog> {
  const [cats, prods] = await Promise.all([
    client.from("categories").select("id, slug, name, parent_id, sort_order").order("sort_order").order("name"),
    client
      .from("products")
      .select("id, slug, name, description, category_id, price, compare_at_price, color, color_hex, images, is_new, created_at, product_variants(size, stock)")
      .eq("is_active", true)
      .order("created_at"),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;

  const byId = new Map(cats.data.map((c) => [c.id, c]));
  const roots = cats.data.filter((c) => !c.parent_id);
  const categories: Category[] = [
    ...VIRTUAL,
    ...roots.map((r) => {
      const subs = cats.data.filter((c) => c.parent_id === r.id).map((c) => ({ slug: c.slug, name: c.name }));
      return subs.length ? { slug: r.slug, name: r.name, subs } : { slug: r.slug, name: r.name };
    }),
  ];

  const products: Product[] = prods.data.map((p) => {
    const cat = p.category_id ? byId.get(p.category_id) : undefined;
    const parent = cat?.parent_id ? byId.get(cat.parent_id) : undefined;
    const price = Number(p.price);
    const old = p.compare_at_price == null ? undefined : Number(p.compare_at_price);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: parent?.slug ?? cat?.slug ?? "",
      ...(parent && cat ? { subcategory: cat.slug } : {}),
      price,
      ...(old && old > price ? { oldPrice: old } : {}),
      isNew: p.is_new,
      color: p.color,
      colorHex: p.color_hex,
      images: p.images,
      description: p.description,
      sizes: p.product_variants.map((v) => ({ size: v.size, stock: v.stock })),
    };
  });
  // Other colours of the same model share a name.
  for (const p of products) {
    const siblings = products.filter((o) => o.name === p.name && o.slug !== p.slug).map((o) => o.slug);
    if (siblings.length) p.siblings = siblings;
  }
  return { categories, products };
}

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => fetchCatalog(),
  staleTime: 60 * 1000,
});

export const useCatalog = () => useSuspenseQuery(catalogQuery).data;

export const getProduct = (c: Catalog, slug: string) => c.products.find((p) => p.slug === slug);

export const categoryBySlug = (c: Catalog, slug: string) => c.categories.find((x) => x.slug === slug);

export function productsForCategory(c: Catalog, slug: string, sub?: string): Product[] {
  if (slug === "indirim") return c.products.filter((p) => p.oldPrice);
  if (slug === "yeni-gelenler") return c.products.filter((p) => p.isNew);
  return c.products.filter((p) => p.category === slug && (!sub || p.subcategory === sub));
}
