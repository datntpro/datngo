import { Link } from "@tanstack/react-router";
import type { SiteSettings } from "@/lib/cms/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="site-grid grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl tracking-tight">DATNGO</p>
          <p className="mt-3 max-w-xs text-sm text-muted">{settings.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 font-mono text-[11px] tracking-[0.12em] uppercase">
          <Link to="/writing" className="text-ink no-underline hover:text-forest">
            Viết
          </Link>
          <Link to="/work" className="text-ink no-underline hover:text-forest">
            Làm
          </Link>
          <Link to="/newsletter" className="text-ink no-underline hover:text-forest">
            Newsletter
          </Link>
          <Link to="/about" className="text-ink no-underline hover:text-forest">
            Về tôi
          </Link>
          <a href="/rss.xml" className="text-ink no-underline hover:text-forest">
            RSS
          </a>
          <Link to="/studio" className="text-ink no-underline hover:text-forest">
            Studio
          </Link>
        </div>
        <div className="font-mono text-[11px] text-muted">
          <p>{settings.location}</p>
          {settings.xHandle ? (
            <p className="mt-2">
              <a
                href={`https://x.com/${settings.xHandle}`}
                className="text-ink no-underline hover:text-forest"
                target="_blank"
                rel="noreferrer"
              >
                @{settings.xHandle}
              </a>
            </p>
          ) : null}
          <p className="mt-6">{settings.footerNote || "Viết chậm. Xuất bản khi chắc."}</p>
        </div>
      </div>
    </footer>
  );
}
