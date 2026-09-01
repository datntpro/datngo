import type { ReactNode } from "react";
import type { SiteSettings } from "@/lib/cms/types";
import { SiteFooter } from "./footer";
import { SiteHeader } from "./header";

export function SiteShell({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
