import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { studioBootstrap } from "@/lib/cms/admin";
import { Badge } from "@/components/ui/badge";
import { ScoreMark } from "@/components/studio/score";

export const Route = createFileRoute("/studio/seo")({ component: SeoPage });

function SeoPage() {
  const q = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  const posts = q.data?.posts ?? [];
  const scored = posts.filter((p) => p.seoScore != null);
  const avg = scored.length
    ? Math.round(scored.reduce((s, p) => s + (p.seoScore ?? 0), 0) / scored.length)
    : null;

  return (
    <div className="px-5 py-8 sm:px-8">
      <p className="kicker">Health</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">SEO toàn site</h1>
      <div className="mt-8 border border-rule p-5">
        <ScoreMark score={avg} label="điểm trung bình" />
        <p className="mt-2 max-w-lg text-sm text-muted">
          Điểm lint trên từng bài: title, description, heading, alt, độ dài, keyword. Mở bài để xem checklist chi tiết và gọi AI review.
        </p>
      </div>
      <ul className="mt-8">
        {posts
          .slice()
          .sort((a, b) => (a.seoScore ?? 0) - (b.seoScore ?? 0))
          .map((post) => (
            <li key={post.id} className="flex items-center justify-between gap-3 border-t border-rule py-4">
              <div>
                <Link
                  to="/studio/posts/$id"
                  params={{ id: post.id }}
                  className="font-serif text-lg no-underline hover:text-forest"
                >
                  {post.title}
                </Link>
                <p className="font-mono text-[11px] text-faint">
                  {post.wordCount} từ · {post.status}
                </p>
              </div>
              <Badge
                tone={
                  (post.seoScore ?? 0) >= 80 ? "good" : (post.seoScore ?? 0) >= 60 ? "warn" : "bad"
                }
              >
                {post.seoScore ?? "—"}
              </Badge>
            </li>
          ))}
      </ul>
    </div>
  );
}
