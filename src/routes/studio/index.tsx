import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createPost, studioBootstrap } from "@/lib/cms/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreMark } from "@/components/studio/score";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/studio/")({ component: StudioHome });

function StudioHome() {
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  if (q.isPending) return <StudioSkeleton />;
  if (q.error) return <p className="p-8 text-brick">{(q.error as Error).message}</p>;
  const data = q.data!;

  async function write() {
    const { id } = await createPost({ data: { title: "Bài chưa đặt tên" } });
    void navigate({ to: "/studio/posts/$id", params: { id } });
  }

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Studio</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Bảng điều khiển</h1>
        </div>
        <Button type="button" onClick={() => void write()}>
          Viết bài mới
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        <Stat label="Bài" value={data.stats.total} />
        <Stat label="Xuất bản" value={data.stats.published} />
        <Stat label="Nháp" value={data.stats.drafts} />
        <div className="border border-rule bg-paper-raised p-4">
          <p className="kicker">SEO trung bình</p>
          <ScoreMark score={data.stats.avgSeo} />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <section>
          <p className="kicker mb-3">Bài gần đây</p>
          <ul>
            {data.posts.slice(0, 8).map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-3 border-t border-rule py-3">
                <div>
                  <Link
                    to="/studio/posts/$id"
                    params={{ id: post.id }}
                    className="font-serif text-lg text-ink no-underline hover:text-forest"
                  >
                    {post.title}
                  </Link>
                  <p className="font-mono text-[11px] text-faint">
                    {formatDate(post.updatedAt)} · {post.wordCount} từ
                  </p>
                </div>
                <Badge tone={post.status === "published" ? "good" : "mute"}>{post.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-6">
          <div className="border border-rule p-5">
            <p className="kicker">Newsletter</p>
            <p className="mt-2 font-serif text-4xl tabular-nums">{data.subscriberCount}</p>
            <p className="text-sm text-muted">người đăng ký local. Beehiiv vẫn là kênh gửi.</p>
            <Link to="/studio/newsletter" className="mt-3 inline-block font-mono text-[11px] uppercase text-forest no-underline">
              Quản lý
            </Link>
          </div>
          <div className="border border-rule p-5">
            <p className="kicker">Cần xem SEO</p>
            <ul className="mt-3 space-y-2">
              {data.posts
                .filter((p) => (p.seoScore ?? 0) < 75)
                .slice(0, 5)
                .map((p) => (
                  <li key={p.id}>
                    <Link
                      to="/studio/posts/$id"
                      params={{ id: p.id }}
                      className="text-sm text-ink no-underline hover:text-forest"
                    >
                      {p.title}{" "}
                      <span className="font-mono text-[11px] text-faint">{p.seoScore ?? "—"}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-rule bg-paper-raised p-4">
      <p className="kicker">{label}</p>
      <p className="mt-2 font-serif text-4xl tabular-nums">{value}</p>
    </div>
  );
}

function StudioSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <div className="h-8 w-48 animate-pulse bg-code" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse bg-code" />
        ))}
      </div>
    </div>
  );
}
