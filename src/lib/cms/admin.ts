import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { createId, slugify } from "@/lib/utils";
import { excerptFrom, sanitizeHtml, statsFromHtml, withHeadingIds } from "./html";
import { mapMedia, mapPost, mapProject, mapSettings, mapSubscriber, mapSummary, mapTag, type PostRow, type TagRow } from "./map";
import { analyzeSeo } from "./seo";
import { claimSeed, ensureSeed } from "./seed";
import { tagsForPosts } from "./tags";
import type { AiReview, Post, PostStatus } from "./types";

async function uniqueSlug(sql: Awaited<ReturnType<typeof getSql>>, base: string, ignoreId?: string) {
  let slug = slugify(base) || "bai-viet";
  let n = 2;
  for (;;) {
    const rows = ignoreId
      ? await sql<{ id: string }>`select id from posts where slug = ${slug} and id <> ${ignoreId} limit 1`
      : await sql<{ id: string }>`select id from posts where slug = ${slug} limit 1`;
    if (rows.length === 0) return slug;
    slug = `${slugify(base) || "bai-viet"}-${n}`;
    n += 1;
  }
}

export const studioBootstrap = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeed();
    await claimSeed(context.userId);
    const sql = await getSql();
    const posts = await sql<PostRow>`
      select * from posts where user_id = ${context.userId} order by updated_at desc
    `;
    const tagMap = await tagsForPosts(posts.map((r) => r.id));
    const tags = await sql<TagRow>`select * from tags order by name`;
    const media = await sql<Record<string, unknown>>`
      select * from media where user_id = ${context.userId} order by created_at desc
    `;
    const settingsRows = await sql<Record<string, unknown>>`select * from settings where id = 1`;
    const projects = await sql<Record<string, unknown>>`
      select * from projects where user_id = ${context.userId} order by sort_order, title
    `;
    const subs = await sql<{ n: number }>`select count(*)::int as n from subscribers`;
    const published = posts.filter((p) => p.status === "published").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const seoScores = posts.map((p) => p.seo_score).filter((n): n is number => n != null);
    const avgSeo = seoScores.length
      ? Math.round(seoScores.reduce((a, b) => a + Number(b), 0) / seoScores.length)
      : null;
    return {
      posts: posts.map((row) => mapSummary(row, tagMap[row.id] ?? [])),
      tags: tags.map(mapTag),
      media: media.map(mapMedia),
      settings: mapSettings(settingsRows[0] ?? {}),
      projects: projects.map(mapProject),
      subscriberCount: Number(subs[0]?.n ?? 0),
      stats: { total: posts.length, published, drafts, avgSeo },
    };
  });

export const getMyPost = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<PostRow>`
      select * from posts where id = ${id} and user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const tagMap = await tagsForPosts([id]);
    const tags = await sql<TagRow>`select * from tags order by name`;
    return { post: mapPost(row, tagMap[id] ?? []), allTags: tags.map(mapTag) };
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title?: string } | undefined) => input ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = createId();
    const title = data.title?.trim() || "Bài chưa đặt tên";
    const slug = await uniqueSlug(sql, title);
    await sql`
      insert into posts (id, user_id, slug, title, status)
      values (${id}, ${context.userId}, ${slug}, ${title}, ${"draft"})
    `;
    return { id };
  });

export type PostPatch = {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  html?: string;
  json?: string;
  coverUrl?: string | null;
  coverAlt?: string | null;
  status?: PostStatus;
  featured?: boolean;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  focusKeyword?: string | null;
  tagIds?: string[];
};

export const savePost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: PostPatch) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<PostRow>`
      select * from posts where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    const row = existing[0];
    if (!row) throw new Error("Không tìm thấy bài viết.");

    const title = data.title ?? row.title;
    const slug = data.slug
      ? await uniqueSlug(sql, data.slug, data.id)
      : row.slug;
    const html = data.html != null ? withHeadingIds(sanitizeHtml(data.html)) : row.html;
    const excerpt =
      data.excerpt != null
        ? data.excerpt
        : row.excerpt || excerptFrom(html);
    const stats = statsFromHtml(html);
    const status = data.status ?? (row.status as PostStatus);
    let publishedAt = data.publishedAt ?? asIso(row.published_at);
    if (status === "published" && !publishedAt) publishedAt = new Date().toISOString();
    if (status === "draft") {
      /* keep publishedAt for republish history */
    }
    const seo = analyzeSeo({
      title,
      excerpt,
      html,
      slug,
      metaTitle: data.metaTitle ?? row.meta_title,
      metaDescription: data.metaDescription ?? row.meta_description,
      coverUrl: data.coverUrl === undefined ? row.cover_url : data.coverUrl,
      coverAlt: data.coverAlt === undefined ? row.cover_alt : data.coverAlt,
      focusKeyword: data.focusKeyword === undefined ? row.focus_keyword : data.focusKeyword,
    });

    await sql`
      update posts set
        title = ${title},
        slug = ${slug},
        excerpt = ${excerpt},
        html = ${html},
        json = ${data.json ?? row.json},
        cover_url = ${data.coverUrl === undefined ? row.cover_url : data.coverUrl},
        cover_alt = ${data.coverAlt === undefined ? row.cover_alt : data.coverAlt},
        status = ${status},
        featured = ${data.featured ?? row.featured},
        published_at = ${publishedAt},
        scheduled_at = ${data.scheduledAt === undefined ? asIso(row.scheduled_at) : data.scheduledAt},
        meta_title = ${data.metaTitle === undefined ? row.meta_title : data.metaTitle},
        meta_description = ${data.metaDescription === undefined ? row.meta_description : data.metaDescription},
        canonical_url = ${data.canonicalUrl === undefined ? row.canonical_url : data.canonicalUrl},
        og_image_url = ${data.ogImageUrl === undefined ? row.og_image_url : data.ogImageUrl},
        focus_keyword = ${data.focusKeyword === undefined ? row.focus_keyword : data.focusKeyword},
        seo_score = ${seo.score},
        seo_report = ${JSON.stringify(seo)},
        reading_minutes = ${stats.readingMinutes},
        word_count = ${stats.wordCount},
        updated_at = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;

    if (data.tagIds) {
      await sql`delete from post_tags where post_id = ${data.id}`;
      for (const tagId of data.tagIds) {
        await sql`insert into post_tags (post_id, tag_id) values (${data.id}, ${tagId}) on conflict do nothing`;
      }
    }

    const next = await sql<PostRow>`select * from posts where id = ${data.id} and user_id = ${context.userId}`;
    const tagMap = await tagsForPosts([data.id]);
    return mapPost(next[0], tagMap[data.id] ?? []);
  });

function asIso(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export const deletePost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from posts where id = ${id} and user_id = ${context.userId}`;
    return { ok: true };
  });

