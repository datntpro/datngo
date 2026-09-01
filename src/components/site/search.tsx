import { useNavigate } from "@tanstack/react-router";
import { Command } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchPublished } from "@/lib/cms/public";
import type { PostSummary } from "@/lib/cms/types";

export function useSearchOpen() {
  const [value, set] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        set((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { value, set, open: () => set(true) };
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<PostSummary[]>([]);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      if (!q.trim()) {
        setHits([]);
        return;
      }
      setPending(true);
      searchPublished({ data: q })
        .then(setHits)
        .finally(() => setPending(false));
    }, 180);
    return () => window.clearTimeout(t);
  }, [q, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">Tìm bài viết</DialogTitle>
        <div className="flex items-center gap-2 border-b border-rule px-4">
          <Command className="size-4 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm trong các bài đã xuất bản…"
            className="h-12 w-full bg-transparent font-serif text-lg outline-none placeholder:text-faint"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {pending ? <p className="px-3 py-4 font-mono text-xs text-muted">Đang tìm…</p> : null}
          {!pending && q && hits.length === 0 ? (
            <p className="px-3 py-4 font-mono text-xs text-muted">Không có bài khớp.</p>
          ) : null}
          {hits.map((post) => (
            <button
              key={post.id}
              type="button"
              className="flex w-full flex-col items-start gap-1 px-3 py-3 text-left hover:bg-code"
              onClick={() => {
                onOpenChange(false);
                void navigate({ to: "/writing/$slug", params: { slug: post.slug } });
              }}
            >
              <span className="font-serif text-lg">{post.title}</span>
              <span className="line-clamp-1 text-sm text-muted">{post.excerpt}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
