import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { AnimatedNumber } from "@/components/site/animated-number";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Exness India" },
      {
        name: "description",
        content:
          "Who we are, what we believe, and how we built India's most modern trading experience.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Company</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">
          Built for serious <span className="gold-text">Indian traders.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Exness India is a showcase of what a modern, fast, premium retail brokerage can
          feel like. Our mission is simple: give every trader in India access to institutional-grade
          tools without the complexity.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { v: 482103, l: "Traders" },
            { v: 220, l: "Markets" },
            { v: 14, l: "Avg latency (ms)" },
            { v: 9, l: "Years in market" },
          ].map((s) => (
            <div key={s.l} className="glossy-soft rounded-xl p-4 text-center">
              <div className="font-display text-2xl font-bold gold-text">
                <AnimatedNumber value={s.v} />
              </div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold">Our principles</h2>
        <ul className="mt-4 space-y-3 text-sm text-foreground/90">
          <li className="rounded-lg border border-border/60 p-4">
            <strong>Transparency.</strong> Real spreads, no hidden markups, every fee visible up
            front.
          </li>
          <li className="rounded-lg border border-border/60 p-4">
            <strong>Speed.</strong> Latency is a feature. We measure execution in milliseconds, not
            seconds.
          </li>
          <li className="rounded-lg border border-border/60 p-4">
            <strong>Education.</strong> A trader who understands risk outlasts one who chases
            returns.
          </li>
          <li className="rounded-lg border border-border/60 p-4">
            <strong>Safety.</strong> Segregated funds, 2FA, negative balance protection — by
            default.
          </li>
        </ul>
      </section>
      <SiteFooter />
    </div>
  );
}
