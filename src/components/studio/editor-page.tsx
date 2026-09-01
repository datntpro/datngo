import { useQuery } from "@tanstack/react-query";
import { PostWorkspace } from "@/components/studio/post-workspace";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getMyPost, studioBootstrap } from "@/lib/cms/admin";

export function EditorPage({ id }: { id: string }) {
  const postQ = useQuery({
    queryKey: ["post", id],
    queryFn: () => getMyPost({ data: id }),
  });
  const studioQ = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });

  if (postQ.isPending || studioQ.isPending) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="kicker">Đang mở editor…</p>
      </div>
    );
  }
  if (!postQ.data?.post) {
    return (
      <div className="p-8">
        <p>Không tìm thấy bài, hoặc bạn không phải tác giả.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <PostWorkspace
        post={postQ.data.post}
        allTags={postQ.data.allTags}
        media={studioQ.data?.media ?? []}
      />
    </TooltipProvider>
  );
}
