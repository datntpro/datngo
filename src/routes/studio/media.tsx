import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addMedia, deleteMedia, studioBootstrap, uploadMedia } from "@/lib/cms/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/studio/media")({ component: MediaPage });

function MediaPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const r2 = q.data?.r2.configured ?? false;

  const add = useMutation({
    mutationFn: () => addMedia({ data: { url, alt, caption, credit } }),
    onSuccess: () => {
      toast.success("Đã thêm ảnh URL");
      setUrl("");
      setAlt("");
      setCaption("");
      setCredit("");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const dataBase64 = await fileToDataUrl(file);
      return uploadMedia({
        data: { filename: file.name, contentType: file.type || "image/jpeg", dataBase64, alt, caption, credit },
      });
    },
    onSuccess: () => {
      toast.success("Đã tải lên R2");
      setAlt("");
      setCaption("");
      setCredit("");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteMedia({ data: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio"] }),
  });

  const media = q.data?.media ?? [];

  return (
    <div className="px-5 py-8 sm:px-8">
      <p className="kicker">Thư viện</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Media</h1>
      <p className="mt-2 max-w-xl text-muted">
        {r2
          ? "Tải ảnh lên Cloudflare R2, hoặc dán URL có sẵn. File không nằm trên máy chủ ứng dụng."
          : "Chưa gắn R2 — dán URL ảnh (Unsplash, R2 public, Cloudinary…). Khi deploy, thêm biến R2_* để tải file trực tiếp."}
      </p>

      {r2 ? (
        <div className="mt-8 border border-rule bg-paper-raised p-5">
          <Label>Tải lên R2</Label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="mt-2 block w-full font-mono text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
              e.target.value = "";
            }}
          />
          <p className="mt-2 font-mono text-[11px] text-faint">JPEG, PNG, WebP, GIF, AVIF · tối đa 6MB</p>
        </div>
      ) : null}

      <form
        className="mt-6 grid gap-3 border border-rule bg-paper-raised p-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <div className="sm:col-span-2">
          <Label htmlFor="m-url">Hoặc dán URL</Label>
          <Input id="m-url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
        </div>
        <div>
          <Label htmlFor="m-alt">Alt</Label>
          <Input id="m-alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="m-credit">Credit</Label>
          <Input id="m-credit" value={credit} onChange={(e) => setCredit(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="m-cap">Caption</Label>
          <Input id="m-cap" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <Button type="submit" disabled={add.isPending}>
          Thêm URL vào thư viện
        </Button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <figure key={item.id} className="border border-rule bg-paper-raised p-2">
            <img src={item.url} alt={item.alt} className="aspect-[16/10] w-full object-cover" />
            <figcaption className="px-1 pt-3">
              <p className="text-sm">{item.alt || "Không alt"}</p>
              <p className="mt-1 font-mono text-[10px] break-all text-faint">
                {item.storage === "r2" ? "R2 · " : "URL · "}
                {item.url}
              </p>
              <button
                type="button"
                className="mt-2 font-mono text-[11px] text-brick uppercase"
                onClick={() => del.mutate(item.id)}
              >
                Xóa
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không đọc được file"));
    reader.readAsDataURL(file);
  });
}
