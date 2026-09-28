import { STORE } from "./data";

export type InfoPage = { slug: string; title: string; paragraphs: string[] };

export const infoPages: InfoPage[] = [
  {
    slug: "hakkimizda",
    title: "Hakkımızda",
    paragraphs: [
      "RK Collection, Bucak / Burdur'daki mağazasında başladığı erkek giyim işini bugün kendi etiketiyle çevrim içine taşıyor. Amacımız sade kalıpları, doğru kumaşla ve dürüst fiyatla buluşturmak.",
      "Koleksiyonumuzdaki her parça kendi etiketimizle üretilir ve satılır; üçüncü taraf markaların isim veya logolarını kullanmayız.",
      `Mağaza: ${STORE.address}. Çalışma saatleri: ${STORE.hours}.`,
    ],
  },
  {
    slug: "iletisim",
    title: "İletişim",
    paragraphs: [
      `Adres: ${STORE.address}`,
      `Telefon / WhatsApp: ${STORE.phone}`,
      `Çalışma saatleri: ${STORE.hours}`,
      "Sipariş, kargo ve iade süreçleriyle ilgili tüm sorularınız için telefon veya WhatsApp üzerinden bize ulaşabilirsiniz. Mesajlarınızı çalışma saatleri içinde en kısa sürede yanıtlıyoruz.",
    ],
  },
  {
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    paragraphs: [
      "TASLAK METİN — Yayına almadan önce hukuk danışmanınıza kontrol ettirin.",
      "1. Taraflar: SATICI olarak RK Collection (Bucak / Burdur) ile ALICI olarak sipariş formunda bilgileri yer alan tüketici arasında, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak işbu sözleşme kurulmuştur.",
      "2. Konu: Sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesi üzerinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı sipariş özetinde belirtilen ürünün satışı ve teslimidir. Tüm fiyatlar KDV dahildir.",
      "3. Teslimat: Ürün, sipariş onayından sonra en geç 30 gün içinde ALICI'nın belirttiği adrese kargo ile teslim edilir. Uygulamada siparişler 1-3 iş günü içinde kargoya verilir. 1500 TL ve üzeri siparişlerde kargo ücreti SATICI'ya aittir.",
      "4. Cayma Hakkı: ALICI, teslim tarihinden itibaren 14 gün içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkına sahiptir. Cayma hakkının kullanımına ilişkin usul, İade ve Cayma Hakkı sayfasında açıklanmıştır.",
      "5. Cayma hakkının kullanılamayacağı haller: Kişiye özel üretilen, hijyen sebebiyle iadeye uygun olmayan veya kullanım sonucu yeniden satılabilirliğini yitirmiş ürünlerde cayma hakkı kullanılamaz.",
      "6. Uyuşmazlıklar: Şikâyet ve itirazlar için ALICI, yerleşim yerindeki Tüketici Hakem Heyetine veya Tüketici Mahkemesine başvurabilir.",
    ],
  },
  {
    slug: "on-bilgilendirme-formu",
    title: "Ön Bilgilendirme Formu",
    paragraphs: [
      "TASLAK METİN — Yayına almadan önce hukuk danışmanınıza kontrol ettirin.",
      `Satıcı: RK Collection — ${STORE.address} — ${STORE.phone}`,
      "Ürün bilgileri: Sipariş edilecek ürünün adı, adedi, rengi, bedeni ve KDV dahil satış fiyatı ödeme adımındaki sipariş özetinde gösterilir.",
      "Ödeme şekli: Kredi/banka kartı ile 3D Secure güvenli ödeme veya kapıda ödeme (aktif olduğu dönemlerde, ek hizmet bedeli sipariş özetinde belirtilir).",
      "Teslimat: Anlaşmalı kargo firması aracılığıyla, ALICI'nın bildirdiği adrese. Kargo bedeli 1500 TL altı siparişlerde ALICI'ya aittir.",
      "Cayma hakkı: Teslimden itibaren 14 gün. Cayma bildirimi telefon, WhatsApp veya e-posta yoluyla yapılabilir; iade kargo süreci ve koşulları İade ve Cayma Hakkı sayfasında açıklanmıştır.",
      "ALICI, siparişi onaylamakla bu ön bilgilendirme formunu okuduğunu ve kabul ettiğini beyan eder.",
    ],
  },
  {
    slug: "iade-ve-cayma-hakki",
    title: "İade ve Cayma Hakkı",
    paragraphs: [
      "TASLAK METİN — Yayına almadan önce hukuk danışmanınıza kontrol ettirin.",
      "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Cayma bildiriminizi telefon veya WhatsApp üzerinden bize iletmeniz yeterlidir.",
      "İade edilecek ürünün kullanılmamış, yıkanmamış, etiketleri sökülmemiş ve orijinal ambalajıyla birlikte olması gerekir.",
      "Cayma hakkının usulüne uygun kullanılması hâlinde ürün bedeli, ürünün tarafımıza ulaşmasından itibaren en geç 14 gün içinde ödeme yaptığınız yöntemle iade edilir. Kartla yapılan ödemelerde bankanıza bağlı olarak hesabınıza yansıma süresi değişebilir.",
      "Ayıplı, eksik veya hatalı gönderilen ürünlerin iade kargo bedeli tarafımıza aittir.",
      "Hijyen gerekçesiyle iç giyim ve benzeri ürünlerde, ambalajı açılmış olması hâlinde cayma hakkı kullanılamaz.",
    ],
  },
  {
    slug: "gizlilik-ve-kvkk",
    title: "Gizlilik ve KVKK Aydınlatma Metni",
    paragraphs: [
      "TASLAK METİN — Yayına almadan önce hukuk danışmanınıza kontrol ettirin.",
      "Veri sorumlusu: RK Collection. Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, aşağıda açıklanan amaçlarla işlenmektedir.",
      "İşlenen veriler: Ad-soyad, telefon, e-posta, teslimat ve fatura adresi, sipariş ve ödeme işlem bilgileri, site kullanım kayıtları.",
      "İşleme amaçları: Siparişin oluşturulması ve teslimi, ödeme işlemlerinin yürütülmesi, iade ve destek taleplerinin karşılanması, yasal saklama ve bilgilendirme yükümlülüklerinin yerine getirilmesi, onay vermeniz hâlinde kampanya bildirimleri.",
      "Aktarım: Verileriniz yalnızca hizmetin gereği ölçüsünde kargo firmaları, ödeme kuruluşu (iyzico) ve yasal olarak yetkili kamu kurumlarıyla paylaşılır. Kart bilgileriniz tarafımızca saklanmaz.",
      "Haklarınız: KVKK m.11 uyarınca verilerinize erişme, düzeltilmesini, silinmesini veya işlenmesinin kısıtlanmasını isteme ve işlemeye itiraz etme hakkına sahipsiniz. Taleplerinizi iletişim kanallarımızdan bize ulaştırabilirsiniz.",
    ],
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    paragraphs: [
      "TASLAK METİN — Yayına almadan önce hukuk danışmanınıza kontrol ettirin.",
      "Sitemizde, alışveriş deneyiminizi sürdürebilmek için zorunlu çerezler ve tarayıcı depolaması kullanılır. Sepetiniz ve favorileriniz bu sayede cihazınızda saklanır.",
      "Performans ve ölçümleme amaçlı çerezler yalnızca onayınız doğrultusunda kullanılır; tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz.",
      "Zorunlu çerezleri engellemeniz hâlinde sepet ve favori gibi temel özellikler çalışmayabilir.",
    ],
  },
];

export const getInfoPage = (slug: string) => infoPages.find((p) => p.slug === slug);
