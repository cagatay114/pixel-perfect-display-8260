import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getInfoPage, infoPages } from "@/lib/legal";

export const Route = createFileRoute("/bilgi/$slug")({
  loader: ({ params }) => {
    const page = getInfoPage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Sayfa bulunamadı | RK Collection" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.page.title} | RK Collection`;
    const description = loaderData.page.paragraphs[1] ?? loaderData.page.paragraphs[0] ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 160) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 160) },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: InfoPageView,
});

function InfoPageView() {
  const { page } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Ana sayfa
        </Link>{" "}
        / <span className="text-foreground">{page.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-[1fr_220px]">
        <article>
          <h1 className="text-4xl md:text-5xl">{page.title}</h1>
          <div className="gold-rule mt-5 w-24" />
          <div className="mt-7 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {page.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </article>

        <aside className="h-fit border border-border p-5">
          <h2 className="eyebrow">Kurumsal</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {infoPages.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/bilgi/$slug"
                  params={{ slug: p.slug }}
                  className="text-muted-foreground hover:text-gold"
                  activeProps={{ className: "text-gold" }}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
