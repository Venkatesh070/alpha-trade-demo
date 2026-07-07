import { Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export const authInputClass = cn(
  "h-10 w-full rounded border border-[#d6dbde] bg-white px-3 text-sm text-[#141d22]",
  "placeholder:text-[#141d22]/40 outline-none transition-colors",
  "focus:border-[#141d22] focus-visible:ring-0",
);

export const authLabelClass = "mb-1 block text-xs font-medium text-[#141d22]/70";

const FOOTER_LINKS = [
  "Privacy Agreement",
  "Risk disclosure",
  "Preventing money laundering",
  "Security instructions",
  "Legal documents",
  "Complaints Handling Policy",
];

export function GoogleAuthButton({
  label,
  onClick,
  disabled = false,
  loading = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded",
        "bg-[#f4f6f7] text-sm font-medium text-[#141d22]",
        "transition-colors hover:bg-[#eceff1] active:bg-[#e3e7e9]",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2.1 1.6-4.7 2.5-7.5 2.5-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.6l6.5 5.5C41.6 35.3 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"
        />
      </svg>
      {loading ? "Connecting…" : label}
    </button>
  );
}

export function AuthShell({
  active,
  children,
}: {
  active: "signin" | "signup";
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#141d22]">
      <header className="border-b border-[#141d22]/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/">
            <Logo showRegion={false} />
          </Link>
          <button
            type="button"
            aria-label="Language"
            className="rounded-full p-2 text-[#141d22]/60 transition-colors hover:bg-[#6c8595]/10 hover:text-[#141d22]"
          >
            <Globe className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-10">
        <div className="w-full max-w-[420px]">
          <h1 className="font-display text-[26px] font-bold leading-tight">Welcome to Exness</h1>

          <div className="mt-6 flex border-b border-[#141d22]/10">
            <Link
              to="/login"
              search={{ redirect: "/app", step: "form" }}
              className={cn(
                "-mb-px flex-1 border-b-2 pb-3 text-center text-sm font-medium transition-colors",
                active === "signin"
                  ? "border-[#141d22] text-[#141d22]"
                  : "border-transparent text-[#141d22]/50 hover:text-[#141d22]",
              )}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              search={{ step: "form" }}
              className={cn(
                "-mb-px flex-1 border-b-2 pb-3 text-center text-sm font-medium transition-colors",
                active === "signup"
                  ? "border-[#141d22] text-[#141d22]"
                  : "border-transparent text-[#141d22]/50 hover:text-[#141d22]",
              )}
            >
              Create an account
            </Link>
          </div>

          <div className="mt-7">{children}</div>
        </div>
      </main>

      <footer className="px-4 pb-10">
        <div className="mx-auto grid max-w-6xl gap-8 text-xs leading-relaxed md:grid-cols-[1fr_220px]">
          <div className="space-y-2.5 text-[#141d22]/60">
            <p>
              Vanvest Limited is registered and regulated by the Financial Services Commission of
              the Republic of Vanuatu under registration number 700276 and has its registered
              office at Law Partners House, Kumul Highway, Port Vila, Vanuatu.
            </p>
            <p>This website is operated by Vanvest Limited.</p>
            <p>
              The entity above is duly authorized to operate under the Exness brand and trademarks.
            </p>
            <p>
              Risk Warning: Online Forex/CFDs are complex instruments and come with a high risk of
              losing money rapidly due to leverage. You should consider whether you understand how
              CFDs work and whether you can afford to take the high risk of losing your money.
              Under no circumstances shall Exness have any liability to any person or entity for
              any loss or damage in whole or part caused by, resulting from, or relating to any
              financial activity.
            </p>
            <p>
              The entity above do not offer services to residents of certain jurisdictions
              including the USA, Canada, Iran, North Korea, Europe, the United Kingdom and others.
            </p>
            <p>
              The information on this website does not constitute investment advice or a
              recommendation or a solicitation to engage in any investment activity.
            </p>
            <p>
              The information on the website may only be copied with the express written
              permission of Exness.
            </p>
            <p>
              Exness complies with the Payment Card Industry Data Security Standard (PCI DSS) to
              ensure your security and privacy. We conduct regular vulnerability scans and
              penetration tests in accordance with the PCI DSS requirements for our business
              model.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {FOOTER_LINKS.map((label) => (
              <a key={label} href="#" className="text-[#158bf9] hover:underline">
                {label}
              </a>
            ))}
            <p className="mt-2 text-[#141d22]/60">© 2008-2026 Exness</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
