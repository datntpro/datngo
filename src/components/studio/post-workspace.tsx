import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { reviewPostAi, savePost, type PostPatch } from "@/lib/cms/admin";
import { analyzeSeo } from "@/lib/cms/seo";
import type { AiReview, MediaItem, Post, SeoReport, Tag } from "@/lib/cms/types";
import { cn, slugify } from "@/lib/utils";
import { ArticleEditor } from "./editor";
import { ScoreMark, StatusDot } from "./score";

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  html: string;
  json: string;
  coverUrl: string;
  coverAlt: string;
  status: Post["status"];
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImageUrl: string;
  focusKeyword: string;
  tagIds: string[];
};

function fromPost(post: Post): Draft {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    html: post.html,
    json: post.json,
    coverUrl: post.coverUrl ?? "",
    coverAlt: post.coverAlt ?? "",
    status: post.status,
    featured: post.featured,
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    ogImageUrl: post.ogImageUrl ?? "",
    focusKeyword: post.focusKeyword ?? "",
    tagIds: post.tags.map((t) => t.id),
  };
}

export function PostWorkspace({
  post,
  allTags,
  media,
}: {
  post: Post;
  allTags: Tag[];
  media: MediaItem[];
}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft>(() => fromPost(post));
  const [saved, setSaved] = useState<Draft>(() => fromPost(post));
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const [ai, setAi] = useState<AiReview | null>(() => {
    if (!post.aiReport) return null;
    try {
      return JSON.parse(post.aiReport) as AiReview;
    } catch {
      return null;
    }
  });
  const [aiBusy, setAiBusy] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const seo: SeoReport = useMemo(
    () =>
      analyzeSeo({
        title: draft.title,
        excerpt: draft.excerpt,
        html: draft.html,
        slug: draft.slug,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        coverUrl: draft.coverUrl || null,
        coverAlt: draft.coverAlt || null,
        focusKeyword: draft.focusKeyword,
      }),
    [draft],
  );

  function patch(partial: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  async function persist(extra?: Partial<Draft>) {
    const next = { ...draftRef.current, ...extra };
    if (extra) setDraft(next);
    setSaving(true);
    try {
      const payload: PostPatch = {
        id: post.id,
        title: next.title,
        slug: next.slug || slugify(next.title),
        excerpt: next.excerpt,
        html: next.html,
        json: next.json,
        coverUrl: next.coverUrl || null,
        coverAlt: next.coverAlt || null,
        status: next.status,
        featured: next.featured,
        metaTitle: next.metaTitle || null,
        metaDescription: next.metaDescription || null,
        canonicalUrl: next.canonicalUrl || null,
        ogImageUrl: next.ogImageUrl || null,
        focusKeyword: next.focusKeyword || null,
        tagIds: next.tagIds,
      };
      const updated = await savePost({ data: payload });
      const asDraft = fromPost(updated);
      setSaved(asDraft);
      setDraft(asDraft);
      toast.success(next.status === "published" ? "Đã xuất bản" : "Đã lưu nháp");
      return updated;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không lưu được");
      return null;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => void persist(), 1800);
    return () => window.clearTimeout(t);
  }, [dirty, draft]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void persist();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function publish() {
    const updated = await persist({ status: draft.status === "published" ? "draft" : "published" });
    if (updated?.status === "published") {
      void navigate({ to: "/writing/$slug", params: { slug: updated.slug } });
    }
  }

  async function runAi() {
    setAiBusy(true);
    await persist();
    const res = await reviewPostAi({ data: post.id });
    setAiBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setAi(res.review);
    toast.success("Đã chấm bài");
  }

  const words = seo.wordCount;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-rule bg-paper/95 px-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/studio/posts" className="font-mono text-[11px] tracking-wide text-muted uppercase no-underline hover:text-ink">
            ← Bài viết
          </Link>
          <Badge tone={draft.status === "published" ? "good" : "mute"}>
            {draft.status === "published" ? "Published" : "Draft"}
          </Badge>
          <span className="hidden font-mono text-[11px] text-faint sm:inline">
            {saving ? "Đang lưu…" : dirty ? "Chưa lưu" : "Đã lưu"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((v) => !v)}>
            <Eye className="size-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button type="button" variant="outline" size="sm" className="lg:hidden" onClick={() => setMetaOpen(true)}>
            Meta
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void persist()} disabled={saving}>
            Lưu
          </Button>
          <Button type="button" size="sm" onClick={() => void publish()} disabled={saving}>
            {draft.status === "published" ? "Gỡ xuất bản" : "Xuất bản"}
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="px-4 py-8 sm:px-8 lg:px-14">
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value, slug: draft.slug || slugify(e.target.value) })}
            placeholder="Tiêu đề"
            className="w-full bg-transparent font-serif text-4xl tracking-tight text-ink outline-none placeholder:text-faint sm:text-5xl"
          />
          <input
            value={draft.excerpt}
            onChange={(e) => patch({ excerpt: e.target.value })}
            placeholder="Đoạn dẫn — hiện trên danh sách và SEO nếu chưa có meta description"
            className="mt-4 w-full bg-transparent font-serif text-lg text-muted outline-none placeholder:text-faint"
          />
          <div className="mt-8">
            {preview ? (
              <div className="article-body max-w-2xl" dangerouslySetInnerHTML={{ __html: draft.html }} />
            ) : (
              <ArticleEditor
                initialHtml={post.html}
                initialJson={post.json}
                media={media}
                onChange={(html, json) => patch({ html, json })}
              />
            )}
          </div>
          <p className="mt-10 font-mono text-[11px] text-faint">
            {words} từ · {Math.max(1, Math.round(words / 220))} phút đọc · Cmd+S để lưu
          </p>
        </div>

        <aside className="hidden border-l border-rule lg:block">
          <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto p-5">
            <MetaPanel
              draft={draft}
              patch={patch}
              allTags={allTags}
              media={media}
              seo={seo}
              ai={ai}
              aiBusy={aiBusy}
              onAi={() => void runAi()}
            />
          </div>
        </aside>
      </div>

      <Sheet open={metaOpen} onOpenChange={setMetaOpen}>
        <SheetContent className="overflow-y-auto p-5 pt-12">
          <MetaPanel
            draft={draft}
            patch={patch}
            allTags={allTags}
            media={media}
            seo={seo}
            ai={ai}
            aiBusy={aiBusy}
            onAi={() => void runAi()}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MetaPanel({
  draft,
  patch,
  allTags,
  media,
  seo,
  ai,
  aiBusy,
  onAi,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  allTags: Tag[];
  media: MediaItem[];
  seo: SeoReport;
  ai: AiReview | null;
  aiBusy: boolean;
  onAi: () => void;
}) {
  return (
    <div className="space-y-8">
      <section>
        <p className="kicker mb-3">Xuất bản</p>
        <label className="flex h-11 items-center justify-between gap-3">
          <span className="text-sm">Nổi bật trên trang chủ</span>
          <Switch checked={draft.featured} onCheckedChange={(v) => patch({ featured: v })} />
        </label>
        <div className="mt-3">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={draft.slug} onChange={(e) => patch({ slug: slugify(e.target.value) })} />
        </div>
      </section>

      <section>
        <p className="kicker mb-3">Ảnh bìa · URL</p>
        {draft.coverUrl ? (
          <img src={draft.coverUrl} alt={draft.coverAlt} className="mb-3 aspect-[16/9] w-full object-cover" />
        ) : null}
        <Input
          value={draft.coverUrl}
          onChange={(e) => patch({ coverUrl: e.target.value })}
          placeholder="https://images.unsplash.com/…"
        />
        <Input
          className="mt-2"
          value={draft.coverAlt}
          onChange={(e) => patch({ coverAlt: e.target.value })}
          placeholder="Alt text"
        />
        {media.length > 0 ? (
          <div className="mt-2 grid grid-cols-4 gap-1">
            {media.slice(0, 8).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => patch({ coverUrl: item.url, coverAlt: item.alt })}
              >
                <img src={item.url} alt={item.alt} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section>
        <p className="kicker mb-3">Chuyên mục</p>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const on = draft.tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  patch({
                    tagIds: on ? draft.tagIds.filter((id) => id !== tag.id) : [...draft.tagIds, tag.id],
                  })
                }
                className={cn(
                  "h-9 px-3 font-mono text-[11px] tracking-wide uppercase",
                  on ? "bg-forest text-primary-foreground" : "border border-rule text-muted hover:text-ink",
                )}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <p className="kicker">SEO</p>
          <ScoreMark score={seo.score} />
        </div>
        <div className="space-y-2">
          {seo.issues.map((issue) => (
            <div key={issue.key} className="flex gap-2 text-sm">
              <span className="mt-1.5">
                <StatusDot status={issue.status} />
              </span>
              <div>
                <p className="text-ink">{issue.label}</p>
                <p className="text-xs text-muted">{issue.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Label>Focus keyword</Label>
          <Input
            value={draft.focusKeyword}
            onChange={(e) => patch({ focusKeyword: e.target.value })}
            placeholder="vd. ingress gitops"
          />
          <Label>Meta title</Label>
          <Input
            value={draft.metaTitle}
            onChange={(e) => patch({ metaTitle: e.target.value })}
            placeholder={draft.title}
          />
          <Label>Meta description</Label>
          <Textarea
            value={draft.metaDescription}
            onChange={(e) => patch({ metaDescription: e.target.value })}
            placeholder={draft.excerpt}
          />
          <Label>Canonical URL</Label>
          <Input
            value={draft.canonicalUrl}
            onChange={(e) => patch({ canonicalUrl: e.target.value })}
            placeholder="https://"
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <p className="kicker">AI review</p>
          {ai ? <ScoreMark score={ai.score} /> : null}
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={onAi} disabled={aiBusy}>
          {aiBusy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {aiBusy ? "Đang đọc bài…" : "Chấm bài bằng Grok"}
        </Button>
        {ai ? (
          <div className="mt-4 space-y-3">
            <p className="font-serif text-lg leading-snug">{ai.verdict}</p>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <span>Cấu trúc {ai.structure}</span>
              <span>Độ sâu {ai.depth}</span>
              <span>Dễ đọc {ai.readability}</span>
              <span>SEO {ai.seo}</span>
              <span>Giọng {ai.voice}</span>
            </div>
            <p className="kicker">Nên giữ</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
              {(ai.strengths ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="kicker">Cần sửa</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
              {(ai.improvements ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Gọi khi bài gần xong — không phải mỗi lần gõ.</p>
        )}
      </section>
    </div>
  );
}
