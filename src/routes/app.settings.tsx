import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingRow({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-4 last:border-0 last:pb-0 first:pt-0">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en-IN");
  const [ccy, setCcy] = useState("INR");
  const [emailN, setEmailN] = useState(true);
  const [pushN, setPushN] = useState(true);
  const [smsN, setSmsN] = useState(false);

  return (
    <PageShell
      eyebrow="Preferences"
      title="Settings"
      description="Customise appearance, language, currency display, and notification channels."
      width="md"
    >
      <DataPanel title="Appearance" description="Visual preferences for the terminal">
        <div className="px-4 sm:px-5">
          <SettingRow label="Dark mode" desc="Use dark theme across the platform">
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => {
                setTheme(v ? "dark" : "light");
                toast.success(`Switched to ${v ? "dark" : "light"} mode`);
              }}
            />
          </SettingRow>
          <SettingRow label="Language">
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-IN">English (IN)</SelectItem>
                <SelectItem value="hi-IN">हिन्दी</SelectItem>
                <SelectItem value="ta-IN">தமிழ்</SelectItem>
                <SelectItem value="bn-IN">বাংলা</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label="Display currency">
            <Select value={ccy} onValueChange={setCcy}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR · ₹</SelectItem>
                <SelectItem value="USD">USD · $</SelectItem>
                <SelectItem value="EUR">EUR · €</SelectItem>
                <SelectItem value="GBP">GBP · £</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </DataPanel>

      <DataPanel title="Notifications" description="Choose how we reach you">
        <div className="px-4 sm:px-5">
          <SettingRow label="Email alerts" desc="Trade confirmations and statements">
            <Switch checked={emailN} onCheckedChange={setEmailN} />
          </SettingRow>
          <SettingRow label="Push notifications" desc="Price alerts and margin calls">
            <Switch checked={pushN} onCheckedChange={setPushN} />
          </SettingRow>
          <SettingRow label="SMS" desc="Critical security events only">
            <Switch checked={smsN} onCheckedChange={setSmsN} />
          </SettingRow>
        </div>
      </DataPanel>
    </PageShell>
  );
}
