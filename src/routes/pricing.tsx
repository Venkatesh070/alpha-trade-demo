import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/data/content";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Exness India" }] }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Pricing</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Transparent <span className="gold-text">pricing</span></h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">No hidden fees. Choose a plan and trade. Switch any time.</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PRICING.map((p) => (
            <div key={p.name} className={"relative rounded-2xl p-6 " + (p.featured ? "glossy ring-gold" : "glossy-soft")}>
              {p.featured && <span className="absolute -top-3 left-6 rounded-full bg-[color:var(--gold)] px-3 py-1 text-xs font-semibold text-[color:var(--primary-foreground)]">Most popular</span>}
              <div className="font-display text-2xl font-bold">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.tagline}</div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Spread</div><div className="font-mono">{p.spread}</div></div>
                <div><div className="text-xs text-muted-foreground">Commission</div><div className="font-mono">{p.commission}</div></div>
                <div><div className="text-xs text-muted-foreground">Leverage</div><div className="font-mono">{p.leverage}</div></div>
                <div><div className="text-xs text-muted-foreground">Min deposit</div><div className="font-mono">{p.minDeposit}</div></div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-[color:var(--gold)]" /><span>{f}</span></li>)}
              </ul>
              <Button asChild className={"mt-6 w-full " + (p.featured ? "gold-button hover:gold-button-hover" : "")} variant={p.featured ? "default" : "outline"}>
                <Link to="/register">Get started</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
