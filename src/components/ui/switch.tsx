import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center border border-rule bg-code",
        "data-[state=checked]:border-forest data-[state=checked]:bg-forest",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0 bg-ink transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-paper" />
    </SwitchPrimitive.Root>
  );
}
