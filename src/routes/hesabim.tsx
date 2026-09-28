import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/hesabim")({
  head: () => ({
    meta: [
      { title: "Hesabım | RK Collection" },
      { name: "description", content: "RK Collection üyelik, siparişler ve adres bilgileri." },
      { property: "og:title", content: "Hesabım | RK Collection" },
      { property: "og:description", content: "RK Collection üyelik ve sipariş takibi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="eyebrow">Hesabım</p>
      <h1 className="mt-2 text-4xl">Üyelik yakında açılıyor</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Üye ol / giriş, siparişlerim, adreslerim ve favorilerin hesaba taşınması bir sonraki
        aşamada devreye alınacak. Şimdilik sipariş ve sorularınız için WhatsApp'tan yazabilir ya
        da Bucak'taki mağazamıza uğrayabilirsiniz.
      </p>
      <Link to="/" className="btn-outline mt-8">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
