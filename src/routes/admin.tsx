import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LayoutDashboard, LogOut, Package, Settings, ShoppingBag, Tags } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Yönetim Paneli | RK Collection" },
      { name: "description", content: "RK Collection mağaza yönetim paneli." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Yönetim Paneli | RK Collection" },
      { property: "og:description", content: "RK Collection mağaza yönetim paneli." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Özet", icon: LayoutDashboard, exact: true },
  { to: "/admin/urunler", label: "Ürünler", icon: Package },
  { to: "/admin/siparisler", label: "Siparişler", icon: ShoppingBag },
  { to: "/admin/kategoriler", label: "Kategoriler", icon: Tags },
  { to: "/admin/ayarlar", label: "Site Ayarları", icon: Settings },
] as const;

function AdminLayout() {
  const access = useAdminAccess();
  const navigate = useNavigate();

  useEffect(() => {
    if (access.status === "forbidden") {
      toast.error("Bu alana erişim yetkiniz yok.");
      navigate({ to: "/", replace: true });
    }
  }, [access.status, navigate]);

  if (access.status === "loading" || access.status === "forbidden") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Yükleniyor…</div>;
  }
  if (access.status === "signed_out") return <AdminLogin />;

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="border-b border-border md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="font-display text-2xl text-gold">RK Collection</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map(({ to, label, icon: Icon, ...rest }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: "exact" in rest }}
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-gold" }}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-5 py-6 md:block">
          <p className="truncate text-xs text-muted-foreground">{access.user.email}</p>
          <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={() => supabase.auth.signOut()}>
            <LogOut className="h-4 w-4" /> Çıkış yap
          </Button>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}

function AdminLogin() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setInfo(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message.includes("confirm") ? "E-postanızı henüz doğrulamadınız." : "E-posta veya şifre hatalı.");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) toast.error(error.message);
      else setInfo("Doğrulama bağlantısı e-postanıza gönderildi. Bağlantıya tıkladıktan sonra buradan giriş yapın.");
    }
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-lg border border-border bg-card p-6">
        <div>
          <p className="eyebrow">RK Collection</p>
          <h1 className="mt-2 font-display text-3xl">{mode === "signin" ? "Yönetici girişi" : "Yönetici hesabı oluştur"}</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input id="password" type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {info && <p className="text-sm text-gold">{info}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Bekleyin…" : mode === "signin" ? "Giriş yap" : "Hesap oluştur"}
        </Button>
        <button type="button" className="w-full text-center text-xs text-muted-foreground underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "İlk kez mi giriyorsunuz? Şifrenizi belirleyin" : "Hesabım var, giriş yap"}
        </button>
      </form>
    </div>
  );
}
