import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  FolderOpen,
  Image as ImageIcon,
  Mail,
  PenLine,
  Settings,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";

const ITEMS: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/studio", label: "Bảng", icon: LayoutDashboard, exact: true },
  { to: "/studio/posts", label: "Bài viết", icon: PenLine },
  { to: "/studio/media", label: "Media", icon: ImageIcon },
  { to: "/studio/topics", label: "Chuyên mục", icon: FolderOpen },
  { to: "/studio/seo", label: "SEO", icon: BarChart3 },
  { to: "/studio/newsletter", label: "Thư", icon: Mail },
  { to: "/studio/settings", label: "Cài đặt", icon: Settings },
];

export function StudioNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="flex h-full flex-col border-r border-rule bg-paper-raised">
      <div className="flex h-14 items-center gap-2 border-b border-rule px-4">
        <Link to="/" className="font-serif text-lg tracking-tight text-ink no-underline">
          DATNGO
        </Link>
        <span className="kicker">Studio</span>
      </div>
      <nav className="flex-1 p-2">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-11 items-center gap-3 px-3 font-mono text-[11px] tracking-[0.12em] uppercase no-underline",
                active ? "bg-forest-soft text-forest-deep" : "text-muted hover:bg-code hover:text-ink",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t border-rule px-3 py-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-muted no-underline hover:text-ink"
        >
          <ExternalLink className="size-3.5" />
          Xem site
        </Link>
        <UserButton />
      </div>
    </aside>
  );
}

export function StudioMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-rule bg-paper/95 backdrop-blur-sm lg:hidden">
      {ITEMS.slice(0, 5).map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex h-14 flex-1 flex-col items-center justify-center gap-1 font-mono text-[9px] tracking-wide uppercase no-underline",
              active ? "text-forest" : "text-muted",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
