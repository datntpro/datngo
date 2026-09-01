import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/cms/types";

type Props = {
  initialHtml: string;
  initialJson: string;
  media: MediaItem[];
  onChange: (html: string, json: string) => void;
};

function parseContent(json: string, html: string) {
  if (json && json !== "{}") {
    try {
      return JSON.parse(json);
    } catch {
      /* fall through */
    }
  }
  return html || "<p></p>";
}

export function ArticleEditor({ initialHtml, initialJson, media, onChange }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [imageOpen, setImageOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Highlight,
      Underline,
      Typography,
      Placeholder.configure({
        placeholder: "Viết, hoặc dán. Dùng thanh công cụ để chèn heading, ảnh URL, code…",
      }),
      CharacterCount,
    ],
    content: parseContent(initialJson, initialHtml),
    editorProps: {
      attributes: { class: "tiptap px-1 py-2" },
    },
    onUpdate: ({ editor: ed }) => {
      onChangeRef.current(ed.getHTML(), JSON.stringify(ed.getJSON()));
    },
  });

  if (!editor) {
    return <div className="min-h-[52vh] animate-pulse bg-code/50" />;
  }

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-0.5 border border-rule bg-paper-raised p-1">
        <Tool tip="Hoàn tác" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 />
        </Tool>
        <Tool tip="Làm lại" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 />
        </Tool>
        <Sep />
        <Tool
          tip="Tiêu đề H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 />
        </Tool>
        <Tool
          tip="Tiêu đề H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 />
        </Tool>
        <Tool
          tip="Đậm"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </Tool>
        <Tool
          tip="Nghiêng"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </Tool>
        <Tool
          tip="Gạch chân"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </Tool>
        <Tool
          tip="Gạch ngang"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </Tool>
        <Sep />
        <Tool tip="Liên kết" active={editor.isActive("link")} onClick={() => setLinkOpen(true)}>
          <Link2 />
        </Tool>
        <Tool
          tip="Trích dẫn"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </Tool>
        <Tool
          tip="Code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code />
        </Tool>
        <Tool
          tip="Khối code"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <SquareCode />
        </Tool>
        <Tool
          tip="Danh sách"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List />
        </Tool>
        <Tool
          tip="Đánh số"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </Tool>
        <Tool tip="Đường kẻ" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus />
        </Tool>
        <Tool tip="Ảnh từ URL" onClick={() => setImageOpen(true)}>
          <ImageIcon />
        </Tool>
      </div>

      <EditorContent editor={editor} />
      <ImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        media={media}
        onInsert={(src, alt) => {
          editor.chain().focus().setImage({ src, alt }).run();
          setImageOpen(false);
        }}
      />
      <LinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        initial={editor.getAttributes("link").href as string | undefined}
        onApply={(href) => {
          if (!href) editor.chain().focus().unsetLink().run();
          else editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
          setLinkOpen(false);
        }}
      />
    </div>
  );
}

function Tool({
  children,
  onClick,
  active,
  tip,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  tip: string;
}) {
  return (
    <Tooltip content={tip}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "grid size-9 place-items-center text-muted hover:bg-code hover:text-ink",
          active && "bg-forest-soft text-forest-deep",
        )}
      >
        <span className="[&>svg]:size-4">{children}</span>
      </button>
    </Tooltip>
  );
}

function Sep() {
  return <span className="mx-1 h-6 w-px bg-rule" />;
}

function ImageDialog({
  open,
  onOpenChange,
  media,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  media: MediaItem[];
  onInsert: (src: string, alt: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  useEffect(() => {
    if (!open) {
      setUrl("");
      setAlt("");
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Chèn ảnh từ URL</DialogTitle>
        <p className="mt-1 text-sm text-muted">Không lưu file trên server. Dùng Unsplash, Cloudinary, R2…</p>
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="img-url">URL</Label>
            <Input id="img-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </div>
          <div>
            <Label htmlFor="img-alt">Alt text</Label>
            <Input id="img-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Mô tả ảnh cho SEO" />
          </div>
          <Button type="button" onClick={() => url && onInsert(url, alt)} disabled={!url}>
            Chèn ảnh
          </Button>
        </div>
        {media.length > 0 ? (
          <div className="mt-6">
            <p className="kicker mb-3">Thư viện</p>
            <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="overflow-hidden border border-rule text-left hover:border-forest"
                  onClick={() => onInsert(item.url, item.alt)}
                >
                  <img src={item.url} alt={item.alt} className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function LinkDialog({
  open,
  onOpenChange,
  initial,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: string;
  onApply: (href: string) => void;
}) {
  const [href, setHref] = useState(initial ?? "");
  useEffect(() => setHref(initial ?? ""), [initial, open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Liên kết</DialogTitle>
        <div className="mt-4 space-y-3">
          <Input value={href} onChange={(e) => setHref(e.target.value)} placeholder="https:// hoặc /writing/…" />
          <div className="flex gap-2">
            <Button type="button" onClick={() => onApply(href)}>
              Gắn link
            </Button>
            <Button type="button" variant="outline" onClick={() => onApply("")}>
              Gỡ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
