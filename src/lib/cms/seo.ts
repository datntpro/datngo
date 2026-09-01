import { extractToc, stripHtml } from "./html";
import type { SeoIssue, SeoReport } from "./types";

type SeoInput = {
  title: string;
  excerpt: string;
  html: string;
  slug: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  coverUrl?: string | null;
  coverAlt?: string | null;
  focusKeyword?: string | null;
};

function lenStatus(n: number, min: number, max: number): SeoIssue["status"] {
  if (n >= min && n <= max) return "pass";
  if (n === 0) return "fail";
  if (n < min * 0.6 || n > max * 1.4) return "fail";
  return "warn";
}

export function analyzeSeo(input: SeoInput): SeoReport {
  const title = (input.metaTitle || input.title || "").trim();
  const description = (input.metaDescription || input.excerpt || "").trim();
  const html = input.html || "";
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const keyword = (input.focusKeyword || "").trim().toLowerCase();
  const toc = extractToc(html);
  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const missingAlt = imgTags.filter((tag) => !/\balt\s*=\s*["'][^"']+["']/i.test(tag)).length;
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const internal = links.filter((h) => h.startsWith("/") || h.startsWith("#")).length;
  const external = links.filter((h) => /^https?:/i.test(h)).length;
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const sentences = text.split(/[.!?…]+/).filter((s) => s.trim().length > 12);
  const avgSentence =
    sentences.length === 0
      ? 0
      : Math.round(
          sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length,
        );
  const firstPara = text.slice(0, 400).toLowerCase();
  const slug = input.slug.toLowerCase();

  const issues: SeoIssue[] = [
    {
      key: "title",
      label: "Tiêu đề SEO",
      status: lenStatus(title.length, 35, 62),
      detail:
        title.length === 0
          ? "Chưa có tiêu đề."
          : `${title.length} ký tự — lý tưởng 50–60.`,
    },
    {
      key: "description",
      label: "Meta description",
      status: lenStatus(description.length, 110, 165),
      detail:
        description.length === 0
          ? "Thiếu mô tả. Search sẽ tự cắt đoạn đầu bài."
          : `${description.length} ký tự — lý tưởng 145–160.`,
    },
    {
      key: "slug",
      label: "Đường dẫn",
      status: !slug
        ? "fail"
        : slug.length > 70 || /_{2,}|[A-Z]/.test(input.slug)
          ? "warn"
          : "pass",
      detail: slug ? `/${slug}` : "Chưa có slug.",
    },
    {
      key: "length",
      label: "Độ dài nội dung",
      status: wordCount >= 900 ? "pass" : wordCount >= 500 ? "warn" : "fail",
      detail: `${wordCount} từ. Bài kỹ thuật nên từ 900 từ trở lên.`,
    },
    {
      key: "headings",
      label: "Cấu trúc heading",
      status: toc.filter((t) => t.level === 2).length >= 2 && h1Count <= 1 ? "pass" : "warn",
      detail:
        h1Count > 1
          ? `Có ${h1Count} thẻ H1 — chỉ nên một tiêu đề chính.`
          : toc.length === 0
            ? "Chưa có H2/H3. Mục lục sẽ trống."
            : `${toc.filter((t) => t.level === 2).length} H2, ${toc.filter((t) => t.level === 3).length} H3.`,
    },
    {
      key: "cover",
      label: "Ảnh bìa",
      status: input.coverUrl ? (input.coverAlt ? "pass" : "warn") : "fail",
      detail: input.coverUrl
        ? input.coverAlt
          ? "Có ảnh bìa và alt text."
          : "Có ảnh bìa nhưng thiếu alt."
        : "Thiếu ảnh bìa.",
    },
    {
      key: "alts",
      label: "Alt của ảnh trong bài",
      status: imgTags.length === 0 ? "warn" : missingAlt === 0 ? "pass" : "fail",
      detail:
        imgTags.length === 0
          ? "Bài chưa có ảnh minh họa."
          : missingAlt
            ? `${missingAlt}/${imgTags.length} ảnh thiếu alt.`
            : `${imgTags.length} ảnh, đủ alt.`,
    },
    {
      key: "links",
      label: "Liên kết",
      status: internal + external >= 2 ? "pass" : "warn",
      detail: `${internal} nội bộ, ${external} bên ngoài.`,
    },
    {
      key: "readability",
      label: "Độ dễ đọc",
      status: avgSentence === 0 ? "fail" : avgSentence <= 22 ? "pass" : avgSentence <= 30 ? "warn" : "fail",
      detail: avgSentence
        ? `Trung bình ${avgSentence} từ/câu. Giữ dưới 22.`
        : "Chưa đủ câu để đo.",
    },
  ];

  if (keyword) {
    const inTitle = title.toLowerCase().includes(keyword);
    const inDesc = description.toLowerCase().includes(keyword);
    const inOpen = firstPara.includes(keyword);
    const inSlug = slug.includes(keyword.replace(/\s+/g, "-"));
    const hits = [inTitle, inDesc, inOpen, inSlug].filter(Boolean).length;
    issues.push({
      key: "keyword",
      label: "Từ khóa trọng tâm",
      status: hits >= 3 ? "pass" : hits >= 2 ? "warn" : "fail",
      detail: `Xuất hiện trong ${[
        inTitle && "tiêu đề",
        inDesc && "mô tả",
        inOpen && "đoạn mở",
        inSlug && "slug",
      ]
        .filter(Boolean)
        .join(", ") || "không đâu"}.`,
    });
  } else {
    issues.push({
      key: "keyword",
      label: "Từ khóa trọng tâm",
      status: "warn",
      detail: "Chưa đặt focus keyword — SEO sẽ khó đo.",
    });
  }

  const weights: Record<string, number> = {
    title: 14,
    description: 12,
    slug: 8,
    length: 16,
    headings: 12,
    cover: 8,
    alts: 8,
    links: 8,
    readability: 8,
    keyword: 6,
  };
  let score = 0;
  for (const issue of issues) {
    const w = weights[issue.key] ?? 8;
    score += issue.status === "pass" ? w : issue.status === "warn" ? w * 0.5 : 0;
  }

  return {
    score: Math.round(score),
    wordCount,
    issues,
  };
}
