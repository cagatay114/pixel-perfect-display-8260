import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./data";
import { getProduct, useCatalog } from "./catalog";
import { supabase } from "@/integrations/supabase/client";

export type CartLine = {
  slug: string;
  size: string;
  qty: number;
};

type ShopState = {
  lines: CartLine[];
  favorites: string[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (slug: string, size: string, qty?: number) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  removeLine: (slug: string, size: string) => void;
  clearCart: () => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  count: number;
  subtotal: number;
  detailedLines: { line: CartLine; product: Product }[];
};

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "rk-cart";
const FAV_KEY = "rk-favorites";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(read<CartLine[]>(CART_KEY, []));
    setFavorites(read<string[]>(FAV_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Girişte: hesaptaki sepet/favorilerle cihazdakileri birleştir.
  useEffect(() => {
    if (!hydrated) return;
    setSynced(false);
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("customer_shop_state")
        .select("cart, favorites")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      const remoteCart = (data?.cart as CartLine[] | null) ?? [];
      const remoteFav = (data?.favorites as string[] | null) ?? [];
      setLines((local) => {
        const merged = [...remoteCart];
        for (const l of local) {
          const m = merged.find((x) => x.slug === l.slug && x.size === l.size);
          if (m) m.qty = Math.max(m.qty, l.qty);
          else merged.push(l);
        }
        return merged;
      });
      setFavorites((local) => Array.from(new Set([...remoteFav, ...local])));
      setSynced(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, hydrated]);

  useEffect(() => {
    if (!userId || !synced) return;
    const t = setTimeout(() => {
      void supabase
        .from("customer_shop_state")
        .upsert({ user_id: userId, cart: lines, favorites }, { onConflict: "user_id" });
    }, 500);
    return () => clearTimeout(t);
  }, [lines, favorites, userId, synced]);

  const addToCart = useCallback((slug: string, size: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug && l.size === size);
      if (existing) {
        return prev.map((l) =>
          l.slug === slug && l.size === size ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...prev, { slug, size, qty }];
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.slug === slug && l.size === size))
        : prev.map((l) => (l.slug === slug && l.size === size ? { ...l, qty } : l)),
    );
  }, []);

  const removeLine = useCallback((slug: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const catalog = useCatalog();
  const value = useMemo<ShopState>(() => {
    const detailedLines = lines
      .map((line) => ({ line, product: getProduct(catalog, line.slug) }))
      .filter((x): x is { line: CartLine; product: Product } => Boolean(x.product));

    return {
      lines,
      favorites,
      cartOpen,
      setCartOpen,
      addToCart,
      setQty,
      removeLine,
      clearCart,
      toggleFavorite,
      isFavorite: (slug: string) => favorites.includes(slug),
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal: detailedLines.reduce((sum, d) => sum + d.product.price * d.line.qty, 0),
      detailedLines,
    };
  }, [catalog, lines, favorites, cartOpen, addToCart, setQty, removeLine, clearCart, toggleFavorite]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
