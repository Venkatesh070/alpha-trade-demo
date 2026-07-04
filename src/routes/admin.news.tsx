import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NEWS } from "@/data/content";

export const Route = createFileRoute("/admin/news")({
  component: () => <AdminCrud title="News" items={NEWS.map((n) => n.title)} />,
});

export function AdminCrud({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-6 p-6">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <div className="glossy rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Create new</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input />
          </div>
          <div>
            <Label>Category</Label>
            <Input />
          </div>
        </div>
        <div className="mt-3">
          <Label>Body</Label>
          <Textarea rows={4} />
        </div>
        <Button className="mt-4 gold-button hover:gold-button-hover">Publish</Button>
      </div>
      <div className="glossy-soft rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Existing</h2>
        <ul className="mt-3 divide-y divide-border/60 text-sm">
          {items.map((t, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <span>{t}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm" variant="ghost">
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
