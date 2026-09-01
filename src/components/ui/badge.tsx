import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "mute",
  ...props
}: React.ComponentProps<"span"> & { tone?: "mute" | "good" | "warn" | "bad" | "forest" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        tone === "mute" && "bg-code text-muted",
        tone === "good" && "bg-forest-soft text-forest-deep",
        tone === "warn" && "bg-warn-soft text-warn",
        tone === "bad" && "bg-bad-soft text-brick",
        tone === "forest" && "bg-forest text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}
