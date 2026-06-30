import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BLOGS } from "@/data/content";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Blog — Exness India" }] }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Blog</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">Market insights & trader playbooks</h1>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOGS.map((b) => (
            <article key={b.slug} className="glossy rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-[color:var(--gold)]/15 px-2 py-0.5 text-[color:var(--gold)]">{b.category}</span>
                <span className="text-muted-foreground">{b.readMin} min read</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{b.author}</span><span>{b.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
