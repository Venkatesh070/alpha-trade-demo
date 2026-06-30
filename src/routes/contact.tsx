import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Exness India" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Message received — we'll reply within 4 hours.");
    (e.target as HTMLFormElement).reset();
  };
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Contact</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Talk to a real human.</h1>
          <p className="mt-2 text-muted-foreground">We're online 24×7. Average response time under 4 minutes for chat.</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-[color:var(--gold)]" /> +91 80 4567 8900</li>
            <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-[color:var(--gold)]" /> support@exness-india-demo.test</li>
            <li className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-[color:var(--gold)]" /> Live chat — bottom-right of every page</li>
          </ul>
        </div>
        <form onSubmit={submit} className="glossy space-y-4 rounded-2xl p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="n">Name</Label><Input id="n" required /></div>
            <div><Label htmlFor="e">Email</Label><Input id="e" type="email" required /></div>
          </div>
          <div><Label htmlFor="s">Subject</Label><Input id="s" required /></div>
          <div><Label htmlFor="m">Message</Label><Textarea id="m" rows={5} required /></div>
          <Button disabled={loading} className="gold-button hover:gold-button-hover w-full">{loading ? "Sending…" : "Send message"}</Button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}
