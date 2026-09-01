import { getSql } from "@/lib/db";
import { mapTag, type TagRow } from "./map";
import type { Tag } from "./types";

export async function tagsForPosts(postIds: string[]) {
  const map: Record<string, Tag[]> = {};
  if (postIds.length === 0) return map;
  const sql = await getSql();
  const placeholders = postIds.map((_, i) => `$${i + 1}`).join(", ");
  const rows = await sql.query<TagRow & { post_id: string }>(
    `select pt.post_id, t.id, t.slug, t.name, t.description
     from post_tags pt
     join tags t on t.id = pt.tag_id
     where pt.post_id in (${placeholders})
     order by t.name`,
    postIds,
  );
  for (const row of rows) {
    (map[row.post_id] ??= []).push(mapTag(row));
  }
  return map;
}
