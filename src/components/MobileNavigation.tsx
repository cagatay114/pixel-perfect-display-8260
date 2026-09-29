import { Link } from "@tanstack/react-router";
import { Flame, Heart, Home, ShoppingBag, User } from "lucide-react";
import { useShop } from "@/lib/store";

const navigationItems = [
  { label: "Anasayfa", to: "/", icon: Home, exact: true },
  { label: "Favorilerim", to: "/favoriler", icon: Heart },
  { label: "Sepetim", to: "/sepet", icon: ShoppingBag },
  { label: "Hesabım", to: "/hesabim", icon: User },
] as const;

export function MobileNavigation() {
  const { count } = useShop();

  return (
    <>
      <Link
        to="/cok-satanlar"
        aria-label="Çok Satanlar"
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] left-4 z-40 flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full bg-gold px-2 text-center text-primary-foreground shadow-elevated transition-transform hover:scale-105 md:hidden"
        activeProps={{ className: "ring-2 ring-ring ring-offset-2 ring-offset-background" }}
      >
        <Flame className="h-5 w-5" strokeWidth={1.75} />
        <span className="text-[10px] font-semibold uppercase leading-tight">Çok Satanlar</span>
      </Link>

      <nav
        aria-label="Mobil ana gezinme"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="grid h-16 grid-cols-4">
          {navigationItems.map(({ label, to, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              className="relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-muted-foreground transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                {to === "/sepet" && count > 0 && (
                  <span className="absolute -right-3 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-semibold text-primary-foreground">
                    {count}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}