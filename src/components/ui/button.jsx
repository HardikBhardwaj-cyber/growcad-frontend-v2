import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    // Base
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-semibold select-none",
    "transition-all duration-200 ease-out",
    "outline-none",
    // Focus — elegant glow ring
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-violet-500/50",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:scale-100",
    // Loading state
    "data-[loading=true]:pointer-events-none data-[loading=true]:opacity-80",
    // SVG children
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200",
    // Active / pressed
    "active:scale-[0.97] active:brightness-95",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Default ── premium violet gradient, lifted shadow
        default: [
          "bg-gradient-to-b from-[#7c4ff5] to-[#6C3CF4]",
          "text-white",
          "shadow-[0_1px_2px_rgba(0,0,0,0.20),0_4px_12px_rgba(108,60,244,0.30),inset_0_1px_0_rgba(255,255,255,0.12)]",
          "hover:-translate-y-[1px]",
          "hover:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_8px_20px_rgba(108,60,244,0.40),inset_0_1px_0_rgba(255,255,255,0.18)]",
          "hover:from-[#8456f6] hover:to-[#7340f5]",
        ].join(" "),

        // ── Destructive ── refined red, not garish
        destructive: [
          "bg-gradient-to-b from-[#f05252] to-[#e02424]",
          "text-white",
          "shadow-[0_1px_2px_rgba(0,0,0,0.20),0_4px_12px_rgba(224,36,36,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]",
          "hover:-translate-y-[1px]",
          "hover:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_8px_20px_rgba(224,36,36,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]",
          "hover:from-[#f26060] hover:to-[#e83535]",
        ].join(" "),

        // ── Outline ── clean glass border, fills on hover
        outline: [
          "border border-input bg-transparent",
          "text-foreground",
          "shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
          "hover:bg-accent hover:text-accent-foreground",
          "hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)]",
        ].join(" "),

        // ── Secondary ── muted surface, soft lift
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
          "hover:bg-secondary/70",
          "hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
        ].join(" "),

        // ── Ghost ── invisible at rest, subtle fill on hover
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-accent/60 hover:text-accent-foreground",
          "hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        ].join(" "),

        // ── Link ── underline affordance
        link: [
          "text-primary underline-offset-4",
          "hover:underline hover:text-primary/80",
        ].join(" "),
      },

      size: {
        default: "h-9 rounded-[10px] px-4 py-2",
        sm:      "h-8 rounded-[8px]  px-3 text-xs",
        lg:      "h-11 rounded-[12px] px-7 text-[15px]",
        icon:    "h-9 w-9 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
