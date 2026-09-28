import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroImage from "@/assets/hero.jpg";
import { ProductRail } from "@/components/ProductRail";
import { STORE, categories, products } from "@/lib/data";

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
    ],
  }),
  component: Index,
});

const outerwear = ["mont", "trenckot", "ceket", "hirka"];

function Index() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="relative">
        <div className="relative h-[70vh] min-h-105 w-full overflow-hidden">
          <img
            src={heroImage}
            alt="RK Collection yeni sezon"
            width={1600}
            height={1008}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-12 md:pb-20">
              <p className="eyebrow">Sonbahar / Kış 2026</p>
              <h1 className="mt-3 max-w-xl text-4xl leading-tight md:text-6xl">
                Sade kalıplar,
                <br />
                ağırlığı hissedilen kumaşlar
              </h1>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/kategori/$slug" params={{ slug: "yeni-gelenler" }} className="btn-gold">
                  Yeni Gelenler
                </Link>
                <Link to="/kategori/$slug" params={{ slug: "indirim" }} className="btn-outline">
                  İndirimdekiler
                </Link>
              </div>
            </div>
          </div>
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
