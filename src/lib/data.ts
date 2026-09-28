import tshirt from "@/assets/p-tshirt.jpg";
import sweat from "@/assets/p-sweat.jpg";
import gomlek from "@/assets/p-gomlek.jpg";
import pantolon from "@/assets/p-pantolon.jpg";
import mont from "@/assets/p-mont.jpg";
import ayakkabi from "@/assets/p-ayakkabi.jpg";

export type SubCategory = { slug: string; name: string };
export type Category = { slug: string; name: string; subs?: SubCategory[] };

export const categories: Category[] = [
  { slug: "indirim", name: "İndirim" },
  { slug: "yeni-gelenler", name: "Yeni Gelenler" },
  { slug: "t-shirt", name: "T-Shirt" },
  { slug: "sweat", name: "Sweat" },
  { slug: "gomlek", name: "Gömlek" },
  { slug: "ceket", name: "Ceket" },
  {
    slug: "pantolon",
    name: "Pantolon",
    subs: [
      { slug: "jean", name: "Jean" },
      { slug: "baggy", name: "Baggy" },
      { slug: "kumas", name: "Kumaş" },
      { slug: "keten", name: "Keten" },
    ],
  },
  { slug: "esofman-alti", name: "Eşofman Altı" },
  { slug: "mont", name: "Mont" },
  { slug: "hirka", name: "Hırka" },
  { slug: "trenckot", name: "Trençkot" },
  { slug: "sort", name: "Şort" },
  { slug: "takim", name: "Takım" },
  { slug: "ayakkabi", name: "Ayakkabı" },
];

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

const apparelSizes = (stocks: number[] = [4, 6, 6, 3, 2]): SizeStock[] =>
  ["S", "M", "L", "XL", "XXL"].map((size, i) => ({ size, stock: stocks[i] ?? 0 }));

const pantSizes = (stocks: number[] = [3, 5, 5, 2, 0]): SizeStock[] =>
  ["29", "30", "31", "32", "34"].map((size, i) => ({ size, stock: stocks[i] ?? 0 }));

const shoeSizes = (stocks: number[] = [2, 4, 5, 3, 1]): SizeStock[] =>
  ["40", "41", "42", "43", "44"].map((size, i) => ({ size, stock: stocks[i] ?? 0 }));

const desc =
  "RK Collection etiketli, uzun ömürlü kumaş seçimi ve dengeli kalıbıyla günlük kullanıma uygun bir parça. Bucak mağazamızda da deneyebilirsiniz.";

