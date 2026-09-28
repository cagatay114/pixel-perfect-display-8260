import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { getProduct } from "@/lib/data";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/favoriler")({
  head: () => ({
    meta: [
      { title: "Favorilerim | RK Collection" },
      { name: "description", content: "Beğendiğiniz RK Collection ürünleri." },
      { property: "og:title", content: "Favorilerim | RK Collection" },
      { property: "og:description", content: "Beğendiğiniz RK Collection ürünleri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites } = useShop();
  const items = favorites.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl md:text-5xl">Favorilerim</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Favorileriniz bu cihazda saklanır; üyelik devreye girdiğinde hesabınıza taşınacak.
      </p>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Henüz favori ürününüz yok.</p>
          <Link to="/kategori/$slug" params={{ slug: "yeni-gelenler" }} className="btn-gold mt-6">
            Yeni gelenlere bak
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
