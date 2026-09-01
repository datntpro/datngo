import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { StudioMobileNav, StudioNav } from "./nav";

export function StudioShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isEditor = /^\/studio\/posts\/[^/]+$/.test(pathname);

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="kicker">Đang mở studio…</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  if (isEditor) return <>{children}</>;
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[220px_1fr]">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-dvh">
          <StudioNav />
        </div>
      </div>
      <div className="pb-16 lg:pb-0">{children}</div>
      <StudioMobileNav />
    </div>
  );
}
