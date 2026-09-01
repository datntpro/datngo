import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/cms/types";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const els = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const list = (
    <ol className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
          <a
            href={`#${item.id}`}
            onClick={() => setOpen(false)}
            className={cn(
              "block font-mono text-[11px] leading-snug no-underline",
              active === item.id ? "text-forest" : "text-muted hover:text-ink",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-full items-center justify-between border border-rule px-3 font-mono text-[11px] tracking-[0.12em] uppercase"
        >
          Mục lục
          <span>{open ? "–" : "+"}</span>
        </button>
        {open ? <div className="border border-t-0 border-rule p-4">{list}</div> : null}
      </div>
      <aside className="sticky top-20 hidden lg:block">
        <p className="kicker mb-4">Mục lục</p>
        {list}
      </aside>
    </>
  );
}
