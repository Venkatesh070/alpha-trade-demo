import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

const COLS: { title: string; links: { label: string; to: string }[] }[] = [
  { title: "Platform", links: [
    { label: "Markets", to: "/markets" },
    { label: "Trading", to: "/trading" },
    { label: "Pricing", to: "/pricing" },
    { label: "Platform", to: "/platform" },
  ]},
  { title: "Company", links: [
    { label: "About", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" },
  ]},
  { title: "Support", links: [
    { label: "Help Center", to: "/help" },
    { label: "FAQ", to: "/faq" },
    { label: "Education", to: "/education" },
  ]},
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Exness India — a premium demonstration trading platform showcasing forex, crypto, metals, indices and global equities. All trades and balances are simulated.
          </p>
          <p className="mt-6 text-xs text-muted-foreground/70">
            <strong className="text-foreground/80">Risk warning:</strong> Trading derivatives carries substantial risk. This is a demo product and not a solicitation. Past performance is not indicative of future results.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground/80">{c.title}</div>
            <ul className="mt-4 space-y-2">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-foreground/80 hover:text-foreground hover:[text-shadow:0_0_14px_color-mix(in_oklab,var(--gold)_50%,transparent)]">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div>© {new Date().getFullYear()} Exness India — Demo Platform. Not affiliated with any real broker.</div>
          <div className="flex items-center gap-4">
            <span>SEBI guidance simulated</span>
            <span>•</span>
            <span>v1.0 demo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
