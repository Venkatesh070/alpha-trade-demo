import { createFileRoute, Link } from "@tanstack/react-router";
import { Monitor, Smartphone, TabletSmartphone, Cpu, Layers, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/platform")({
  head: () => ({ meta: [{ title: "Trading Platforms — Exness India" }] }),
  component: PlatformPage,
});

const PLATFORMS = [
  {
    icon: Monitor,
    name: "WebTerminal Pro",
    desc: "Full-featured terminal in your browser — no install, sub-15ms latency.",
    tag: "Most popular",
  },
  {
    icon: Smartphone,
    name: "Exness India · iOS",
    desc: "Native iOS app with FaceID, push price alerts and one-tap copy trading.",
    tag: "iOS 16+",
  },
  {
    icon: TabletSmartphone,
    name: "Exness India · Android",
    desc: "Material You design, biometric login and offline charts.",
    tag: "Android 11+",
  },
  {
    icon: Cpu,
    name: "API & FIX",
    desc: "REST + WebSocket + FIX 4.4 endpoints for algorithmic strategies.",
    tag: "Pro / Institutional",
  },
];

function PlatformPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Platforms</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">
          Trade <span className="gold-text">anywhere.</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Browser, mobile, tablet or your own algo — one account, every device.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="glossy rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <p.icon className="h-7 w-7 text-[color:var(--gold)]" />
                <span className="rounded-full bg-[color:var(--gold)]/15 px-2.5 py-0.5 text-xs text-[color:var(--gold)]">
                  {p.tag}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <Button asChild className="mt-4 gold-button hover:gold-button-hover">
                <Link to="/trading">Open terminal</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {[
            { icon: Zap, t: "Sub-15ms execution", d: "Backed by 12 global liquidity hubs." },
            {
              icon: Layers,
              t: "Multi-chart layouts",
              d: "Up to 9 synchronised charts per workspace.",
            },
            {
              icon: Cpu,
              t: "Strategy backtesting",
              d: "Run historical simulations on 5 years of tick data.",
            },
          ].map((f) => (
            <div key={f.t} className="glossy-soft rounded-2xl p-6">
              <f.icon className="h-6 w-6 text-[color:var(--gold)]" />
              <div className="mt-3 font-semibold">{f.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
