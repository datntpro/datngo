import type { MediaItem, Post, PostStatus, PostSummary, Project, SiteSettings, Subscriber, Tag } from "./types";

export type PostRow = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  json: string;
  cover_url: string | null;
  cover_alt: string | null;
  status: string;
  featured: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  focus_keyword: string | null;
  seo_score: number | null;
  seo_report: string | null;
  ai_score: number | null;
  ai_report: string | null;
  reading_minutes: number;
  word_count: number;
  created_at: string;
  updated_at: string;
};

export type TagRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export function asString(value: unknown) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function asBool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

export function asNum(value: unknown) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
  };
}

export function mapSummary(row: PostRow, tags: Tag[] = []): PostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverUrl: row.cover_url,
    coverAlt: row.cover_alt,
    status: (row.status as PostStatus) || "draft",
    featured: asBool(row.featured),
    publishedAt: asString(row.published_at),
    updatedAt: asString(row.updated_at) ?? "",
    readingMinutes: asNum(row.reading_minutes) ?? 1,
    wordCount: asNum(row.word_count) ?? 0,
    seoScore: asNum(row.seo_score),
    aiScore: asNum(row.ai_score),
    tags,
  };
}

export function mapPost(row: PostRow, tags: Tag[] = []): Post {
  return {
    ...mapSummary(row, tags),
    userId: row.user_id,
    html: row.html ?? "",
    json: row.json ?? "{}",
    scheduledAt: asString(row.scheduled_at),
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonicalUrl: row.canonical_url,
    ogImageUrl: row.og_image_url,
    focusKeyword: row.focus_keyword,
    seoReport: row.seo_report,
    aiReport: row.ai_report,
    createdAt: asString(row.created_at) ?? "",
  };
}

export function mapSettings(row: Record<string, unknown>): SiteSettings {
  return {
    siteName: String(row.site_name ?? "Dat Ngo"),
    tagline: String(row.tagline ?? ""),
    bio: String(row.bio ?? ""),
    aboutHtml: String(row.about_html ?? ""),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    xHandle: String(row.x_handle ?? "datngotien"),
    githubUrl: row.github_url ? String(row.github_url) : null,
    location: String(row.location ?? "Hà Nội"),
    beehiivEmbedUrl: row.beehiiv_embed_url ? String(row.beehiiv_embed_url) : null,
    beehiivPublication: row.beehiiv_publication ? String(row.beehiiv_publication) : null,
    footerNote: String(row.footer_note ?? ""),
  };
}

export function mapMedia(row: Record<string, unknown>): MediaItem {
  return {
    id: String(row.id),
    url: String(row.url),
    alt: String(row.alt ?? ""),
    caption: String(row.caption ?? ""),
    credit: String(row.credit ?? ""),
    storage: String(row.storage ?? "url") === "r2" ? "r2" : "url",
    objectKey: row.object_key ? String(row.object_key) : null,
    createdAt: asString(row.created_at) ?? "",
  };
}

export function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    title: String(row.title),
    summary: String(row.summary ?? ""),
    url: row.url ? String(row.url) : null,
    year: row.year ? String(row.year) : null,
    tags: String(row.tags ?? ""),
    sortOrder: asNum(row.sort_order) ?? 0,
  };
}

export function mapSubscriber(row: Record<string, unknown>): Subscriber {
  return {
    id: String(row.id),
    email: String(row.email),
    source: String(row.source ?? "site"),
    createdAt: asString(row.created_at) ?? "",
  };
}
