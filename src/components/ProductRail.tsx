import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/data";
import { ProductCard } from "./ProductCard";

export function ProductRail({
  title,
  products,
  href,
}: {
  title: string;
  products: Product[];
  href: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Vitrin</p>
          <h2 className="mt-1 text-3xl md:text-4xl">{title}</h2>
        </div>
        <Link
          to="/kategori/$slug"
          params={{ slug: href }}
          className="whitespace-nowrap text-[11px] uppercase tracking-[0.16em] text-gold hover:underline"
        >
          Tümünü gör
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {products.map((p) => (
          <div key={p.slug} className="w-[62%] shrink-0 sm:w-[38%] lg:w-[23%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
