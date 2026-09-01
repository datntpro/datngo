import { createFileRoute, Link } from "@tanstack/react-router";
import { PostRow } from "@/components/site/post-card";
import { SiteShell } from "@/components/site/shell";
import { getPublicSettings, listPublishedPosts, listTagsPublic } from "@/lib/cms/public";

export const Route = createFileRoute("/writing/")({
  loader: async () => {
    const [settings, posts, tags] = await Promise.all([
      getPublicSettings(),
      listPublishedPosts(),
      listTagsPublic(),
    ]);
    return { settings, posts, tags };
  },
  component: WritingIndex,
});

function WritingIndex() {
  const { settings, posts, tags } = Route.useLoaderData();
  return (
    <SiteShell settings={settings}>
      <section className="site-grid py-12">
        <p className="kicker">Index</p>
        <h1 className="mt-2 font-serif text-5xl tracking-tight">Bài viết</h1>
        <p className="mt-3 max-w-xl text-muted">
          Ghi chú kỹ thuật, xếp theo thời gian. Dùng Cmd+K để tìm.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to="/topics/$slug"
              params={{ slug: tag.slug }}
              className="h-9 border border-rule px-3 font-mono text-[11px] tracking-wide text-muted uppercase no-underline hover:border-ink hover:text-ink"
            >
              {tag.name}
              <span className="ml-2 text-faint">{tag.count}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
