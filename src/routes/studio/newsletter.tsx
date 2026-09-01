import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { listSubscribers, saveSettings, studioBootstrap } from "@/lib/cms/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/studio/newsletter")({ component: NewsletterAdmin });

function NewsletterAdmin() {
  const qc = useQueryClient();
  const boot = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  const subs = useQuery({ queryKey: ["subscribers"], queryFn: () => listSubscribers() });
  const [embed, setEmbed] = useState("");
  const [pub, setPub] = useState("");

  useEffect(() => {
    if (!boot.data) return;
    setEmbed(boot.data.settings.beehiivEmbedUrl ?? "");
    setPub(boot.data.settings.beehiivPublication ?? "");
  }, [boot.data]);

  const save = useMutation({
    mutationFn: () => {
      const s = boot.data!.settings;
      return saveSettings({
        data: {
          ...s,
          beehiivEmbedUrl: embed || null,
          beehiivPublication: pub || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Đã lưu form đăng ký");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
  });

  return (
    <div className="px-5 py-8 sm:px-8">
      <p className="kicker">Thư</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Newsletter</h1>
      <p className="mt-2 max-w-xl text-muted">
        Form trên site thu email tại đây. Nếu đã có form đăng ký riêng, dán URL iframe — trang Thư sẽ hiện form đó.
      </p>
      <form
        className="mt-8 max-w-xl space-y-3 border border-rule p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div>
          <Label>Publication</Label>
          <Input value={pub} onChange={(e) => setPub(e.target.value)} placeholder="field-notes" />
        </div>
        <div>
          <Label>Embed URL</Label>
          <Input
            value={embed}
            onChange={(e) => setEmbed(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <Button type="submit">Lưu</Button>
      </form>

      <h2 className="mt-12 font-serif text-2xl">Đăng ký local ({subs.data?.length ?? 0})</h2>
      <ul className="mt-4 max-w-xl divide-y divide-rule border-y border-rule">
        {(subs.data ?? []).map((s) => (
          <li key={s.id} className="flex justify-between py-3 font-mono text-sm">
            <span>{s.email}</span>
            <span className="text-faint">
              {s.source} · {formatDate(s.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
