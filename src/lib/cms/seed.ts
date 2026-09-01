import { getSql } from "@/lib/db";
import { analyzeSeo } from "./seo";
import { statsFromHtml, withHeadingIds } from "./html";
import { SEED_USER, seedMedia, seedPosts, seedProjects, seedSettings, seedTags } from "./seed-data";

let seeding: Promise<void> | null = null;

export async function ensureSeed() {
  if (!seeding) {
    seeding = runSeed().finally(() => {
      seeding = null;
    });
  }
  await seeding;
}

async function runSeed() {
  const sql = await getSql();
  const existing = await sql<{ n: number }>`select count(*)::int as n from posts`;
  if ((existing[0]?.n ?? 0) > 0) {
    const settings = await sql`select bio from settings where id = 1`;
    if (!settings[0]?.bio) {
      await sql`
        update settings set
          site_name = ${seedSettings.siteName},
          tagline = ${seedSettings.tagline},
          bio = ${seedSettings.bio},
          about_html = ${seedSettings.aboutHtml},
          avatar_url = ${seedSettings.avatarUrl},
          x_handle = ${seedSettings.xHandle},
          github_url = ${seedSettings.githubUrl},
          location = ${seedSettings.location},
          beehiiv_publication = ${seedSettings.beehiivPublication},
          footer_note = ${seedSettings.footerNote}
        where id = 1
      `;
    }
    return;
  }

  await sql`
    update settings set
      site_name = ${seedSettings.siteName},
      tagline = ${seedSettings.tagline},
      bio = ${seedSettings.bio},
      about_html = ${seedSettings.aboutHtml},
      avatar_url = ${seedSettings.avatarUrl},
      x_handle = ${seedSettings.xHandle},
      github_url = ${seedSettings.githubUrl},
      location = ${seedSettings.location},
      beehiiv_publication = ${seedSettings.beehiivPublication},
      footer_note = ${seedSettings.footerNote}
    where id = 1
  `;

  for (const tag of seedTags) {
    await sql`
      insert into tags (id, slug, name, description)
      values (${tag.id}, ${tag.slug}, ${tag.name}, ${tag.description})
      on conflict (id) do nothing
    `;
  }

  for (const media of seedMedia) {
    await sql`
      insert into media (id, user_id, url, alt, caption, credit)
      values (${media.id}, ${SEED_USER}, ${media.url}, ${media.alt}, ${media.caption}, ${media.credit})
      on conflict (id) do nothing
    `;
  }

  for (const project of seedProjects) {
    await sql`
      insert into projects (id, user_id, title, summary, url, year, tags, sort_order)
      values (${project.id}, ${SEED_USER}, ${project.title}, ${project.summary}, ${project.url || null}, ${project.year}, ${project.tags}, ${project.sortOrder})
      on conflict (id) do nothing
    `;
  }

  for (const post of seedPosts) {
    const html = withHeadingIds(post.html);
    const stats = statsFromHtml(html);
    const seo = analyzeSeo({
      title: post.title,
      excerpt: post.excerpt,
      html,
      slug: post.slug,
      coverUrl: post.coverUrl,
      coverAlt: post.coverAlt,
      focusKeyword: post.focusKeyword,
    });
    await sql`
      insert into posts (
        id, user_id, slug, title, excerpt, html, json,
        cover_url, cover_alt, status, featured, published_at,
        meta_title, meta_description, focus_keyword,
        seo_score, seo_report, reading_minutes, word_count
      ) values (
        ${post.id}, ${SEED_USER}, ${post.slug}, ${post.title}, ${post.excerpt}, ${html}, ${"{}"},
        ${post.coverUrl}, ${post.coverAlt}, ${"published"}, ${post.featured}, ${post.publishedAt},
        ${post.title}, ${post.excerpt}, ${post.focusKeyword},
        ${seo.score}, ${JSON.stringify(seo)}, ${stats.readingMinutes}, ${stats.wordCount}
      )
      on conflict (id) do nothing
    `;
    for (const tagId of post.tagIds) {
      await sql`
        insert into post_tags (post_id, tag_id) values (${post.id}, ${tagId})
        on conflict do nothing
      `;
    }
  }
}

export async function claimSeed(userId: string) {
  const sql = await getSql();
  await ensureSeed();
  await sql`update posts set user_id = ${userId} where user_id = ${SEED_USER}`;
  await sql`update media set user_id = ${userId} where user_id = ${SEED_USER}`;
  await sql`update projects set user_id = ${userId} where user_id = ${SEED_USER}`;
}