export const addMedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { url: string; alt?: string; caption?: string; credit?: string }) => input)
  .handler(async ({ context, data }) => {
    const url = data.url.trim();
    if (!/^https?:\/\//i.test(url)) throw new Error("URL ảnh phải bắt đầu bằng http(s).");
    const sql = await getSql();
    const id = createId();
    await sql`
      insert into media (id, user_id, url, alt, caption, credit)
      values (${id}, ${context.userId}, ${url}, ${data.alt ?? ""}, ${data.caption ?? ""}, ${data.credit ?? ""})
    `;
    const rows = await sql<Record<string, unknown>>`select * from media where id = ${id}`;
    return mapMedia(rows[0]);
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from media where id = ${id} and user_id = ${context.userId}`;
    return { ok: true };
  });

export const saveTag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; name: string; description?: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const name = data.name.trim();
    if (!name) throw new Error("Tên chuyên mục trống.");
    const id = data.id || createId();
    const slug = slugify(name);
    await sql`
      insert into tags (id, slug, name, description)
      values (${id}, ${slug}, ${name}, ${data.description ?? ""})
      on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description
    `;
    const rows = await sql<TagRow>`select * from tags where id = ${id}`;
    return mapTag(rows[0]);
  });

export const deleteTag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    await sql`delete from tags where id = ${id}`;
    return { ok: true };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      siteName: string;
      tagline: string;
      bio: string;
      aboutHtml: string;
      avatarUrl?: string | null;
      xHandle: string;
      githubUrl?: string | null;
      location: string;
      beehiivEmbedUrl?: string | null;
      beehiivPublication?: string | null;
      footerNote: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      update settings set
        site_name = ${data.siteName},
        tagline = ${data.tagline},
        bio = ${data.bio},
        about_html = ${data.aboutHtml},
        avatar_url = ${data.avatarUrl ?? null},
        x_handle = ${data.xHandle.replace(/^@/, "")},
        github_url = ${data.githubUrl ?? null},
        location = ${data.location},
        beehiiv_embed_url = ${data.beehiivEmbedUrl ?? null},
        beehiiv_publication = ${data.beehiivPublication ?? null},
        footer_note = ${data.footerNote},
        updated_at = now()
      where id = 1
    `;
    const rows = await sql<Record<string, unknown>>`select * from settings where id = 1`;
    return mapSettings(rows[0]);
  });

export const saveProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id?: string;
      title: string;
      summary: string;
      url?: string | null;
      year?: string | null;
      tags?: string;
      sortOrder?: number;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = data.id || createId();
    await sql`
      insert into projects (id, user_id, title, summary, url, year, tags, sort_order)
      values (${id}, ${context.userId}, ${data.title}, ${data.summary}, ${data.url ?? null}, ${data.year ?? null}, ${data.tags ?? ""}, ${data.sortOrder ?? 0})
      on conflict (id) do update set
        title = excluded.title,
        summary = excluded.summary,
        url = excluded.url,
        year = excluded.year,
        tags = excluded.tags,
        sort_order = excluded.sort_order
      where projects.user_id = ${context.userId}
    `;
    const rows = await sql<Record<string, unknown>>`
      select * from projects where id = ${id} and user_id = ${context.userId}
    `;
    return mapProject(rows[0]);
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from projects where id = ${id} and user_id = ${context.userId}`;
    return { ok: true };
  });

export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from subscribers order by created_at desc`;
    return rows.map(mapSubscriber);
  });

export const reviewPostAi = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI chưa khả dụng trong môi trường này." };
    const sql = await getSql();
    const rows = await sql<PostRow>`
      select * from posts where id = ${id} and user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    if (!row) return { ok: false as const, error: "Không tìm thấy bài viết." };
    const text = `${row.title}\n\n${row.excerpt}\n\n${row.html}`.slice(0, 12000);
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 1200,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are a demanding editor for a Vietnamese technical essayist. Score the article. Reply JSON only with keys: score (0-100), verdict (one Vietnamese sentence), structure, depth, readability, seo, voice (each 0-100), strengths (string[3]), improvements (string[4]), rewriteHints (string[3]). Be specific to the text. No markdown.",
          },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `xAI API lỗi ${res.status}` };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const raw = body.choices[0]?.message.content ?? "";
    const jsonText = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    let review: AiReview;
    try {
      review = JSON.parse(jsonText) as AiReview;
    } catch {
      return { ok: false as const, error: "AI trả về định dạng không đọc được." };
    }
    await sql`
      update posts set ai_score = ${Number(review.score) || 0}, ai_report = ${JSON.stringify(review)}, updated_at = now()
      where id = ${id} and user_id = ${context.userId}
    `;
    return { ok: true as const, review };
  });

export type { Post };
