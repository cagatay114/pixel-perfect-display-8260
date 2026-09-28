import { createFileRoute, Link } from "@tanstack/react-router";
import { FREE_SHIPPING_LIMIT, formatPrice } from "@/lib/data";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/sepet")({
  head: () => ({
    meta: [
      { title: "Sepetim | RK Collection" },
      { name: "description", content: "RK Collection sepetiniz ve sipariş özeti." },
      { property: "og:title", content: "Sepetim | RK Collection" },
      { property: "og:description", content: "RK Collection sepetiniz ve sipariş özeti." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailedLines, subtotal, setQty, removeLine } = useShop();
  const shipping = subtotal >= FREE_SHIPPING_LIMIT || subtotal === 0 ? 0 : 89;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl md:text-5xl">Sepetim</h1>

      {detailedLines.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Sepetiniz boş.</p>
          <Link to="/kategori/$slug" params={{ slug: "yeni-gelenler" }} className="btn-gold mt-6">
            Alışverişe başla
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-border">
            {detailedLines.map(({ line, product }) => (
              <li key={`${line.slug}-${line.size}`} className="flex gap-4 py-5">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  loading="lazy"
                  className="h-36 w-28 bg-surface object-contain"
                />
                <div className="flex-1">
                  <Link
                    to="/urun/$slug"
                    params={{ slug: product.slug }}
                    className="font-display text-xl hover:text-gold"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {product.color} · Beden {line.size}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{formatPrice(product.price)}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                        className="px-3 py-1"
                        aria-label="Azalt"
                      >
                        −
                      </button>
                      <span className="min-w-7 text-center text-sm">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                        className="px-3 py-1"
                        aria-label="Arttır"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.slug, line.size)}
                      className="text-xs text-muted-foreground underline hover:text-gold"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border p-6">
            <h2 className="font-display text-2xl">Sipariş özeti</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ara toplam</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Kargo</dt>
                <dd>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <dt>Toplam</dt>
                <dd className="text-gold">{formatPrice(subtotal + shipping)}</dd>
              </div>
            </dl>
            <button type="button" disabled className="btn-gold mt-6 w-full">
              Ödemeye geç
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Ödeme adımı (kart ile ödeme ve kapıda ödeme) sonraki aşamada devreye alınacak.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
