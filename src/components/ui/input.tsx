import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full border border-rule bg-paper-raised px-3 font-mono text-sm text-ink",
        "placeholder:text-faint focus-visible:border-forest",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full border border-rule bg-paper-raised px-3 py-2 font-serif text-base text-ink",
        "placeholder:text-faint focus-visible:border-forest",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("kicker mb-1.5 block", className)}
      {...props}
    />
  );
}
