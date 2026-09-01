import { createFileRoute, Link } from "@tanstack/react-router";
import { NewsletterForm } from "@/components/site/newsletter";
import { PostCard, PostRow } from "@/components/site/post-card";
import { SiteShell } from "@/components/site/shell";
import { getPublicSettings, listPublicProjects, listPublishedPosts } from "@/lib/cms/public";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [settings, posts, projects] = await Promise.all([
      getPublicSettings(),
      listPublishedPosts(),
      listPublicProjects(),
    ]);
    return { settings, posts, projects };
  },
  component: Home,
});

function Home() {
  const { settings, posts, projects } = Route.useLoaderData();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <SiteShell settings={settings}>
      <section className="site-grid py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
          <div>
            <p className="kicker rise">{today}</p>
            <h1 className="rise rise-2 mt-2 font-serif text-5xl tracking-tight sm:text-7xl">DATNGO</h1>
          </div>
          <p className="rise rise-3 max-w-sm text-right font-serif text-lg text-muted">{settings.tagline}</p>
        </div>

        {featured ? (
          <div className="rise rise-4 mt-10">
            <PostCard post={featured} featured />
          </div>
        ) : (
          <p className="mt-10 text-muted">Chưa có bài xuất bản. Vào Studio để viết bài đầu tiên.</p>
        )}
      </section>

      <section className="site-grid py-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="kicker">Mới nhất</p>
            <div className="mt-2">
              {rest.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
            <Link
              to="/writing"
              className="mt-6 inline-block font-mono text-[11px] tracking-[0.14em] text-forest uppercase no-underline"
            >
              Toàn bộ bài viết →
            </Link>
          </div>
          <aside className="space-y-10">
            <div className="border border-rule p-5">
              <p className="kicker">Người viết</p>
              <p className="mt-3 font-serif text-2xl tracking-tight">{settings.siteName}</p>
              <p className="mt-2 text-sm text-muted">{settings.bio}</p>
              <Link to="/about" className="mt-4 inline-block font-mono text-[11px] uppercase text-forest no-underline">
                Tiểu sử
              </Link>
            </div>
            <div>
              <p className="kicker mb-3">Đang làm</p>
              <ul className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <li key={project.id}>
                    <p className="font-serif text-lg">{project.title}</p>
                    <p className="text-sm text-muted">{project.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="site-grid py-16">
        <NewsletterForm settings={settings} source="home" />
      </section>
    </SiteShell>
  );
}
