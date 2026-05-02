import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Layout & shape
        "flex h-10 w-full rounded-[10px] px-3.5 py-2",
        // Typography
        "text-sm font-medium text-foreground caret-violet-500/80",
        // Surface — subtle elevated feel
        "bg-background/80",
        // Border
        "border border-input/70",
        // Layered shadow — depth without heaviness
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.06)]",
        // Placeholder
        "placeholder:text-muted-foreground/50 placeholder:font-normal",
        // Smooth transitions
        "transition-all duration-200 ease-out",
        // Hover — gentle border brightening
        "hover:border-input hover:shadow-[0_1px_4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.06)]",
        // Focus — violet glow ring
        "focus-visible:outline-none",
        "focus-visible:scale-[1.01]",
        "focus-visible:border-violet-500/60",
        "focus-visible:ring-[3px] focus-visible:ring-violet-500/15",
        "focus-visible:shadow-[0_1px_4px_rgba(0,0,0,0.08),0_0_0_3px_rgba(108,60,244,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]",
        // Error state via data attribute
        "data-[error=true]:border-destructive/70",
        "data-[error=true]:ring-[3px] data-[error=true]:ring-destructive/15",
        "data-[error=true]:focus-visible:border-destructive/80",
        "data-[error=true]:focus-visible:ring-destructive/20",
        // Autofill fix — prevent jarring yellow background
        "[&:-webkit-autofill]:bg-background [&:-webkit-autofill]:text-foreground",
        "[&:-webkit-autofill:hover]:bg-background [&:-webkit-autofill:focus]:bg-background",
        // File input styling
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:border-input/70",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
