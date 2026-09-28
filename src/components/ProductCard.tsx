import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { discountPercent, formatPrice, type Product } from "@/lib/data";
import { useShop } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { toggleFavorite, isFavorite, addToCart } = useShop();
  const [pickSize, setPickSize] = useState(false);
  const discount = discountPercent(product);
  const fav = isFavorite(product.slug);
  const primaryImage = product.images[0];
  const secondaryImage = product.images.length > 1 ? product.images[1] : undefined;

  useEffect(() => {
    if (!secondaryImage) return;
    const image = new Image();
    image.src = secondaryImage;
  }, [secondaryImage]);

  return (
    <div className="group relative">
      <Link
        to="/urun/$slug"
        params={{ slug: product.slug }}
        className="block overflow-hidden bg-surface"
      >
        <div className="relative aspect-4/5">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-contain transition-[opacity,transform] duration-300 ${
              secondaryImage
                ? "[@media(hover:hover)]:group-hover:opacity-0"
                : "[@media(hover:hover)]:group-hover:scale-[1.02]"
            }`}
          />
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} ikinci görsel`}
              loading="eager"
              className="absolute inset-0 hidden h-full w-full object-contain opacity-0 transition-opacity duration-300 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
          <div className="absolute left-0 top-3 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-gold px-2 py-1 text-[10px] font-semibold tracking-widest text-primary-foreground">
                %{discount} İNDİRİM
              </span>
            )}
            {product.isNew && (
              <span className="border border-gold bg-background/80 px-2 py-1 text-[10px] font-semibold tracking-widest text-gold">
                YENİ
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleFavorite(product.slug)}
        aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
        className="absolute right-2 top-2 grid h-9 w-9 place-items-center bg-background/70 backdrop-blur transition-colors hover:text-gold"
      >
        <Heart className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
      </button>

      <div className="mt-3 space-y-1">
        <p className="eyebrow">RK Collection</p>
        <Link
          to="/urun/$slug"
          params={{ slug: product.slug }}
          className="block font-display text-lg leading-snug transition-colors hover:text-gold"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            KDV Dahil
          </span>
        </div>
      </div>

      {pickSize ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {product.sizes.map((s) => (
            <button
              key={s.size}
              type="button"
              disabled={s.stock === 0}
              onClick={() => {
                addToCart(product.slug, s.size);
                setPickSize(false);
              }}
              className="min-w-9 border border-border px-2 py-1 text-xs transition-colors hover:border-gold hover:text-gold disabled:text-muted-foreground disabled:line-through disabled:hover:border-border"
            >
              {s.size}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickSize(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 border border-border py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:border-gold hover:text-gold"
        >
          <Plus className="h-3.5 w-3.5" /> Sepete ekle
        </button>
      )}
    </div>
  );
}
