export type SubCategory = { slug: string; name: string };
export type Category = { slug: string; name: string; subs?: SubCategory[] };

export type SizeStock = { size: string; stock: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  oldPrice?: number;
  isNew?: boolean;
  color: string;
  colorHex: string;
  /** Aynı modelin diğer renklerinin slug'ları */
  siblings?: string[];
  images: string[];
  description: string;
  sizes: SizeStock[];
};

export const FREE_SHIPPING_LIMIT = 1500;
export const WHATSAPP_NUMBER = "905412375334";
export const ANNOUNCEMENT = "Yeni sezon indirimlerini kaçırma · 1500 TL üzeri kargo bedava";

export const STORE = {
  name: "RK Collection",
  address: "Konak Mah. Atatürk Cad. No:42, Bucak / Burdur",
  phone: "+90 541 237 53 34",
  hours: "Pazartesi – Cumartesi 09:00 – 21:00 · Pazar 11:00 – 19:00",
  mapUrl: "https://maps.google.com/?q=Bucak+Burdur",
};

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);

export const discountPercent = (p: Product) =>
  p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

export const isInStock = (p: Product) => p.sizes.some((s) => s.stock > 0);

