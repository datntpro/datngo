import { cn } from "@/lib/utils";

export function ScoreMark({ score, label }: { score: number | null; label?: string }) {
  const tone =
    score == null ? "text-muted" : score >= 80 ? "text-forest" : score >= 60 ? "text-warn" : "text-brick";
  return (
    <div className="flex items-baseline gap-2">
      <span className={cn("font-serif text-4xl tabular-nums tracking-tight", tone)}>
        {score == null ? "—" : score}
      </span>
      {label ? <span className="kicker">{label}</span> : null}
    </div>
  );
}

export function StatusDot({ status }: { status: "pass" | "warn" | "fail" }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        status === "pass" && "bg-forest",
        status === "warn" && "bg-warn",
        status === "fail" && "bg-brick",
      )}
    />
  );
}
