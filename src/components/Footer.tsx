import { Link } from "@tanstack/react-router";
import { STORE, categories } from "@/lib/data";

const legalPages = [
  { slug: "hakkimizda", name: "Hakkımızda" },
  { slug: "iletisim", name: "İletişim" },
  { slug: "mesafeli-satis-sozlesmesi", name: "Mesafeli Satış Sözleşmesi" },
  { slug: "on-bilgilendirme-formu", name: "Ön Bilgilendirme Formu" },
  { slug: "iade-ve-cayma-hakki", name: "İade ve Cayma Hakkı" },
  { slug: "gizlilik-ve-kvkk", name: "Gizlilik ve KVKK Aydınlatma Metni" },
  { slug: "cerez-politikasi", name: "Çerez Politikası" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="border border-gold px-2 py-0.5 font-display text-xl leading-none text-gold">
              RK
            </span>
            <span className="font-display text-lg">Collection</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Bucak / Burdur'daki mağazamızdan çıkan erkek giyim koleksiyonu. Kendi etiketimiz,
            kendi kalıbımız.
          </p>
        </div>

        <div>
          <h3 className="eyebrow">Kategoriler</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {categories.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/kategori/$slug"
                  params={{ slug: c.slug }}
                  className="hover:text-gold"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Kurumsal</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {legalPages.map((p) => (
              <li key={p.slug}>
                <Link to="/bilgi/$slug" params={{ slug: p.slug }} className="hover:text-gold">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Mağazamız</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>{STORE.address}</li>
            <li>
              <a href={`tel:${STORE.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                {STORE.phone}
              </a>
            </li>
            <li>{STORE.hours}</li>
            <li>
              <a
                href={STORE.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold hover:underline"
              >
                Haritada gör
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} RK Collection. Tüm fiyatlar KDV dahildir.
      </div>
    </footer>
  );
}

export { legalPages };
