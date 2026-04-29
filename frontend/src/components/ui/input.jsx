import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background/40 px-3 py-2 text-sm text-foreground transition-all",
        "placeholder:text-muted-foreground/70",
        "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-background/60 focus-visible:ring-2 focus-visible:ring-primary/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
