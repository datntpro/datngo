import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

export const Route = createFileRoute("/studio/posts/$id")({
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const [Page, setPage] = useState<ComponentType<{ id: string }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/components/studio/editor-page").then((mod) => {
      if (!cancelled) setPage(() => mod.EditorPage);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Page) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="kicker">Đang mở editor…</p>
      </div>
    );
  }
  return <Page id={id} />;
}
