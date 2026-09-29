import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/hesabim")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hesabım | RK Collection" },
      { name: "description", content: "RK Collection üyelik girişi, favoriler ve sepetiniz." },
      { property: "og:title", content: "Hesabım | RK Collection" },
      { property: "og:description", content: "RK Collection hesabınıza giriş yapın." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const { favorites, count } = useShop();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="py-24 text-center text-sm text-muted-foreground">Yükleniyor…</div>;

  if (user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="eyebrow">Hesabım</p>
        <h1 className="mt-2 text-4xl">Hoş geldiniz</h1>
        <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link to="/favoriler" className="border border-border p-4">
            <p className="text-2xl">{favorites.length}</p>
            <p className="text-xs text-muted-foreground">Favori ürün</p>
          </Link>
          <Link to="/sepet" className="border border-border p-4">
            <p className="text-2xl">{count}</p>
            <p className="text-xs text-muted-foreground">Sepetteki ürün</p>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Favorileriniz ve sepetiniz hesabınıza kaydedilir; başka cihazdan girişte de görünür.
        </p>
        <button
          type="button"
          className="btn-outline mt-8"
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("Çıkış yapıldı");
          }}
        >
          Çıkış yap
        </button>
      </div>
    );
  }
  return <AuthForm />;
}

function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Şifre en az 8 karakter olmalı"); return; }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/hesabim` },
      });
      if (error) toast.error(error.message);
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("E-posta veya şifre hatalı ya da e-posta doğrulanmamış");
    }
    setBusy(false);
  }

  if (sent)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl">E-postanızı kontrol edin</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {email} adresine doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra giriş
          yapabilirsiniz.
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="eyebrow">Hesabım</p>
      <h1 className="mt-2 text-4xl">{mode === "signin" ? "Giriş yap" : "Üye ol"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          placeholder="E-posta"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border bg-background px-4 py-3 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Şifre (en az 8 karakter)"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border bg-background px-4 py-3 text-sm"
        />
        <button type="submit" disabled={busy} className="btn-gold w-full">
          {busy ? "Lütfen bekleyin…" : mode === "signin" ? "Giriş yap" : "Hesap oluştur"}
        </button>
      </form>
      <button
        type="button"
        className="btn-outline mt-3 w-full"
        onClick={() =>
          lovable.auth.signInWithOAuth("google", {
            redirect_uri: `${window.location.origin}/hesabim`,
          })
        }
      >
        Google ile devam et
      </button>
      <button
        type="button"
        className="mt-6 w-full text-center text-sm text-muted-foreground underline"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Hesabınız yok mu? Üye olun" : "Zaten üye misiniz? Giriş yapın"}
      </button>
    </div>
  );
}
