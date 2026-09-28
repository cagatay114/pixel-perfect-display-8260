import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ANNOUNCEMENT, categories, formatPrice, products } from "@/lib/data";
import { useShop } from "@/lib/store";

export function Header() {
  const { count, setCartOpen, favorites } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (q.length < 2) return [];
    return products.filter((p) => p.name.toLocaleLowerCase("tr").includes(q)).slice(0, 6);
  }, [query]);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur">
      <div className="bg-gold px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground">
        {ANNOUNCEMENT}
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
        <button
          type="button"
          className="lg:hidden"
          aria-label="Menüyü aç"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/" className="flex items-baseline gap-2">
          <span className="border border-gold px-2 py-0.5 font-display text-xl leading-none text-gold">
            RK
          </span>
          <span className="font-display text-lg tracking-wide">Collection</span>
        </Link>

        <div className="relative ml-auto hidden w-full max-w-sm md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün ara"
            maxLength={60}
            className="w-full border border-input bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
          />
          {results.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-50 mt-1 border border-border bg-surface shadow-elevated">
              {results.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      navigate({ to: "/urun/$slug", params: { slug: p.slug } });
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-2"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      className="h-12 w-10 bg-background object-contain"
                    />
                    <span className="flex-1 text-sm">{p.name}</span>
                    <span className="text-xs text-gold">{formatPrice(p.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className="ml-auto flex items-center gap-4 md:ml-4">
          <Link to="/favoriler" aria-label="Favorilerim" className="relative hover:text-gold">
            <Heart className="h-5 w-5" />
            {favorites.length > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center bg-gold px-1 text-[10px] font-semibold text-primary-foreground">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link to="/hesabim" aria-label="Hesabım" className="hover:text-gold">
            <User className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Sepeti aç"
            className="relative hover:text-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center bg-gold px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="hidden border-y border-border lg:block">
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-3 text-[11px] uppercase tracking-[0.16em]">
          {categories.map((c) => (
            <li key={c.slug} className="group relative">
              <Link
                to="/kategori/$slug"
                params={{ slug: c.slug }}
                className="transition-colors hover:text-gold"
                activeProps={{ className: "text-gold" }}
              >
                {c.name}
              </Link>
              {c.subs && (
                <ul className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 border border-border bg-surface py-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                  {c.subs.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to="/kategori/$slug"
                        params={{ slug: c.slug }}
                        search={{ alt: s.slug }}
                        className="block whitespace-nowrap px-4 py-1.5 hover:text-gold"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Mobil menü */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/70 transition-opacity ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-surface transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="font-display text-xl">Kategoriler</span>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Menüyü kapat">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-5 py-4">
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ürün ara"
                className="w-full border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
              />
            </div>
            {results.length > 0 && (
              <ul className="mb-4 space-y-2">
                {results.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to="/urun/$slug"
                      params={{ slug: p.slug }}
                      onClick={() => setMenuOpen(false)}
                      className="text-sm hover:text-gold"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <ul className="space-y-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/kategori/$slug"
                    params={{ slug: c.slug }}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm uppercase tracking-[0.14em] hover:text-gold"
                  >
                    {c.name}
                  </Link>
                  {c.subs && (
                    <ul className="mt-2 space-y-1 pl-4">
                      {c.subs.map((s) => (
                        <li key={s.slug}>
                          <Link
                            to="/kategori/$slug"
                            params={{ slug: c.slug }}
                            search={{ alt: s.slug }}
                            onClick={() => setMenuOpen(false)}
                            className="text-xs text-muted-foreground hover:text-gold"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
