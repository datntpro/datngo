import { Link, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";
import { SearchDialog, useSearchOpen } from "./search";

const NAV = [
  { to: "/writing", label: "Viết" },
  { to: "/work", label: "Làm" },
  { to: "/newsletter", label: "Thư" },
  { to: "/about", label: "Về" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const search = useSearchOpen();

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-sm">
      <div className="site-grid flex h-14 min-w-0 items-center justify-between gap-2 sm:gap-4">
        <Link to="/" className="flex shrink-0 items-baseline gap-2 no-underline">
          <span className="font-serif text-xl tracking-tight text-ink">DATNGO</span>
          <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted uppercase sm:inline">
            Field notes
          </span>
        </Link>
        <nav className="flex min-w-0 items-center gap-0 sm:gap-2">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-1.5 py-2 font-mono text-[11px] tracking-[0.12em] uppercase no-underline sm:px-2",
                  active ? "text-forest" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={search.open}
            className="relative size-9 shrink-0 text-muted hover:text-ink sm:size-11"
            aria-label="Tìm bài viết"
          >
            <Search className="mx-auto size-4" />
          </button>
          {isPending ? (
            <div className="size-8 shrink-0 animate-pulse bg-code" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/studio"
                className="hidden px-2 py-2 font-mono text-[11px] tracking-[0.12em] text-forest uppercase no-underline sm:inline"
              >
                Studio
              </Link>
              <UserButton />
            </div>
          ) : (
            <Link
              to="/login"
              className="shrink-0 px-1.5 py-2 font-mono text-[11px] tracking-[0.12em] text-muted uppercase no-underline hover:text-ink sm:px-2"
            >
              Studio
            </Link>
          )}
        </nav>
      </div>
      <SearchDialog open={search.value} onOpenChange={search.set} />
    </header>
  );
}
