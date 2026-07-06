import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  TrendingDown,
  Wallet,
  Users,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Globe2,
  Check,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Ticker } from "@/components/site/ticker";
import { AnimatedNumber } from "@/components/site/animated-number";
import { Sparkline } from "@/components/site/sparkline";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GatedPrice, GatedChange, GatedNumber, PriceLockBanner, GatedChart } from "@/components/pricing/price-gate";
import { ALL_ASSETS, getAsset, sparklineFor } from "@/data/markets";
import { FAQS, FEATURES, PRICING, TESTIMONIALS } from "@/data/content";

const ICON_MAP = {
  Zap,
  TrendingDown,
  Wallet,
  Users,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Globe2,
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Exness India — Trade Forex, Crypto, Gold & Stocks" },
      {
        name: "description",
        content:
          "Premium trading platform. Razor-thin spreads from 0.0 pips, 2000:1 leverage, instant UPI deposits, and copy trading.",
      },
      { property: "og:title", content: "Exness India — Premium Trading Platform" },
      {
        property: "og:description",
        content:
          "200+ markets, sub-15ms execution, copy trading and a full trading academy. Open a free account.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const featured = ["XAU/USD", "BTC/USD", "EUR/USD", "NAS100", "AAPL", "US500"];

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-14 sm:px-6 lg:grid-cols-12 lg:pt-20">
          <div className="lg:col-span-7">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 px-3 py-1 text-xs font-medium text-[color:var(--gold)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--gold)] pulse-gold" />
                Live · India edition
              </span>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Trade <span className="gold-text">200+ markets</span>
                <br />
                like an institution.
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                Sub-15ms execution, spreads from 0.0 pips, instant UPI deposits and full copy
                trading — all in a polished terminal built for the Indian market.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="gold-button hover:gold-button-hover h-12 px-6 text-sm font-semibold"
                >
                  <Link to="/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 border border-border bg-surface/60 backdrop-blur hover:bg-accent"
                >
                  <Link to="/trading">Start Trading</Link>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
                {[
                  { label: "Active traders", value: 482103, suffix: "+" },
                  { label: "Markets", value: 220, suffix: "+" },
                  { label: "Avg execution", value: 14, suffix: "ms" },
                ].map((s) => (
                  <div key={s.label} className="glossy-soft rounded-xl p-4">
                    <div className="font-display text-2xl font-bold">
                      <AnimatedNumber value={s.value} />
                      {s.suffix}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroChartCard />
          </div>
        </div>

        <Ticker />
      </section>

      {/* FEATURE BENTO */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeader eyebrow="Why traders choose us" title="Built for serious markets" />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-3 md:[grid-auto-rows:1fr]">
          <BentoCard className="md:col-span-2 md:row-span-2">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[color:var(--gold)]">
                  <BarChart3 className="h-4 w-4" /> Pro terminal
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                  A trading terminal that breathes.
                </h3>
                <p className="mt-3 max-w-md text-sm text-muted-foreground">
                  Lightweight candlesticks, 30+ indicators, multi-chart layouts, hotkeys and
                  one-click execution. Engineered for traders who measure latency in milliseconds.
                </p>
              </div>
              <FakeChartPreview />
            </div>
          </BentoCard>

          {FEATURES.slice(0, 5).map((f) => {
            const Icon = ICON_MAP[f.icon as keyof typeof ICON_MAP] ?? Zap;
            return (
              <BentoCard key={f.title}>
                <Icon className="h-6 w-6 text-[color:var(--gold)]" />
                <h3 className="mt-3 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </BentoCard>
            );
          })}
        </div>
      </section>

      {/* MARKETS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader eyebrow="Markets" title="Trade what the world is moving" />
          <Button asChild variant="ghost" className="text-[color:var(--gold)]">
            <Link to="/markets">
              All markets <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <PriceLockBanner className="mt-6" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((sym) => {
            const a = ALL_ASSETS.find((x) => x.symbol === sym)!;
            const points = sparklineFor(sym);
            const up = a.changePct >= 0;
            return (
              <Link
                key={sym}
                to="/trading"
                search={{ symbol: sym }}
                className="glossy group block rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-lg font-bold">{a.symbol}</div>
                    <div className="text-xs text-muted-foreground">{a.name}</div>
                  </div>
                  <GatedPrice
                    asset={a}
                    price={a.price}
                    changePct={a.changePct}
                    className="text-base"
                    priceClassName="text-base"
                    changeClassName="text-xs"
                  />
                </div>
                <GatedChart className="mt-4 h-16">
                  <Sparkline points={points} up={up} className="h-16 w-full" />
                </GatedChart>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Spread {a.spread}p · 1:{a.leverage}
                  </span>
                  <span className="text-[color:var(--gold)] group-hover:underline">Trade →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="Pricing" title="Plans that scale with you" centered />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className={
                "relative rounded-2xl p-6 " + (p.featured ? "glossy ring-gold" : "glossy-soft")
              }
            >
              {p.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-[color:var(--gold)] px-3 py-1 text-xs font-semibold text-[color:var(--primary-foreground)]">
                  Most popular
                </span>
              )}
              <div className="font-display text-xl font-bold">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.tagline}</div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Spread</div>
                  <div className="font-mono">{p.spread}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Commission</div>
                  <div className="font-mono">{p.commission}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Leverage</div>
                  <div className="font-mono">{p.leverage}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Min deposit</div>
                  <div className="font-mono">{p.minDeposit}</div>
                </div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[color:var(--gold)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={
                  "mt-6 w-full " + (p.featured ? "gold-button hover:gold-button-hover" : "")
                }
                variant={p.featured ? "default" : "outline"}
              >
                <Link to="/register">Get started</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="Loved by Indian traders" title="What our community says" centered />
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="glossy-soft rounded-2xl p-5">
              <div className="flex items-center gap-1 text-[color:var(--gold)]">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm text-foreground/90">“{t.quote}”</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--gold)] text-xs font-bold text-[color:var(--primary-foreground)]">
                  {t.name[0]}
                </div>
                <div className="text-xs">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-muted-foreground">
                    {t.role} · {t.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="FAQ" title="Questions, answered" centered />
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.slice(0, 6).map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="border-b border-border/60">
              <AccordionTrigger className="text-left font-medium hover:text-[color:var(--gold)]">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6 text-center">
          <Button asChild variant="ghost">
            <Link to="/faq" className="text-[color:var(--gold)]">
              View all FAQs →
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto my-10 max-w-7xl px-4 sm:px-6">
        <div className="glossy relative overflow-hidden rounded-3xl p-10 text-center sm:p-16">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Ready to <span className="gold-text">trade smarter?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Open an account in 30 seconds. Instant UPI deposits, instant access to every
            market.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="gold-button hover:gold-button-hover h-12 px-6 text-sm font-semibold"
            >
              <Link to="/register">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 border border-border bg-surface/60"
            >
              <Link to="/trading">Launch Terminal</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  centered,
}: {
  eyebrow: string;
  title: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">{eyebrow}</div>
      <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{title}</h2>
    </div>
  );
}

function BentoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={"glossy rounded-2xl p-6 " + className}>{children}</div>;
}

function HeroChartCard() {
  const asset = getAsset("BTC/USD")!;
  const points = sparklineFor("BTC/USD", 80);
  return (
    <div className="glossy relative rounded-3xl p-4">
      <div className="flex items-center justify-between p-2">
        <div>
          <div className="text-xs text-muted-foreground">BTC / USD · 4H</div>
          <GatedPrice
            asset={asset}
            price={asset.price}
            changePct={asset.changePct}
            showChange={false}
            align="left"
            className="mt-0.5"
            priceClassName="font-display text-2xl font-bold"
          />
        </div>
        <GatedChange
          changePct={asset.changePct}
          className="rounded-md bg-[color:var(--success)]/20 px-2 py-1 text-xs"
        />
      </div>
      <GatedChart className="relative h-64 w-full rounded-xl bg-[color:var(--surface-2)]/60 p-2" lockSize="lg">
        <Sparkline points={points} up className="h-full w-full" />
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background:
              "radial-gradient(60% 40% at 80% 20%, rgba(250,204,21,0.18), transparent 60%)",
          }}
        />
      </GatedChart>
      <div className="mt-3 grid grid-cols-3 gap-2 px-2 text-[11px] text-muted-foreground">
        <div>
          Open
          <div className="font-mono text-foreground">
            <GatedNumber value="67,210" />
          </div>
        </div>
        <div>
          High
          <div className="font-mono text-foreground">
            <GatedNumber value="68,612" />
          </div>
        </div>
        <div>
          Low
          <div className="font-mono text-foreground">
            <GatedNumber value="66,940" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FakeChartPreview() {
  const points = sparklineFor("PREVIEW", 60);
  return (
    <GatedChart className="relative h-48 w-full rounded-xl bg-[color:var(--surface-2)]/60 p-3" lockSize="lg">
      <Sparkline points={points} up className="h-full w-full" />
    </GatedChart>
  );
}
