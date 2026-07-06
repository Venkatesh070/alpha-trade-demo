import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/media")({ component: AdminMedia });

function AdminMedia() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="font-display text-2xl font-bold">Media library</h1>
      <div className="glossy rounded-2xl p-8 text-center">
        <Upload className="mx-auto h-10 w-10 text-[color:var(--gold)]" />
        <p className="mt-3 text-sm text-muted-foreground">
          Drop files here or click to upload (admin only).
        </p>
        <Button className="mt-4 gold-button hover:gold-button-hover">Choose files</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="glossy-soft aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
