import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StudioShell } from "@/components/studio/shell";

export const Route = createFileRoute("/studio")({
  component: () => (
    <StudioShell>
      <Outlet />
    </StudioShell>
  ),
});
