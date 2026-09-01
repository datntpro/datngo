import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";
import type { PostSummary } from "@/lib/cms/types";

export function PostCard({ post, featured = false }: { post: PostSummary; featured?: boolean }) {
  return (
    <article className={featured ? "grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end" : "grid gap-3"}>
      {post.coverUrl ? (
        <Link to="/writing/$slug" params={{ slug: post.slug }} className="block overflow-hidden">
          <img
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            className={featured ? "aspect-[16/10] w-full object-cover" : "aspect-[16/9] w-full object-cover"}
          />
        </Link>
      ) : null}
      <div>
        <p className="kicker">
          {post.tags[0]?.name ?? "Notes"} · {post.readingMinutes} phút đọc
        </p>
        <h2 className={featured ? "mt-3 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl" : "mt-2 font-serif text-2xl leading-tight tracking-tight"}>
          <Link
            to="/writing/$slug"
            params={{ slug: post.slug }}
            className="text-ink no-underline hover:text-forest"
          >
            {post.title}
          </Link>
        </h2>
        <p className={featured ? "mt-4 max-w-xl text-lg text-muted" : "mt-2 text-muted"}>{post.excerpt}</p>
        <p className="mt-3 font-mono text-[11px] text-faint">
          {formatDate(post.publishedAt)} {post.seoScore != null ? `· SEO ${post.seoScore}` : ""}
        </p>
      </div>
    </article>
  );
}

export function PostRow({ post }: { post: PostSummary }) {
  return (
    <Link
      to="/writing/$slug"
      params={{ slug: post.slug }}
      className="group grid gap-2 border-t border-rule py-6 no-underline sm:grid-cols-[7rem_1fr_auto] sm:items-baseline"
    >
      <span className="font-mono text-[11px] text-faint">{formatDate(post.publishedAt)}</span>
      <span>
        <span className="block font-serif text-xl tracking-tight text-ink group-hover:text-forest">
          {post.title}
        </span>
        <span className="mt-1 block text-sm text-muted">{post.excerpt}</span>
      </span>
      <span className="font-mono text-[11px] text-faint">
        {post.readingMinutes}′ {post.tags[0] ? `· ${post.tags[0].name}` : ""}
      </span>
    </Link>
  );
}
