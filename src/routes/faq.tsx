import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/data/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Exness India" }] }),
  component: FaqPage,
});

function FaqPage() {
  const cats = useMemo(() => Array.from(new Set(FAQS.map((f) => f.category))), []);
  const [cat, setCat] = useState<string>("All");
  const list = cat === "All" ? FAQS : FAQS.filter((f) => f.category === cat);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">FAQ</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">Frequently asked questions</h1>
        <div className="mt-6 flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1 text-xs">
          {["All", ...cats].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded px-3 py-1.5 font-medium",
                cat === c
                  ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <Accordion type="single" collapsible className="mt-8">
          {list.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="border-b border-border/60">
              <AccordionTrigger className="text-left font-medium hover:text-[color:var(--gold)]">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <SiteFooter />
    </div>
  );
}
