import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  addStaffMember,
  deleteProject,
  deleteStaffMember,
  saveProject,
  saveSettings,
  studioBootstrap,
} from "@/lib/cms/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { Project, StaffRole } from "@/lib/cms/types";
import { toast } from "sonner";

export const Route = createFileRoute("/studio/settings")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  const s = q.data?.settings;
  const [form, setForm] = useState({
    siteName: "",
    tagline: "",
    bio: "",
    aboutHtml: "",
    avatarUrl: "",
    xHandle: "",
    githubUrl: "",
    location: "",
    footerNote: "",
    beehiivEmbedUrl: "",
    beehiivPublication: "",
  });

  useEffect(() => {
    if (!s) return;
    setForm({
      siteName: s.siteName,
      tagline: s.tagline,
      bio: s.bio,
      aboutHtml: s.aboutHtml,
      avatarUrl: s.avatarUrl ?? "",
      xHandle: s.xHandle,
      githubUrl: s.githubUrl ?? "",
      location: s.location,
      footerNote: s.footerNote,
      beehiivEmbedUrl: s.beehiivEmbedUrl ?? "",
      beehiivPublication: s.beehiivPublication ?? "",
    });
  }, [s]);

  const save = useMutation({
    mutationFn: () =>
      saveSettings({
        data: {
          ...form,
          avatarUrl: form.avatarUrl || null,
          githubUrl: form.githubUrl || null,
          beehiivEmbedUrl: form.beehiivEmbedUrl || null,
          beehiivPublication: form.beehiivPublication || null,
        },
      }),
    onSuccess: () => {
      toast.success("Đã lưu cài đặt");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (q.data?.me.role && q.data.me.role !== "admin") {
    return (
      <div className="px-5 py-8 sm:px-8">
        <h1 className="font-serif text-3xl">Cài đặt</h1>
        <p className="mt-3 text-muted">Chỉ admin mới sửa site, nhân sự và danh sách dự án.</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 sm:px-8">
      <p className="kicker">Site</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Cài đặt</h1>
      <form
        className="mt-8 max-w-2xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Tên site">
          <Input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
        </Field>
        <Field label="Tagline">
          <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
        <Field label="Bio ngắn">
          <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </Field>
        <Field label="About HTML">
          <Textarea className="min-h-40" value={form.aboutHtml} onChange={(e) => set("aboutHtml", e.target.value)} />
        </Field>
        <Field label="Avatar URL">
          <Input value={form.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="X handle">
            <Input value={form.xHandle} onChange={(e) => set("xHandle", e.target.value)} />
          </Field>
          <Field label="GitHub URL">
            <Input value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} />
          </Field>
        </div>
        <Field label="Địa điểm">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label="Footer">
          <Input value={form.footerNote} onChange={(e) => set("footerNote", e.target.value)} />
        </Field>
        <Button type="submit" disabled={save.isPending}>
          Lưu cài đặt
        </Button>
      </form>
      <ProjectsBlock />
      <StaffBlock />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ProjectsBlock() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  const [draft, setDraft] = useState<Partial<Project> & { title: string; summary: string }>({
    title: "",
    summary: "",
    year: "2026",
    url: "",
    tags: "",
  });
  const [editing, setEditing] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (input: {
      id?: string;
      title: string;
      summary: string;
      url?: string | null;
      year?: string | null;
      tags?: string;
    }) => saveProject({ data: input }),
    onSuccess: () => {
      setDraft({ title: "", summary: "", year: "2026", url: "", tags: "" });
      setEditing(null);
      toast.success("Đã lưu dự án");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteProject({ data: id }),
    onSuccess: () => {
      toast.success("Đã xóa dự án");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startEdit(p: Project) {
    setEditing(p.id);
    setDraft({
      id: p.id,
      title: p.title,
      summary: p.summary,
      year: p.year ?? "",
      url: p.url ?? "",
      tags: p.tags,
    });
  }

  return (
    <section className="mt-16 max-w-2xl">
      <h2 className="font-serif text-2xl">Dự án trên /work</h2>
      <ul className="mt-4 divide-y divide-rule border-y border-rule">
        {(q.data?.projects ?? []).map((p) => (
          <li key={p.id} className="flex items-start justify-between gap-3 py-3">
            <div>
              <p className="font-serif text-lg">{p.title}</p>
              <p className="text-sm text-muted">{p.summary}</p>
              <p className="mt-1 font-mono text-[11px] text-faint">
                {p.year || "—"} {p.url ? `· ${p.url}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-3 font-mono text-[11px] uppercase">
              <button type="button" className="text-forest" onClick={() => startEdit(p)}>
                Sửa
              </button>
              <button
                type="button"
                className="text-brick"
                onClick={() => {
                  if (confirm(`Xóa dự án “${p.title}”?`)) del.mutate(p.id);
                }}
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({
            id: editing ?? undefined,
            title: draft.title,
            summary: draft.summary,
            year: draft.year || null,
            url: draft.url || null,
            tags: draft.tags,
          });
        }}
      >
        <p className="kicker">{editing ? "Sửa dự án" : "Thêm dự án"}</p>
        <Input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="Tên dự án"
          required
        />
        <Input
          value={draft.summary}
          onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
          placeholder="Tóm tắt"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            value={draft.year ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))}
            placeholder="Năm"
          />
          <Input
            value={draft.url ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            placeholder="URL (tuỳ chọn)"
          />
        </div>
        <Input
          value={draft.tags ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
          placeholder="Tags, cách nhau bởi dấu phẩy"
        />
        <div className="flex gap-2">
          <Button type="submit" variant="outline" disabled={save.isPending}>
            {editing ? "Lưu dự án" : "Thêm dự án"}
          </Button>
          {editing ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setDraft({ title: "", summary: "", year: "2026", url: "", tags: "" });
              }}
            >
              Hủy
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

function StaffBlock() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["studio"], queryFn: () => studioBootstrap() });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("publisher");
  const add = useMutation({
    mutationFn: () => addStaffMember({ data: { email, role } }),
    onSuccess: () => {
      setEmail("");
      toast.success("Đã thêm người viết");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteStaffMember({ data: id }),
    onSuccess: () => {
      toast.success("Đã gỡ quyền");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="mt-16 max-w-2xl">
      <h2 className="font-serif text-2xl">Người được vào Studio</h2>
      <p className="mt-2 text-sm text-muted">
        Đọc bài không cần tài khoản. Chỉ email trong danh sách này mới soạn, xuất bản, quản lý media.
        Admin sửa cài đặt; Publisher chỉ viết bài.
      </p>
      <ul className="mt-4 divide-y divide-rule border-y border-rule">
        {(q.data?.staff ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-mono text-sm">{s.email || s.userId || "—"}</p>
              <p className="font-mono text-[11px] uppercase text-faint">
                {s.role}
                {s.userId ? " · đã vào" : " · chưa đăng nhập"}
              </p>
            </div>
            <button
              type="button"
              className="font-mono text-[11px] text-brick uppercase"
              onClick={() => {
                if (confirm("Gỡ quyền Studio của người này?")) del.mutate(s.id);
              }}
            >
              Gỡ
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email người viết"
          className="sm:flex-1"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          className="h-11 border border-rule bg-paper-raised px-3 font-mono text-sm"
        >
          <option value="publisher">Publisher</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" variant="outline">
          Mời
        </Button>
      </form>
    </section>
  );
}
