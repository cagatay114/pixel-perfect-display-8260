import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { rankProductsBySales } from "@/lib/best-sellers";
import { useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/cok-satanlar")({
  head: () => ({
    meta: [
      { title: "Çok Satanlar | RK Collection" },
      {
        name: "description",
        content: "RK Collection'ın en çok tercih edilen erkek giyim ürünlerini keşfedin.",
      },
      { property: "og:title", content: "Çok Satanlar | RK Collection" },
      {
        property: "og:description",
        content: "RK Collection'ın en çok tercih edilen erkek giyim ürünlerini keşfedin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BestSellersPage,
});

function BestSellersPage() {
  // Sipariş altyapısı gelince yalnızca tamamlanan sipariş satırları buraya aktarılacak.
  const bestSellingProducts = rankProductsBySales([], useCatalog().products);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="eyebrow">RK Collection</p>
      <h1 className="mt-2 text-4xl md:text-5xl">Çok Satanlar</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Sezonun en çok tercih edilen parçalarını bir arada keşfedin.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {bestSellingProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}