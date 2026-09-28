import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import {
  categoryBySlug,
  discountPercent,
  formatPrice,
  getProduct,
  products,
} from "@/lib/data";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/urun/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Ürün bulunamadı | RK Collection" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.product;
    const title = `${p.name} — ${p.color} | RK Collection`;
    const description = `${p.name} (${p.color}) ${formatPrice(p.price)}, KDV dahil. RK Collection kendi etiketiyle.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

const TABS = ["Açıklama", "Beden Tablosu", "Teslimat ve İade"] as const;

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleFavorite, isFavorite } = useShop();

  const [imageIndex, setImageIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Açıklama");
  const [warn, setWarn] = useState(false);

  const discount = discountPercent(product);
  const category = categoryBySlug(product.category);
  const siblings = (product.siblings ?? [])
    .map((s) => getProduct(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const similar = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Ana sayfa
        </Link>
        {category && (
          <>
            {" / "}
            <Link
              to="/kategori/$slug"
              params={{ slug: category.slug }}
              search={{}}
              className="hover:text-gold"
            >
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div
            className="relative aspect-4/5 overflow-hidden bg-surface"
            onClick={() => setZoom((z) => !z)}
          >
            <img
              src={product.images[imageIndex]}
              alt={`${product.name} ${product.color}`}
              className={`h-full w-full object-contain transition-transform duration-500 ${
                zoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
              }`}
            />
            {discount > 0 && (
              <span className="absolute left-0 top-4 bg-gold px-3 py-1 text-[11px] font-semibold tracking-widest text-primary-foreground">
                %{discount} İNDİRİM
              </span>
            )}
          </div>
          <div className="mt-3 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setImageIndex(i)}
                className={`h-24 w-20 border bg-surface ${
                  i === imageIndex ? "border-gold" : "border-border"
                }`}
              >
                <img src={img} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">RK Collection</p>
          <h1 className="mt-2 text-4xl md:text-5xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold text-gold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              KDV Dahil
            </span>
          </div>

          <div className="mt-7">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Renk: <span className="text-foreground">{product.color}</span>
            </p>
            <div className="mt-3 flex gap-2">
              <span
                className="h-9 w-9 border-2 border-gold"
                style={{ backgroundColor: product.colorHex }}
                title={product.color}
              />
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  to="/urun/$slug"
                  params={{ slug: s.slug }}
                  title={s.color}
                  className="h-9 w-9 border border-border transition-colors hover:border-gold"
                  style={{ backgroundColor: s.colorHex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Beden</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.size}
                  type="button"
                  disabled={s.stock === 0}
                  onClick={() => {
                    setSize(s.size);
                    setWarn(false);
                  }}
                  className={`min-w-12 border px-3 py-2 text-sm transition-colors ${
                    size === s.size ? "border-gold text-gold" : "border-border"
                  } disabled:text-muted-foreground disabled:line-through`}
                >
                  {s.size}
                </button>
              ))}
            </div>
            {warn && <p className="mt-2 text-xs text-destructive">Lütfen bir beden seçin.</p>}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-border">
              <button
                type="button"
                aria-label="Azalt"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-3"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm">{qty}</span>
              <button
                type="button"
                aria-label="Arttır"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="px-3 py-3"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => (size ? addToCart(product.slug, size, qty) : setWarn(true))}
              className="btn-gold flex-1"
            >
              Sepete ekle
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(product.slug)}
              aria-label="Favorilere ekle"
              className="grid h-12 w-12 place-items-center border border-border hover:border-gold hover:text-gold"
            >
              <Heart
                className="h-5 w-5"
                fill={isFavorite(product.slug) ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="mt-10 border-t border-border">
            <div className="flex flex-wrap gap-5 pt-4">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`text-[11px] uppercase tracking-[0.16em] ${
                    tab === t ? "text-gold" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tab === "Açıklama" && <p>{product.description}</p>}
              {tab === "Beden Tablosu" && (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="text-left text-foreground">
                      <th className="border border-border px-3 py-2">Beden</th>
                      <th className="border border-border px-3 py-2">Göğüs (cm)</th>
                      <th className="border border-border px-3 py-2">Boy (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizes.map((s, i) => (
                      <tr key={s.size}>
                        <td className="border border-border px-3 py-2">{s.size}</td>
                        <td className="border border-border px-3 py-2">{96 + i * 5}</td>
                        <td className="border border-border px-3 py-2">{68 + i * 2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {tab === "Teslimat ve İade" && (
                <p>
                  Siparişler 1-3 iş günü içinde kargoya verilir. 1500 TL ve üzeri siparişlerde
                  kargo ücretsizdir. Ürünü teslim aldıktan sonra 14 gün içinde cayma hakkınızı
                  kullanabilirsiniz; detaylar İade ve Cayma Hakkı sayfamızda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl">Benzer ürünler</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
