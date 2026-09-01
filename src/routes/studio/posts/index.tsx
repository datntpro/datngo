import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createPost, deletePost, savePost, studioBootstrap } from "@/lib/cms/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/studio/posts/")({ component: PostsIndex });

function PostsIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  const del = useMutation({
    mutationFn: (id: string) => deletePost({ data: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio"] }),
  });

  async function write() {
    const { id } = await createPost({ data: {} });
    void navigate({ to: "/studio/posts/$id", params: { id } });
  }

  if (q.isPending) return <p className="kicker p-8">Đang tải bài…</p>;
  const posts = q.data?.posts ?? [];

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="kicker">Nội dung</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Bài viết</h1>
        </div>
        <Button type="button" onClick={() => void write()}>
          Viết bài mới
        </Button>
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
            <tr className="border-b border-rule">
              <th className="py-3 font-medium">Tiêu đề</th>
              <th className="py-3 font-medium">Trạng thái</th>
              <th className="py-3 font-medium">SEO</th>
              <th className="py-3 font-medium">AI</th>
              <th className="py-3 font-medium">Sửa</th>
              <th className="py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-rule">
                <td className="py-4">
                  <Link
                    to="/studio/posts/$id"
                    params={{ id: post.id }}
                    className="font-serif text-lg text-ink no-underline hover:text-forest"
                  >
                    {post.title}
                  </Link>
                  <p className="font-mono text-[11px] text-faint">/{post.slug}</p>
                </td>
                <td>
                  <Badge tone={post.status === "published" ? "good" : "mute"}>{post.status}</Badge>
                </td>
                <td className="font-mono text-sm tabular-nums">{post.seoScore ?? "—"}</td>
                <td className="font-mono text-sm tabular-nums">{post.aiScore ?? "—"}</td>
                <td className="font-mono text-[11px] text-faint">{formatDate(post.updatedAt)}</td>
                <td className="whitespace-nowrap">
                  {post.status === "published" ? (
                    <button
                      type="button"
                      className="mr-3 font-mono text-[11px] text-muted uppercase hover:text-ink"
                      onClick={() =>
                        savePost({ data: { id: post.id, status: "draft" } }).then(() =>
                          qc.invalidateQueries({ queryKey: ["studio"] }),
                        )
                      }
                    >
                      Ẩn
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="font-mono text-[11px] text-brick uppercase"
                    onClick={() => {
                      if (confirm("Xóa bài này?")) del.mutate(post.id);
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
