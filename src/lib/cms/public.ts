import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { createId } from "@/lib/utils";
import { extractToc } from "./html";
import { mapPost, mapProject, mapSettings, mapSummary, mapTag, type PostRow, type TagRow } from "./map";
import { ensureSeed } from "./seed";
import { tagsForPosts } from "./tags";
import type { Post, PostSummary, Project, SiteSettings, Tag } from "./types";

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from settings where id = 1`;
  return mapSettings(rows[0] ?? { site_name: "Dat Ngo" });
});

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<PostRow>`
    select * from posts
    where status = 'published' and published_at is not null
    order by featured desc, published_at desc
  `;
  const tagMap = await tagsForPosts(rows.map((r) => r.id));
  return rows.map((row) => mapSummary(row, tagMap[row.id] ?? []));
});

export const getPublishedPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<PostRow>`
      select * from posts
      where slug = ${slug} and status = 'published'
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const tagMap = await tagsForPosts([row.id]);
    const post = mapPost(row, tagMap[row.id] ?? []);
    const related = await relatedPosts(post);
    return { post, toc: extractToc(post.html), related };
  });

async function relatedPosts(post: Post): Promise<PostSummary[]> {
  const sql = await getSql();
  const tagIds = post.tags.map((t) => t.id);
  let rows: PostRow[] = [];
  if (tagIds.length > 0) {
    const ph = tagIds.map((_, i) => `$${i + 2}`).join(", ");
    rows = await sql.query<PostRow>(
      `select distinct p.* from posts p
       join post_tags pt on pt.post_id = p.id
       where p.status = 'published' and p.id <> $1 and pt.tag_id in (${ph})
       order by p.published_at desc
       limit 3`,
      [post.id, ...tagIds],
    );
  }
  if (rows.length < 3) {
    const extra = await sql<PostRow>`
      select * from posts
      where status = 'published' and id <> ${post.id}
      order by published_at desc
      limit 3
    `;
    const seen = new Set(rows.map((r) => r.id));
    for (const row of extra) {
      if (!seen.has(row.id)) rows.push(row);
      if (rows.length >= 3) break;
    }
  }
  const tagMap = await tagsForPosts(rows.map((r) => r.id));
  return rows.map((row) => mapSummary(row, tagMap[row.id] ?? []));
}

export const listTagsPublic = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<TagRow & { n: number }>`
    select t.id, t.slug, t.name, t.description, count(pt.post_id)::int as n
    from tags t
    left join post_tags pt on pt.tag_id = t.id
    left join posts p on p.id = pt.post_id and p.status = 'published'
    group by t.id
    having count(p.id) > 0
    order by t.name
  `;
  return rows.map((row) => ({ ...mapTag(row), count: Number(row.n) }));
});

export const getTagPage = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    await ensureSeed();
    const sql = await getSql();
    const tags = await sql<TagRow>`select * from tags where slug = ${slug} limit 1`;
    const tag = tags[0];
    if (!tag) return null;
    const rows = await sql<PostRow>`
      select p.* from posts p
      join post_tags pt on pt.post_id = p.id
      where pt.tag_id = ${tag.id} and p.status = 'published'
      order by p.published_at desc
    `;
    const tagMap = await tagsForPosts(rows.map((r) => r.id));
    return {
      tag: mapTag(tag),
      posts: rows.map((row) => mapSummary(row, tagMap[row.id] ?? [])),
    };
  });

export const listPublicProjects = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from projects order by sort_order, title`;
  return rows.map(mapProject);
});

export const searchPublished = createServerFn({ method: "GET" })
  .validator((q: string) => q.trim().slice(0, 80))
  .handler(async ({ data: q }) => {
    await ensureSeed();
    if (!q) return [] as PostSummary[];
    const sql = await getSql();
    const like = `%${q.toLowerCase()}%`;
    const rows = await sql<PostRow>`
      select * from posts
      where status = 'published'
        and (lower(title) like ${like} or lower(excerpt) like ${like} or lower(html) like ${like})
      order by published_at desc
      limit 12
    `;
    const tagMap = await tagsForPosts(rows.map((r) => r.id));
    return rows.map((row) => mapSummary(row, tagMap[row.id] ?? []));
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((input: { email: string; source?: string }) => ({
    email: input.email.trim().toLowerCase(),
    source: input.source || "site",
  }))
  .handler(async ({ data }) => {
    const email = data.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false as const, error: "Email không hợp lệ." };
    }
    const sql = await getSql();
    await sql`
      insert into subscribers (id, email, source)
      values (${createId()}, ${email}, ${data.source})
      on conflict (email) do nothing
    `;
    return { ok: true as const };
  });

export type { Post, PostSummary, Project, SiteSettings, Tag };
