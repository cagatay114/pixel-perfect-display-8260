import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/data";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";

const AUTOPLAY_MS = 4000;
const RESUME_MS = 6500;

export function ProductRail({
  title,
  products,
  href,
}: {
  title: string;
  products: Product[];
  href: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [paused, setPaused] = useState(false);
  const [interaction, setInteraction] = useState(0);

  const pauseTemporarily = useCallback(() => {
    setPaused(true);
    setInteraction((value) => value + 1);
  }, []);

  const productStep = useCallback(() => {
    const rail = railRef.current;
    const card = rail?.firstElementChild;
    if (!rail || !(card instanceof HTMLElement)) return 0;
    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    return card.offsetWidth + gap;
  }, []);

  const scrollProducts = useCallback((direction: -1 | 1, group = false) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = group ? Math.max(productStep(), rail.clientWidth * 0.82) : productStep();
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - step * 0.5;
    const atStart = rail.scrollLeft <= step * 0.5;
    const left = direction === 1 && atEnd ? 0 : direction === -1 && atStart ? rail.scrollWidth : rail.scrollLeft + direction * step;
    rail.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [productStep]);

  useEffect(() => {
    if (!paused) return;
    const resume = window.setTimeout(() => setPaused(false), RESUME_MS);
    return () => window.clearTimeout(resume);
  }, [interaction, paused]);

  useEffect(() => {
    if (paused || products.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const autoplay = window.setInterval(() => scrollProducts(1), AUTOPLAY_MS);
    return () => window.clearInterval(autoplay);
  }, [paused, products.length, scrollProducts]);

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
      <div className="group/rail relative -mx-4">
        <div
          ref={railRef}
          className="no-scrollbar flex cursor-grab touch-pan-x snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 select-none active:cursor-grabbing"
          onPointerDown={(event) => {
            pauseTemporarily();
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            const rail = railRef.current;
            if (!rail) return;
            dragRef.current = { active: true, startX: event.clientX, startScroll: rail.scrollLeft, moved: false };
            rail.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const rail = railRef.current;
            const drag = dragRef.current;
            if (!rail || !drag.active) return;
            const distance = event.clientX - drag.startX;
            if (Math.abs(distance) > 6) drag.moved = true;
            rail.scrollLeft = drag.startScroll - distance;
          }}
          onPointerUp={(event) => {
            const rail = railRef.current;
            if (rail?.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
            dragRef.current.active = false;
          }}
          onPointerCancel={() => { dragRef.current.active = false; }}
          onClickCapture={(event) => {
            if (!dragRef.current.moved) return;
            event.preventDefault();
            event.stopPropagation();
            dragRef.current.moved = false;
          }}
          onTouchStart={pauseTemporarily}
          onWheel={pauseTemporarily}
          aria-label={`${title} ürün şeridi`}
        >
          {products.map((p) => (
            <div key={p.slug} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[23%]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {products.length > 1 && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`${title} önceki ürünler`}
              onClick={() => { pauseTemporarily(); scrollProducts(-1, true); }}
              className="absolute left-1 top-[38%] z-20 hidden h-10 w-10 -translate-y-1/2 border-border bg-background/90 opacity-60 shadow-elevated backdrop-blur-sm hover:border-gold hover:text-gold hover:opacity-100 lg:inline-flex"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`${title} sonraki ürünler`}
              onClick={() => { pauseTemporarily(); scrollProducts(1, true); }}
              className="absolute right-1 top-[38%] z-20 hidden h-10 w-10 -translate-y-1/2 border-border bg-background/90 opacity-60 shadow-elevated backdrop-blur-sm hover:border-gold hover:text-gold hover:opacity-100 lg:inline-flex"
            >
              <ChevronRight />
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