export const products: Product[] = [
  {
    id: "1",
    slug: "atlas-basic-t-shirt-siyah",
    name: "Atlas Basic T-Shirt",
    category: "t-shirt",
    price: 449,
    oldPrice: 649,
    isNew: true,
    color: "Siyah",
    colorHex: "#111111",
    siblings: ["atlas-basic-t-shirt-krem"],
    images: [tshirt, sweat],
    description: desc,
    sizes: apparelSizes([5, 8, 8, 4, 2]),
  },
  {
    id: "2",
    slug: "atlas-basic-t-shirt-krem",
    name: "Atlas Basic T-Shirt",
    category: "t-shirt",
    price: 449,
    oldPrice: 649,
    color: "Krem",
    colorHex: "#E8E2D2",
    siblings: ["atlas-basic-t-shirt-siyah"],
    images: [sweat, tshirt],
    description: desc,
    sizes: apparelSizes([2, 4, 0, 3, 1]),
  },
  {
    id: "3",
    slug: "roka-supreme-t-shirt",
    name: "Roka Supima T-Shirt",
    category: "t-shirt",
    price: 529,
    isNew: true,
    color: "Antrasit",
    colorHex: "#2C2C2C",
    images: [tshirt, gomlek],
    description: desc,
    sizes: apparelSizes(),
  },
  {
    id: "4",
    slug: "kule-oversize-sweat-krem",
    name: "Kule Oversize Sweat",
    category: "sweat",
    price: 899,
    oldPrice: 1199,
    isNew: true,
    color: "Krem",
    colorHex: "#E8E2D2",
    siblings: ["kule-oversize-sweat-siyah"],
    images: [sweat, tshirt],
    description: desc,
    sizes: apparelSizes([3, 6, 7, 4, 0]),
  },
  {
    id: "5",
    slug: "kule-oversize-sweat-siyah",
    name: "Kule Oversize Sweat",
    category: "sweat",
    price: 899,
    color: "Siyah",
    colorHex: "#111111",
    siblings: ["kule-oversize-sweat-krem"],
    images: [tshirt, sweat],
    description: desc,
    sizes: apparelSizes([2, 5, 5, 2, 1]),
  },
  {
    id: "6",
    slug: "meridyen-keten-gomlek",
    name: "Meridyen Keten Gömlek",
    category: "gomlek",
    price: 1099,
    isNew: true,
    color: "Lacivert",
    colorHex: "#1E2A44",
    images: [gomlek, sweat],
    description: desc,
    sizes: apparelSizes([4, 5, 5, 3, 1]),
  },
  {
    id: "7",
    slug: "liman-oxford-gomlek",
    name: "Liman Oxford Gömlek",
    category: "gomlek",
    price: 949,
    oldPrice: 1249,
    color: "İndigo",
    colorHex: "#26375C",
    images: [gomlek, tshirt],
    description: desc,
    sizes: apparelSizes([1, 4, 4, 2, 0]),
  },
  {
    id: "8",
    slug: "efe-blazer-ceket",
    name: "Efe Blazer Ceket",
    category: "ceket",
    price: 2299,
    color: "Antrasit",
    colorHex: "#2C2C2C",
    images: [mont, gomlek],
    description: desc,
    sizes: apparelSizes([2, 3, 3, 2, 1]),
  },
  {
    id: "9",
    slug: "arden-suet-ceket",
    name: "Arden Süet Ceket",
    category: "ceket",
    price: 2799,
    oldPrice: 3499,
    isNew: true,
    color: "Camel",
    colorHex: "#B8895A",
    images: [mont, pantolon],
    description: desc,
    sizes: apparelSizes([1, 3, 4, 2, 0]),
  },
  {
    id: "10",
    slug: "rota-baggy-jean",
    name: "Rota Baggy Jean",
    category: "pantolon",
    subcategory: "baggy",
    price: 1249,
    oldPrice: 1599,
    isNew: true,
    color: "Yıkanmış Siyah",
    colorHex: "#232323",
    images: [pantolon, tshirt],
    description: desc,
    sizes: pantSizes([3, 6, 6, 4, 1]),
  },
  {
    id: "11",
    slug: "mavi-hat-slim-jean",
    name: "Hat Slim Jean",
    category: "pantolon",
    subcategory: "jean",
    price: 1149,
    color: "Koyu Mavi",
    colorHex: "#2B3A55",
    images: [pantolon, gomlek],
    description: desc,
    sizes: pantSizes(),
  },
  {
    id: "12",
    slug: "divan-kumas-pantolon",
    name: "Divan Kumaş Pantolon",
    category: "pantolon",
    subcategory: "kumas",
    price: 1349,
    color: "Siyah",
    colorHex: "#111111",
    images: [pantolon, mont],
    description: desc,
    sizes: pantSizes([2, 4, 4, 3, 2]),
  },
  {
    id: "13",
    slug: "ada-keten-pantolon",
    name: "Ada Keten Pantolon",
    category: "pantolon",
    subcategory: "keten",
    price: 1199,
    oldPrice: 1499,
    color: "Bej",
    colorHex: "#C9B79A",
    images: [pantolon, sweat],
    description: desc,
    sizes: pantSizes([1, 3, 3, 2, 0]),
  },
  {
    id: "14",
    slug: "sade-esofman-alti",
    name: "Sade Jogger Eşofman Altı",
    category: "esofman-alti",
    price: 749,
    isNew: true,
    color: "Antrasit",
    colorHex: "#2C2C2C",
    images: [pantolon, tshirt],
    description: desc,
    sizes: apparelSizes([4, 6, 6, 3, 2]),
  },
  {
    id: "15",
    slug: "kuzey-kaban-camel",
    name: "Kuzey Yün Kaban",
    category: "mont",
    price: 3499,
    oldPrice: 4299,
    isNew: true,
    color: "Camel",
    colorHex: "#B8895A",
    siblings: ["kuzey-kaban-siyah"],
    images: [mont, gomlek],
    description: desc,
    sizes: apparelSizes([2, 4, 4, 3, 1]),
  },
  {
    id: "16",
    slug: "kuzey-kaban-siyah",
    name: "Kuzey Yün Kaban",
    category: "mont",
    price: 3499,
    color: "Siyah",
    colorHex: "#111111",
    siblings: ["kuzey-kaban-camel"],
    images: [mont, tshirt],
    description: desc,
    sizes: apparelSizes([1, 3, 3, 2, 0]),
  },
  {
    id: "17",
    slug: "yamac-yun-hirka",
    name: "Yamaç Yün Hırka",
    category: "hirka",
    price: 1399,
    oldPrice: 1799,
    color: "Krem",
    colorHex: "#E8E2D2",
    images: [sweat, mont],
    description: desc,
    sizes: apparelSizes([3, 5, 5, 2, 1]),
  },
  {
    id: "18",
    slug: "pelerin-trenckot",
    name: "Pelerin Trençkot",
    category: "trenckot",
    price: 3199,
    isNew: true,
    color: "Camel",
    colorHex: "#B8895A",
    images: [mont, pantolon],
    description: desc,
    sizes: apparelSizes([1, 3, 3, 2, 0]),
  },
  {
    id: "19",
    slug: "kumsal-sort",
    name: "Kumsal Şort",
    category: "sort",
    price: 649,
    oldPrice: 849,
    color: "Bej",
    colorHex: "#C9B79A",
    images: [pantolon, sweat],
    description: desc,
    sizes: apparelSizes([3, 5, 5, 2, 1]),
  },
  {
    id: "20",
    slug: "protokol-takim",
    name: "Protokol Takım Elbise",
    category: "takim",
    price: 4499,
    isNew: true,
    color: "Antrasit",
    colorHex: "#2C2C2C",
    images: [mont, gomlek],
    description: desc,
    sizes: apparelSizes([1, 2, 3, 2, 1]),
  },
  {
    id: "21",
    slug: "tabaka-deri-sneaker",
    name: "Tabaka Deri Sneaker",
    category: "ayakkabi",
    price: 1899,
    oldPrice: 2399,
    isNew: true,
    color: "Siyah",
    colorHex: "#111111",
    images: [ayakkabi, pantolon],
    description: desc,
    sizes: shoeSizes(),
  },
  {
    id: "22",
    slug: "kaide-deri-bot",
    name: "Kaide Deri Bot",
    category: "ayakkabi",
    price: 2249,
    color: "Siyah",
    colorHex: "#111111",
    images: [ayakkabi, mont],
    description: desc,
    sizes: shoeSizes([1, 3, 4, 3, 2]),
  },
];

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

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

export function productsForCategory(slug: string, sub?: string): Product[] {
  if (slug === "indirim") return products.filter((p) => p.oldPrice);
  if (slug === "yeni-gelenler") return products.filter((p) => p.isNew);
  return products.filter(
    (p) => p.category === slug && (!sub || p.subcategory === sub),
  );
}

export const allColors = Array.from(
  new Map(products.map((p) => [p.color, p.colorHex])).entries(),
).map(([name, hex]) => ({ name, hex }));

export const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes.map((s) => s.size))));
