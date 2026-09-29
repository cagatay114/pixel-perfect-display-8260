import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Flame, Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ANNOUNCEMENT, categories, formatPrice, products } from "@/lib/data";
import { useShop } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";

export function Header() {
  const { count, setCartOpen, favorites } = useShop();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const primaryCategories = categories.slice(0, 8);
  const moreCategories = categories.slice(8);

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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 lg:hidden"
          aria-label="Menüyü aç"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

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

        <nav className="ml-auto flex shrink-0 items-center gap-3 md:ml-4 md:gap-4">
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(true)}
            aria-label="Sepeti aç"
            className="relative h-9 w-9 hover:text-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center bg-gold px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
            title={theme === "dark" ? "Açık tema" : "Koyu tema"}
            className="relative h-9 w-9 hover:text-gold"
          >
            <Sun className={`absolute h-5 w-5 transition-all ${theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"}`} />
            <Moon className={`absolute h-5 w-5 transition-all ${theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`} />
          </Button>
        </nav>
      </div>

      <div className="hidden border-y border-border lg:block">
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-3 text-[11px] uppercase tracking-[0.16em]">
          <li>
            <Link
              to="/cok-satanlar"
              className="flex items-center gap-1.5 transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
            >
              <Flame className="h-3.5 w-3.5" strokeWidth={1.75} />
              Çok Satanlar
            </Link>
          </li>
          {primaryCategories.map((c) => (
            <li key={c.slug} className="group static">
              <Link
                to="/kategori/$slug"
                params={{ slug: c.slug }}
                className={`transition-colors hover:text-gold ${c.slug === "indirim" ? "text-gold" : ""}`}
                activeProps={{ className: "text-gold" }}
              >
                {c.name}
              </Link>
              {c.subs && (
                <div className="invisible absolute inset-x-0 top-full z-50 border-b border-border bg-surface opacity-0 shadow-elevated transition-opacity group-hover:visible group-hover:opacity-100">
                  <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr] gap-10 px-6 py-8">
                    <div>
                      <p className="eyebrow">Pantolon</p>
                      <p className="mt-2 font-display text-2xl normal-case tracking-normal">Her kalıba uygun seçimler</p>
                    </div>
                    <ul className="grid grid-cols-4 gap-3">
                      {c.subs.map((s) => (
                        <li key={s.slug}>
                          <Link
                            to="/kategori/$slug"
                            params={{ slug: c.slug }}
                            search={{ alt: s.slug }}
                            className="block border-l border-border px-4 py-4 text-sm normal-case tracking-normal transition-colors hover:border-gold hover:text-gold"
                          >
                            <span className="font-display text-xl">{s.name}</span>
                            <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Koleksiyonu gör</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
          <li className="group relative">
            <Button type="button" variant="ghost" className="h-auto gap-1 p-0 text-[11px] uppercase tracking-[0.16em] hover:bg-transparent hover:text-gold">
              Daha Fazla <ChevronDown className="h-3 w-3" />
            </Button>
            <ul className="invisible absolute right-0 top-full z-50 min-w-44 border border-border bg-surface py-2 opacity-0 shadow-elevated transition-opacity group-hover:visible group-hover:opacity-100">
              {moreCategories.map((c) => (
                <li key={c.slug}>
                  <Link to="/kategori/$slug" params={{ slug: c.slug }} className="block whitespace-nowrap px-4 py-2 hover:text-gold">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

      {/* Mobil menü */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 h-full w-full overflow-y-auto bg-background transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="font-display text-xl">Kategoriler</span>
            <Button variant="ghost" size="icon" type="button" onClick={() => setMenuOpen(false)} aria-label="Menüyü kapat">
              <X className="h-5 w-5" />
            </Button>
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
            <ul className="divide-y divide-border border-y border-border">
              {categories.map((c) => (
                <li key={c.slug} className="py-1">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                    <Link
                      to="/kategori/$slug"
                      params={{ slug: c.slug }}
                      onClick={() => setMenuOpen(false)}
                      className={`min-w-0 py-3 text-sm uppercase tracking-[0.14em] hover:text-gold ${c.slug === "indirim" ? "text-gold" : ""}`}
                    >
                      {c.name}
                    </Link>
                    {c.subs && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${c.name} alt kategorilerini ${mobileExpanded === c.slug ? "kapat" : "aç"}`}
                        aria-expanded={mobileExpanded === c.slug}
                        onClick={() => setMobileExpanded((current) => current === c.slug ? null : c.slug)}
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpanded === c.slug ? "rotate-180" : ""}`} />
                      </Button>
                    )}
                  </div>
                  {c.subs && (
                    <ul className={`overflow-hidden pl-4 transition-all ${mobileExpanded === c.slug ? "max-h-60 pb-3 opacity-100" : "max-h-0 opacity-0"}`}>
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
