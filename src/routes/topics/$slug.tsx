import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PostRow } from "@/components/site/post-card";
import { SiteShell } from "@/components/site/shell";
import { getPublicSettings, getTagPage } from "@/lib/cms/public";

export const Route = createFileRoute("/topics/$slug")({
  loader: async ({ params }) => {
    const [settings, data] = await Promise.all([
      getPublicSettings(),
      getTagPage({ data: params.slug }),
    ]);
    if (!data) throw notFound();
    return { settings, ...data };
  },
  component: TopicPage,
});

function TopicPage() {
  const { settings, tag, posts } = Route.useLoaderData();
  return (
    <SiteShell settings={settings}>
      <section className="site-grid py-12">
        <p className="kicker">Chuyên mục</p>
        <h1 className="mt-2 font-serif text-5xl tracking-tight">{tag.name}</h1>
        <p className="mt-3 max-w-xl text-muted">{tag.description}</p>
        <div className="mt-8">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>
        <Link to="/writing" className="mt-8 inline-block font-mono text-[11px] uppercase text-muted no-underline">
          ← Index
        </Link>
      </section>
    </SiteShell>
  );
}
