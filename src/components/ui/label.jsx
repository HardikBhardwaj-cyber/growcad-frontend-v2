import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  [
    // Typography
    "text-sm font-medium leading-none tracking-[0.005em] mb-1.5",
    // Color — slightly muted, not full-strength foreground
    "text-foreground/80",
    // Transition
    "transition-all duration-200 ease-out",
    // Peer-focus: shift toward violet when sibling input is focused
    "peer-focus-visible:text-violet-600 dark:peer-focus-visible:text-violet-400",
    // Error state via data attribute
    "data-[error=true]:text-destructive/80",
    // Disabled — soft, not harsh
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-40",
    // No text selection on double-click
    "select-none cursor-pointer",
  ].join(" ")
)

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
