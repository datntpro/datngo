import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { deleteTag, saveTag, studioBootstrap } from "@/lib/cms/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/studio/topics")({ component: TopicsPage });

function TopicsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const save = useMutation({
    mutationFn: () => saveTag({ data: { name, description } }),
    onSuccess: () => {
      setName("");
      setDescription("");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteTag({ data: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio"] }),
  });

  return (
    <div className="px-5 py-8 sm:px-8">
      <p className="kicker">Taxonomy</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Chuyên mục</h1>
      <form
        className="mt-8 flex max-w-xl flex-col gap-3 border border-rule p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div>
          <Label>Tên</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Mô tả</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button type="submit">Thêm chuyên mục</Button>
      </form>
      <ul className="mt-8 max-w-xl divide-y divide-rule border-y border-rule">
        {(q.data?.tags ?? []).map((tag) => (
          <li key={tag.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-serif text-lg">{tag.name}</p>
              <p className="font-mono text-[11px] text-faint">/{tag.slug}</p>
            </div>
            <button
              type="button"
              className="font-mono text-[11px] text-brick uppercase"
              onClick={() => del.mutate(tag.id)}
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
