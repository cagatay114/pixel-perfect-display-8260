import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import {
  categoryBySlug,
  discountPercent,
  formatPrice,
  productsForCategory,
  type Product,
} from "@/lib/data";

type Search = { alt?: string };

export const Route = createFileRoute("/kategori/$slug")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["alt"] === "string" ? { alt: search["alt"] } : {},
  loader: ({ params }) => {
    const category = categoryBySlug(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.category.name ?? "Kategori";
    const title = `${name} | RK Collection`;
    const description = `RK Collection ${name} koleksiyonu. KDV dahil fiyatlar, 1500 TL üzeri kargo bedava.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: CategoryPage,
});

const PAGE_SIZE = 8;

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { alt } = Route.useSearch();

  const base = useMemo(() => productsForCategory(category.slug, alt), [category.slug, alt]);

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [onlySale, setOnlySale] = useState(false);
  const [sort, setSort] = useState("onerilen");
  const [shown, setShown] = useState(PAGE_SIZE);

  const availableSizes = useMemo(
    () => Array.from(new Set(base.flatMap((p) => p.sizes.map((s) => s.size)))),
    [base],
  );
  const availableColors = useMemo(
    () => Array.from(new Map(base.map((p) => [p.color, p.colorHex])).entries()),
    [base],
  );

  const filtered = useMemo(() => {
    let list = base.filter((p) => p.price <= maxPrice);
    if (onlySale) list = list.filter((p) => p.oldPrice);
    if (sizes.length)
      list = list.filter((p) => p.sizes.some((s) => s.stock > 0 && sizes.includes(s.size)));
    if (colors.length) list = list.filter((p) => colors.includes(p.color));
    const sorters: Record<string, (a: Product, b: Product) => number> = {
      onerilen: () => 0,
      artan: (a, b) => a.price - b.price,
      azalan: (a, b) => b.price - a.price,
      yeni: (a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)),
      indirim: (a, b) => discountPercent(b) - discountPercent(a),
    };
    return [...list].sort(sorters[sort] ?? (() => 0));
  }, [base, maxPrice, onlySale, sizes, colors, sort]);

  const toggle = (value: string, list: string[], set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Ana sayfa
        </Link>{" "}
        / <span className="text-foreground">{category.name}</span>
        {alt && <> / {category.subs?.find((s) => s.slug === alt)?.name ?? alt}</>}
      </nav>

      <h1 className="mt-3 text-4xl md:text-5xl">{category.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{filtered.length} ürün</p>

      {category.subs && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/kategori/$slug"
            params={{ slug: category.slug }}
            search={{}}
            className={`border px-4 py-2 text-[11px] uppercase tracking-[0.14em] ${
              alt ? "border-border" : "border-gold text-gold"
            }`}
          >
            Tümü
          </Link>
          {category.subs.map((s) => (
            <Link
              key={s.slug}
              to="/kategori/$slug"
              params={{ slug: category.slug }}
              search={{ alt: s.slug }}
              className={`border px-4 py-2 text-[11px] uppercase tracking-[0.14em] ${
                alt === s.slug ? "border-gold text-gold" : "border-border"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 border-border lg:border-r lg:pr-6">
          <div>
            <h2 className="eyebrow">Sıralama</h2>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-3 w-full border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="onerilen">Önerilen</option>
              <option value="artan">Fiyat: artan</option>
              <option value="azalan">Fiyat: azalan</option>
              <option value="yeni">En yeni</option>
              <option value="indirim">En çok indirim</option>
            </select>
          </div>

          {availableSizes.length > 0 && (
            <div>
              <h2 className="eyebrow">Beden</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s, sizes, setSizes)}
                    className={`min-w-10 border px-2 py-1 text-xs ${
                      sizes.includes(s) ? "border-gold text-gold" : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableColors.length > 0 && (
            <div>
              <h2 className="eyebrow">Renk</h2>
              <ul className="mt-3 space-y-2">
                {availableColors.map(([name, hex]) => (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => toggle(name, colors, setColors)}
                      className={`flex w-full items-center gap-2 text-sm ${
                        colors.includes(name) ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className="h-4 w-4 border border-border"
                        style={{ backgroundColor: hex }}
                      />
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="eyebrow">Fiyat aralığı</h2>
            <input
              type="range"
              min={300}
              max={5000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--gold)]"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              0 – {formatPrice(maxPrice)} arası
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={onlySale}
              onChange={(e) => setOnlySale(e.target.checked)}
              className="accent-[var(--gold)]"
            />
            Sadece indirimdekiler
          </label>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Bu filtrelerle eşleşen ürün bulunamadı.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
                {filtered.slice(0, shown).map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
              {shown < filtered.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setShown((v) => v + PAGE_SIZE)}
                    className="btn-outline"
                  >
                    Daha fazla yükle
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
