export type PostStatus = "draft" | "published" | "scheduled";

export type Tag = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  status: PostStatus;
  featured: boolean;
  publishedAt: string | null;
  updatedAt: string;
  readingMinutes: number;
  wordCount: number;
  seoScore: number | null;
  aiScore: number | null;
  tags: Tag[];
};

export type Post = PostSummary & {
  userId: string;
  html: string;
  json: string;
  scheduledAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  focusKeyword: string | null;
  seoReport: string | null;
  aiReport: string | null;
  createdAt: string;
};

export type MediaItem = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  credit: string;
  createdAt: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  bio: string;
  aboutHtml: string;
  avatarUrl: string | null;
  xHandle: string;
  githubUrl: string | null;
  location: string;
  beehiivEmbedUrl: string | null;
  beehiivPublication: string | null;
  footerNote: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  url: string | null;
  year: string | null;
  tags: string;
  sortOrder: number;
};

export type Subscriber = {
  id: string;
  email: string;
  source: string;
  createdAt: string;
};

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type SeoIssue = {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export type SeoReport = {
  score: number;
  wordCount: number;
  issues: SeoIssue[];
};

export type AiReview = {
  score: number;
  verdict: string;
  structure: number;
  depth: number;
  readability: number;
  seo: number;
  voice: number;
  strengths: string[];
  improvements: string[];
  rewriteHints: string[];
};
