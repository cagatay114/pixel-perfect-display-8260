import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageCheck, RotateCcw, Store, Truck } from "lucide-react";
import { useState } from "react";
import { ProductRail } from "@/components/ProductRail";
import { STORE, categories, products } from "@/lib/data";
import { useStoreSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RK Collection | Erkek Giyim — Bucak / Burdur" },
      {
        name: "description",
        content:
          "Yeni sezon erkek giyim: t-shirt, sweat, gömlek, pantolon, mont ve ayakkabı. 1500 TL üzeri kargo bedava.",
      },
      { property: "og:title", content: "RK Collection | Erkek Giyim" },
      {
        property: "og:description",
        content: "Yeni sezon erkek giyim koleksiyonu. 1500 TL üzeri kargo bedava.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const outerwear = ["mont", "trenckot", "ceket", "hirka"];
const trustItems = [
  { icon: Truck, label: "1500 TL üzeri ücretsiz kargo" },
  { icon: PackageCheck, label: "Kapıda ödeme imkanı" },
  { icon: RotateCcw, label: "14 gün koşulsuz iade" },
  { icon: Store, label: "Bucak mağazamızda elden teslim" },
];

function Index() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { heroImageUrl, heroEyebrow, heroTitle, heroSubtitle } = useStoreSettings();

  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:min-h-100 md:max-h-[70vh]">
          <div className="flex min-h-90 items-center px-4 py-10 sm:px-8 md:min-h-100 md:px-12 lg:px-16">
            <div className="max-w-xl">
              <p className="eyebrow">{heroEyebrow}</p>
              <h1 className="mt-3 text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                {heroTitle ?? <>Sade kalıplar,<br />ağırlığı hissedilen kumaşlar</>}
              </h1>
              {heroSubtitle && <p className="mt-4 text-sm text-muted-foreground md:text-base">{heroSubtitle}</p>}
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
                <Link to="/kategori/$slug" params={{ slug: "yeni-gelenler" }} className="btn-gold">
                  Yeni Gelenler
                </Link>
                <Link to="/kategori/$slug" params={{ slug: "indirim" }} className="btn-outline">
                  İndirimdekiler
                </Link>
              </div>
            </div>
          </div>
          <div className="flex min-h-90 items-center justify-center bg-surface-2 p-3 md:min-h-100 md:p-6">
            <div className="flex aspect-4/5 h-full max-h-[64vh] w-full items-center justify-center overflow-hidden border border-border bg-surface">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt="RK Collection sezon koleksiyonu"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-end justify-center bg-foreground/90 p-4 text-center text-[10px] uppercase tracking-[0.18em] text-background/70">
                  Mağaza fotoğrafı yakında
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Alışveriş avantajları" className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex min-h-18 items-center gap-3 border-border px-4 py-3 odd:border-r md:border-r md:last:border-r-0">
              <Icon className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
              <span className="text-[11px] font-medium leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <ProductRail
        title="Yeni Sezon"
        href="yeni-gelenler"
        products={products.filter((p) => p.isNew).slice(0, 8)}
      />
      <ProductRail
        title="İndirimdekiler"
        href="indirim"
        products={products.filter((p) => p.oldPrice).slice(0, 8)}
      />
      <ProductRail
        title="Dış Giyim"
        href="mont"
        products={products.filter((p) => outerwear.includes(p.category)).slice(0, 8)}
      />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <p className="eyebrow">Keşfet</p>
        <h2 className="mt-1 text-3xl md:text-4xl">Kategoriler</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.slice(2).map((c) => {
            const cover = products.find((p) => p.category === c.slug);
            return (
              <Link
                key={c.slug}
                to="/kategori/$slug"
                params={{ slug: c.slug }}
                className="group relative aspect-4/5 overflow-hidden bg-surface"
              >
                {cover && (
                  <img
                    src={cover.images[0]}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-4 font-display text-xl">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <p className="eyebrow">Mağazamız</p>
            <h2 className="mt-1 text-3xl md:text-4xl">Bucak / Burdur</h2>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>{STORE.address}</li>
              <li>{STORE.phone}</li>
              <li>{STORE.hours}</li>
            </ul>
            <a
              href={STORE.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-outline mt-6"
            >
              Yol tarifi al
            </a>
          </div>
          <div className="flex flex-col justify-center border border-border p-8">
            <p className="eyebrow">Bülten</p>
            <h3 className="mt-1 text-2xl">Yeni gelenleri ilk siz görün</h3>
            {sent ? (
              <p className="mt-4 text-sm text-gold">Kaydınızı aldık, teşekkürler.</p>
            ) : (
              <form
                className="mt-5 flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) setSent(true);
                }}
              >
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="flex-1 border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold"
                />
                <button type="submit" className="btn-gold">
                  Kaydol
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
