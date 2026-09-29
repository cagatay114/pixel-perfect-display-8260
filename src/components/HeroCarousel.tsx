import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";

const AUTOPLAY_MS = 5500;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const touchStart = useRef<number | null>(null);
  const count = slides.length;

  const goTo = useCallback((index: number) => {
    setActive((index + count) % count);
    setCycle((value) => value + 1);
  }, [count]);

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, cycle, paused]);

  return (
    <section
      className="relative h-[58svh] min-h-88 max-h-136 overflow-hidden border-b border-border bg-background md:h-[clamp(26rem,calc(100svh-15rem),43rem)] md:max-h-none"
      aria-roledescription="carousel"
      aria-label="RK Collection öne çıkanlar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        touchStart.current = null;
        if (start === null || end === undefined || Math.abs(start - end) < 45) return;
        goTo(active + (start > end ? 1 : -1));
      }}
    >
      {slides.map((slide, index) => (
        <article
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${index === active ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={index !== active}
          aria-label={`${index + 1} / ${count}`}
        >
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className={`hero-placeholder hero-placeholder-${(index % 3) + 1} absolute inset-0`} aria-hidden="true" />
          )}
          <div className="absolute inset-0 bg-overlay" />
          <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 pb-14 pt-8 sm:px-12 md:px-20 lg:px-24">
            <div className="max-w-3xl text-background dark:text-foreground">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold">{slide.eyebrow}</p>
              <h1 className="mt-3 max-w-2xl text-4xl leading-[0.98] sm:text-5xl md:text-6xl lg:text-7xl">{slide.title}</h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/85 dark:text-foreground/85 sm:text-base">{slide.subtitle}</p>
              <Link
                to="/kategori/$slug"
                params={{ slug: slide.buttonLink }}
                className="btn-gold mt-6"
                tabIndex={index === active ? 0 : -1}
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        </article>
      ))}

      {count > 1 && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => goTo(active - 1)}
            aria-label="Önceki banner"
            className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 border-foreground/40 bg-background/20 text-foreground backdrop-blur-sm hover:border-gold hover:bg-background/35 sm:inline-flex md:left-6 md:h-12 md:w-12"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => goTo(active + 1)}
            aria-label="Sonraki banner"
            className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 border-foreground/40 bg-background/20 text-foreground backdrop-blur-sm hover:border-gold hover:bg-background/35 sm:inline-flex md:right-6 md:h-12 md:w-12"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label="Banner seçimi">
            {slides.map((slide, index) => (
              <Button
                key={slide.id}
                type="button"
                variant="ghost"
                size="icon"
                role="tab"
                aria-selected={index === active}
                aria-label={`${index + 1}. bannerı göster`}
                onClick={() => goTo(index)}
                className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-transparent"
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}