import { createFileRoute, Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/data";
import { useStoreSettings } from "@/lib/site-settings";
import { useShop } from "@/lib/store";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createCodOrder } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";

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
  const { detailedLines, subtotal, setQty, removeLine, lines, clearCart } = useShop();
  const [step, setStep] = useState<"cart" | "form">("cart");
  const [done, setDone] = useState<{ orderNumber: number; total: number } | null>(null);
  const [form, setForm] = useState({ customerName: "", phone: "", email: "", city: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const submitOrder = useServerFn(createCodOrder);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.customerName.trim().length < 3) e.customerName = "Ad soyad girin.";
    if (!/^[0-9+\s()-]{10,20}$/.test(form.phone.trim())) e.phone = "Geçerli bir telefon girin.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Geçerli bir e-posta girin.";
    if (form.city.trim().length < 2) e.city = "İl / ilçe girin.";
    if (form.address.trim().length < 10) e.address = "Açık adresi girin (en az 10 karakter).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const res = await submitOrder({ data: { ...form, userId: data.session?.user.id ?? null, lines } });
      setDone(res);
      clearCart();
      window.scrollTo(0, 0);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Sipariş gönderilemedi, tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Siparişiniz alındı</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Teşekkürler!</h1>
        <p className="mt-6 text-sm text-muted-foreground">Sipariş numaranız</p>
        <p className="font-display text-4xl text-gold">#{done.orderNumber}</p>
        <p className="mt-4 text-sm">Toplam {formatPrice(done.total)} — kapıda ödeme. Siparişiniz hazırlandığında sizinle iletişime geçeceğiz.</p>
        <Link to="/" className="btn-gold mt-8">Alışverişe devam et</Link>
      </div>
    );
  }

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label} *</span>
      {key === "address" ? (
        <textarea rows={3} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} maxLength={500}
          className="mt-1 w-full border border-border bg-background px-3 py-2" />
      ) : (
        <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} maxLength={255}
          className="mt-1 w-full border border-border bg-background px-3 py-2" />
      )}
      {errors[key] && <span className="mt-1 block text-xs text-destructive">{errors[key]}</span>}
    </label>
  );
  const { freeShippingLimit: FREE_SHIPPING_LIMIT } = useStoreSettings();
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
            {step === "cart" ? (
              <button type="button" onClick={() => setStep("form")} className="btn-gold mt-6 w-full">
                Ödemeye geç
              </button>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
                <h3 className="font-display text-xl">Teslimat bilgileri</h3>
                {field("customerName", "Ad soyad")}
                {field("phone", "Telefon", "tel")}
                {field("email", "E-posta", "email")}
                {field("city", "İl / İlçe")}
                {field("address", "Açık adres")}
                <fieldset className="space-y-2">
                  <legend className="font-display text-xl">Ödeme yöntemi</legend>
                  <label className="flex items-center gap-2 border border-gold p-3 text-sm">
                    <input type="radio" name="pay" checked readOnly /> Kapıda ödeme
                  </label>
                  <label className="flex items-center gap-2 border border-border p-3 text-sm text-muted-foreground opacity-60">
                    <input type="radio" name="pay" disabled /> Kart ile <span className="ml-auto text-[10px] uppercase tracking-wider">Yakında</span>
                  </label>
                </fieldset>
                {serverError && <p className="text-xs text-destructive">{serverError}</p>}
                <button type="submit" disabled={busy} className="btn-gold w-full">
                  {busy ? "Gönderiliyor…" : "Siparişi onayla"}
                </button>
              </form>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
