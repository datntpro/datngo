import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { getPublicSettings, listPublicProjects } from "@/lib/cms/public";

export const Route = createFileRoute("/work")({
  loader: async () => {
    const [settings, projects] = await Promise.all([getPublicSettings(), listPublicProjects()]);
    return { settings, projects };
  },
  component: Work,
});

function Work() {
  const { settings, projects } = Route.useLoaderData();
  return (
    <SiteShell settings={settings}>
      <section className="site-grid py-12">
        <p className="kicker">Selected</p>
        <h1 className="mt-2 font-serif text-5xl tracking-tight">Đang làm</h1>
        <p className="mt-3 max-w-xl text-muted">
          Sản phẩm và chuỗi ghi chú — cập nhật từ Studio.
        </p>
        <ul className="mt-10 divide-y divide-rule border-y border-rule">
          {projects.map((project) => (
            <li key={project.id} className="grid gap-2 py-8 sm:grid-cols-[6rem_1fr_auto] sm:items-baseline">
              <span className="font-mono text-[11px] text-faint">{project.year}</span>
              <div>
                <p className="font-serif text-2xl tracking-tight">{project.title}</p>
                <p className="mt-2 max-w-xl text-muted">{project.summary}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-faint">{project.tags}</p>
              </div>
              {project.url ? (
                <a href={project.url} className="font-mono text-[11px] uppercase text-forest no-underline">
                  Mở
                </a>
              ) : (
                <span className="font-mono text-[11px] uppercase text-faint">WIP</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
