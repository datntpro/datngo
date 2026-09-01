import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getStudioSession } from "@/lib/cms/admin";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { StudioMobileNav, StudioNav } from "./nav";

export function StudioShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isEditor = /^\/studio\/posts\/[^/]+$/.test(pathname);
  const access = useQuery({
    queryKey: ["studio-session"],
    queryFn: () => getStudioSession(),
    enabled: Boolean(user),
  });

  if (isPending || (user && access.isPending)) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="kicker">Đang mở studio…</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  if (!access.data?.ok) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="max-w-md">
          <p className="kicker">Studio</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight">Bạn không phải người viết.</h1>
          <p className="mt-4 text-muted">
            Đọc bài trên DATNGO không cần tài khoản. Nếu muốn nhận bài qua email, đăng ký Thư — không cần vào Studio.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 font-mono text-[11px] uppercase">
            <Link to="/" className="text-forest no-underline">
              ← Về trang chủ
            </Link>
            <Link to="/newsletter" className="text-ink no-underline">
              Đăng ký thư
            </Link>
          </div>
        </div>
      </main>
    );
  }
  if (isEditor) return <>{children}</>;
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[220px_1fr]">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-dvh">
          <StudioNav role={access.data.role} />
        </div>
      </div>
      <div className="pb-16 lg:pb-0">{children}</div>
      <StudioMobileNav />
    </div>
  );
}
