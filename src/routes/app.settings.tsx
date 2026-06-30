import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en-IN");
  const [ccy, setCcy] = useState("INR");
  const [emailN, setEmailN] = useState(true);
  const [pushN, setPushN] = useState(true);
  const [smsN, setSmsN] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <section className="glossy space-y-5 rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Appearance</h2>
        <div className="flex items-center justify-between"><Label>Dark mode</Label>
          <Switch checked={theme === "dark"} onCheckedChange={(v) => { setTheme(v ? "dark" : "light"); toast.success(`Switched to ${v ? "dark" : "light"} mode`); }} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label>Language</Label>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en-IN">English (IN)</SelectItem>
              <SelectItem value="hi-IN">हिन्दी</SelectItem>
              <SelectItem value="ta-IN">தமிழ்</SelectItem>
              <SelectItem value="bn-IN">বাংলা</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label>Display currency</Label>
          <Select value={ccy} onValueChange={setCcy}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR · ₹</SelectItem>
              <SelectItem value="USD">USD · $</SelectItem>
              <SelectItem value="EUR">EUR · €</SelectItem>
              <SelectItem value="GBP">GBP · £</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="glossy space-y-4 rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Notifications</h2>
        <div className="flex items-center justify-between"><Label>Email</Label><Switch checked={emailN} onCheckedChange={setEmailN} /></div>
        <div className="flex items-center justify-between"><Label>Push</Label><Switch checked={pushN} onCheckedChange={setPushN} /></div>
        <div className="flex items-center justify-between"><Label>SMS</Label><Switch checked={smsN} onCheckedChange={setSmsN} /></div>
      </section>
    </div>
  );
}
