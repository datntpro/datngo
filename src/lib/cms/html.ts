import { countWords, readingMinutes, slugify } from "@/lib/utils";
import type { TocItem } from "./types";

export function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "");
}

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function withHeadingIds(html: string) {
  const used = new Set<string>();
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_full, level, attrs, inner) => {
    const text = stripHtml(inner);
    let id = slugify(text) || `muc-${level}`;
    let unique = id;
    let n = 2;
    while (used.has(unique)) {
      unique = `${id}-${n}`;
      n += 1;
    }
    used.add(unique);
    const cleaned = String(attrs).replace(/\s*id=(['"]).*?\1/i, "");
    return `<h${level}${cleaned} id="${unique}">${inner}</h${level}>`;
  });
}

export function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const level = Number(match[1]) as 2 | 3;
    const attrs = match[2] ?? "";
    const text = stripHtml(match[3] ?? "");
    const idMatch = attrs.match(/\sid=["']([^"']+)["']/i);
    const id = idMatch?.[1] ?? slugify(text);
    if (text && id) items.push({ id, text, level });
  }
  return items;
}

export function excerptFrom(html: string, max = 180) {
  const text = stripHtml(html);
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export function statsFromHtml(html: string) {
  const wordCount = countWords(html);
  return { wordCount, readingMinutes: readingMinutes(wordCount) };
}
