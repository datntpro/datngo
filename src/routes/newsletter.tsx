import { createFileRoute } from "@tanstack/react-router";
import { NewsletterForm } from "@/components/site/newsletter";
import { SiteShell } from "@/components/site/shell";
import { getPublicSettings, listPublishedPosts } from "@/lib/cms/public";

export const Route = createFileRoute("/newsletter")({
  loader: async () => {
    const [settings, posts] = await Promise.all([getPublicSettings(), listPublishedPosts()]);
    return { settings, posts: posts.slice(0, 4) };
  },
  component: NewsletterPage,
});

function NewsletterPage() {
  const { settings, posts } = Route.useLoaderData();
  return (
    <SiteShell settings={settings}>
      <section className="site-grid grid gap-12 py-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="kicker">Thư</p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight">Đọc khi rảnh, không khi scroll.</h1>
          <p className="mt-4 max-w-lg text-lg text-muted">
            Mỗi số là một bài đã xuất bản trên DATNGO, gửi thẳng vào hộp thư. Không cần tài khoản để đọc trên site.
          </p>
          <div className="mt-8">
            <NewsletterForm settings={settings} source="newsletter" />
          </div>
        </div>
        <aside>
          <p className="kicker">Số gần đây trên site</p>
          <ul className="mt-4 space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <p className="font-serif text-xl leading-snug">{post.title}</p>
                <p className="text-sm text-muted">{post.excerpt}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </SiteShell>
  );
}
