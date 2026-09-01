import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getSql } = await import("@/lib/db");
        const { ensureSeed } = await import("@/lib/cms/seed");
        await ensureSeed();
        const origin = new URL(request.url).origin;
        const sql = await getSql();
        const posts = await sql<{
          title: string;
          slug: string;
          excerpt: string;
          published_at: string;
        }>`
          select title, slug, excerpt, published_at from posts
          where status = 'published'
          order by published_at desc
          limit 30
        `;
        const items = posts
          .map(
            (p) => `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${origin}/writing/${p.slug}</link>
      <guid>${origin}/writing/${p.slug}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
    </item>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>DATNGO</title>
    <link>${origin}</link>
    <description>Ghi chú kỹ thuật. Hệ thống. Thẩm mỹ.</description>
${items}
  </channel>
</rss>`;
        return new Response(xml, {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
