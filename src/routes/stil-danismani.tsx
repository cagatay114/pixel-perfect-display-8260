import { createFileRoute } from "@tanstack/react-router";
import { StyleAdvisor } from "@/components/StyleAdvisor";

export const Route = createFileRoute("/stil-danismani")({
  head: () => ({
    meta: [
      { title: "Stil Danışmanı | RK Collection" },
      { name: "description", content: "İhtiyacınızı anlatın; RK Collection kataloğundan size uygun erkek giyim ürünlerini bulun." },
      { property: "og:title", content: "RK Stil Danışmanı | RK Collection" },
      { property: "og:description", content: "Tarzınıza, bedeninize ve bütçenize göre katalogdan kişisel ürün önerileri alın." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StyleAdvisor,
});