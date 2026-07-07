import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createAdminNewsArticle,
  deleteAdminNewsArticle,
  fetchAdminNews,
  updateAdminNewsArticle,
  type AdminNewsArticle,
} from "@/lib/admin-api";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export const Route = createFileRoute("/admin/news")({
  component: AdminNewsPage,
});

function AdminNewsPage() {
  const { isAuthenticated } = useAdminAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminNewsArticle | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-news"],
    queryFn: fetchAdminNews,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: createAdminNewsArticle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      setTitle("");
      setCategory("");
      setBody("");
      toast.success("Article published");
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { title: string; category: string; body: string } }) =>
      updateAdminNewsArticle(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      setEditing(null);
      setTitle("");
      setCategory("");
      setBody("");
      toast.success("Article updated");
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminNewsArticle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Article deleted");
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const articles = data?.articles ?? [];

  const startEdit = (article: AdminNewsArticle) => {
    setEditing(article);
    setTitle(article.title);
    setCategory(article.category);
    setBody(article.excerpt);
  };

  const cancelEdit = () => {
    setEditing(null);
    setTitle("");
    setCategory("");
    setBody("");
  };

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !body.trim()) {
      toast.error("Fill in title, category, and body");
      return;
    }

    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        input: { title: title.trim(), category: category.trim(), body: body.trim() },
      });
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      category: category.trim(),
      body: body.trim(),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="font-display text-2xl font-bold">News</h1>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load news articles.
        </div>
      )}

      <form onSubmit={publish} className="glossy rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">
          {editing ? "Edit article" : "Create new"}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="news-title">Title</Label>
            <Input
              id="news-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="news-category">Category</Label>
            <Input
              id="news-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Metals, Crypto, Forex"
              required
            />
          </div>
        </div>
        <div className="mt-3">
          <Label htmlFor="news-body">Body</Label>
          <Textarea
            id="news-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            type="submit"
            className="gold-button hover:gold-button-hover"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editing
              ? updateMutation.isPending
                ? "Saving…"
                : "Save changes"
              : createMutation.isPending
                ? "Publishing…"
                : "Publish"}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="glossy-soft rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Existing</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading articles…</p>
        ) : articles.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No articles yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60 text-sm">
            {articles.map((article) => (
              <li key={article.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{article.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {article.category} · {article.source}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(article)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(article.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
