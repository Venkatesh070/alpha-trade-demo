import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, BookOpen, Video, Activity } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

const COURSES = [
  {
    icon: BookOpen,
    level: "Beginner",
    title: "Forex 101",
    lessons: 18,
    desc: "Currencies, pips, lots and order types — everything you need to start.",
  },
  {
    icon: Video,
    level: "Beginner",
    title: "Reading candlestick charts",
    lessons: 12,
    desc: "Master the language of price action.",
  },
  {
    icon: Activity,
    level: "Intermediate",
    title: "Risk management masterclass",
    lessons: 9,
    desc: "Sizing, stops, expectancy and equity curves.",
  },
  {
    icon: GraduationCap,
    level: "Advanced",
    title: "Algorithmic strategies",
    lessons: 22,
    desc: "From backtest to deployment with the Exness API.",
  },
  {
    icon: BookOpen,
    level: "Beginner",
    title: "Crypto markets",
    lessons: 14,
    desc: "Spot vs perpetuals, funding rates, on-chain signals.",
  },
  {
    icon: Video,
    level: "Intermediate",
    title: "Indices & macro",
    lessons: 11,
    desc: "Trading S&P 500, Nifty and DAX around macro events.",
  },
];

export const Route = createFileRoute("/education")({
  head: () => ({ meta: [{ title: "Trading Academy — Exness India" }] }),
  component: EducationPage,
});

function EducationPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Education</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">
          The Exness <span className="gold-text">Trading Academy</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          200+ lessons, daily live webinars and weekly market breakdowns — built with India's top
          traders.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c) => (
            <div key={c.title} className="glossy rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <c.icon className="h-6 w-6 text-[color:var(--gold)]" />
                <span className="rounded bg-accent px-2 py-0.5 text-[11px] uppercase text-muted-foreground">
                  {c.level}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-4 text-xs text-muted-foreground">
                {c.lessons} lessons · self-paced
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
