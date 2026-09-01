import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { saveProject, saveSettings, studioBootstrap } from "@/lib/cms/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
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
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
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
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [year, setYear] = useState("2026");
  const save = useMutation({
    mutationFn: () => saveProject({ data: { title, summary, year } }),
    onSuccess: () => {
      setTitle("");
      setSummary("");
      void qc.invalidateQueries({ queryKey: ["studio"] });
    },
  });
  return (
    <section className="mt-16 max-w-2xl">
      <h2 className="font-serif text-2xl">Dự án trên /work</h2>
      <ul className="mt-4 divide-y divide-rule border-y border-rule">
        {(q.data?.projects ?? []).map((p) => (
          <li key={p.id} className="py-3">
            <p className="font-serif text-lg">{p.title}</p>
            <p className="text-sm text-muted">{p.summary}</p>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên dự án" required />
        <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Tóm tắt" />
        <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Năm" />
        <Button type="submit" variant="outline">
          Thêm dự án
        </Button>
      </form>
    </section>
  );
}
