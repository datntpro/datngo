import { createFileRoute } from "@tanstack/react-router";
import { NewsletterForm } from "@/components/site/newsletter";
import { SiteShell } from "@/components/site/shell";
import { getPublicSettings } from "@/lib/cms/public";

export const Route = createFileRoute("/about")({
  loader: () => getPublicSettings(),
  component: About,
});

function About() {
  const settings = Route.useLoaderData();
  return (
    <SiteShell settings={settings}>
      <section className="site-grid grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="kicker">Về</p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight">{settings.siteName}</h1>
          <p className="mt-4 max-w-xl font-serif text-xl text-muted">{settings.bio}</p>
          <div
            className="article-body mt-10 max-w-2xl"
            dangerouslySetInnerHTML={{ __html: settings.aboutHtml }}
          />
        </div>
        <aside className="space-y-6">
          {settings.avatarUrl ? (
            <img src={settings.avatarUrl} alt={settings.siteName} className="aspect-[4/5] w-full object-cover" />
          ) : null}
          <dl className="space-y-3 font-mono text-[11px] tracking-wide uppercase">
            <div>
              <dt className="text-faint">Nơi</dt>
              <dd>{settings.location}</dd>
            </div>
            {settings.xHandle ? (
              <div>
                <dt className="text-faint">X</dt>
                <dd>
                  <a href={`https://x.com/${settings.xHandle}`} className="text-forest no-underline">
                    @{settings.xHandle}
                  </a>
                </dd>
              </div>
            ) : null}
            {settings.githubUrl ? (
              <div>
                <dt className="text-faint">GitHub</dt>
                <dd>
                  <a href={settings.githubUrl} className="text-forest no-underline">
                    {settings.githubUrl.replace("https://github.com/", "")}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </section>
      <section className="site-grid pb-16">
        <NewsletterForm settings={settings} source="about" />
      </section>
    </SiteShell>
  );
}
