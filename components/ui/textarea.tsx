import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[72px] w-full rounded-[var(--radius-md)]",
        "border border-[var(--color-input)] bg-[var(--color-card)] px-3 py-2 text-sm",
        "text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/40 focus-visible:border-[var(--color-ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className,
      )}
      {...props}
    />
  );
});
