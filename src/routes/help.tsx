import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, MessageCircle, Mail, Book } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help Center — Exness India" }] }),
  component: HelpPage,
});

const CARDS = [
  {
    icon: Book,
    t: "Knowledge base",
    d: "200+ articles covering accounts, trading and platform features.",
    to: "/faq" as const,
  },
  {
    icon: MessageCircle,
    t: "Live chat",
    d: "Average wait time under 2 minutes, 24×7.",
    to: "/contact" as const,
  },
  {
    icon: Mail,
    t: "Email support",
    d: "Get a thorough response within 4 business hours.",
    to: "/contact" as const,
  },
  {
    icon: LifeBuoy,
    t: "Account recovery",
    d: "Locked out? Reset your password in 2 minutes.",
    to: "/forgot-password" as const,
  },
];

function HelpPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Help Center</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">
          How can we <span className="gold-text">help?</span>
        </h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {CARDS.map((c) => (
            <Link
              key={c.t}
              to={c.to}
              className="glossy rounded-2xl p-6 transition-transform hover:-translate-y-0.5"
            >
              <c.icon className="h-6 w-6 text-[color:var(--gold)]" />
              <h3 className="mt-3 font-display text-lg font-bold">{c.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
