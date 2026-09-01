import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { NewsletterForm } from "@/components/site/newsletter";
import { PostRow } from "@/components/site/post-card";
import { ReadingProgress } from "@/components/site/reading-progress";
import { SiteShell } from "@/components/site/shell";
import { TableOfContents } from "@/components/site/toc";
import { getPublicSettings, getPublishedPost } from "@/lib/cms/public";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/writing/$slug")({
  loader: async ({ params }) => {
    const [settings, data] = await Promise.all([
      getPublicSettings(),
      getPublishedPost({ data: params.slug }),
    ]);
    if (!data) throw notFound();
    return { settings, ...data };
  },
  component: ArticlePage,
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    const title = post?.metaTitle || post?.title || "DATNGO";
    const description = post?.metaDescription || post?.excerpt || "";
    return {
      meta: [
        { title: `${title} — DATNGO` },
        { name: "description", content: description },
      ],
    };
  },
});

function ArticlePage() {
  const { settings, post, toc, related } = Route.useLoaderData();
  return (
    <SiteShell settings={settings}>
      <ReadingProgress />
      <article className="site-grid py-10">
        <p className="kicker">
          {post.tags.map((t) => t.name).join(" · ") || "Notes"} · {formatDate(post.publishedAt)} ·{" "}
          {post.readingMinutes} phút
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          {post.title}
        </h1>
        <p className="mt-5 max-w-2xl font-serif text-xl text-muted">{post.excerpt}</p>
        {post.coverUrl ? (
          <figure className="mt-10">
            <img
              src={post.coverUrl}
              alt={post.coverAlt || post.title}
              className="aspect-[16/8] w-full object-cover"
            />
            {post.coverAlt ? (
              <figcaption className="mt-2 font-mono text-[11px] text-faint">{post.coverAlt}</figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,720px)]">
          <TableOfContents items={toc} />
          <div className="article-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="site-grid py-12">
          <p className="kicker">Cùng mạch</p>
          <div className="mt-2">
            {related.map((item) => (
              <PostRow key={item.id} post={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="site-grid pb-16">
        <NewsletterForm settings={settings} source="article" />
        <p className="mt-6">
          <Link to="/writing" className="font-mono text-[11px] uppercase text-muted no-underline hover:text-ink">
            ← Tất cả bài viết
          </Link>
        </p>
      </section>
    </SiteShell>
  );
}
