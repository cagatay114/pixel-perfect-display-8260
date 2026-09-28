import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { FREE_SHIPPING_LIMIT, formatPrice } from "@/lib/data";
import { useShop } from "@/lib/store";

export function CartDrawer() {
  const { cartOpen, setCartOpen, detailedLines, setQty, removeLine, subtotal } = useShop();
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const remaining = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_LIMIT) * 100);

  return (
    <>
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-50 bg-overlay transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-label="Sepet"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-elevated transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-2xl">Sepetim</h2>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Sepeti kapat">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="border-b border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">
            {remaining > 0 ? (
              <>
                Kargonun bedava olmasına{" "}
                <span className="text-gold">{formatPrice(remaining)}</span> kaldı
              </>
            ) : (
              <span className="text-gold">Kargo bedava!</span>
            )}
          </p>
          <div className="mt-2 h-1 w-full bg-surface-2">
            <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {detailedLines.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sepetiniz şu an boş.
            </p>
          ) : (
            <ul className="space-y-5">
              {detailedLines.map(({ line, product }) => (
                <li key={`${line.slug}-${line.size}`} className="flex gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="h-28 w-22 shrink-0 bg-background object-contain"
                  />
                  <div className="flex-1">
                    <p className="font-display text-base">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.color} · Beden {line.size}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{formatPrice(product.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Azalt"
                          onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                          className="px-2 py-1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center text-xs">{line.qty}</span>
                        <button
                          type="button"
                          aria-label="Arttır"
                          onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                          className="px-2 py-1"
                        >
                          <Plus className="h-3 w-3" />
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
          )}
        </div>

        <footer className="space-y-3 border-t border-border px-5 py-4">
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Kupon kodu"
              maxLength={30}
              className="flex-1 border border-input bg-background px-3 py-2 text-xs outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() =>
                setCouponMsg(
                  coupon.trim()
                    ? "Kupon kodları ödeme adımı kurulduğunda geçerli olacak."
                    : "Lütfen bir kupon kodu girin.",
                )
              }
              className="border border-border px-4 text-[11px] uppercase tracking-widest hover:border-gold hover:text-gold"
            >
              Uygula
            </button>
          </div>
          {couponMsg && <p className="text-[11px] text-muted-foreground">{couponMsg}</p>}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ara toplam</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <Link
            to="/sepet"
            onClick={() => setCartOpen(false)}
            className="btn-gold w-full"
            aria-disabled={detailedLines.length === 0}
          >
            Ödemeye geç
          </Link>
        </footer>
      </aside>
    </>
  );
}
