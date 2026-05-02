import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Shape
      "rounded-[14px]",
      // Surface
      "bg-card/90 backdrop-blur-[6px]",
      // Border — softened
      "border border-border/50",
      // Layered shadow: tight base + soft spread + inset highlight
      "shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.06)]",
      // Text
      "text-card-foreground",
      // Transitions
      "transition-all duration-200 ease-out",
      // Focus within — when inputs inside are focused
      "focus-within:border-violet-500/40",
      "focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.06),0_0_0_2px_rgba(108,60,244,0.08),inset_0_1px_0_rgba(255,255,255,0.06)]",
      // Hoverable via data attribute — lift + shadow intensification
      "data-[hoverable=true]:hover:-translate-y-[2px]",
      "data-[hoverable=true]:hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_8px_28px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.08)]",
      "data-[hoverable=true]:hover:border-border/70",
      // Active / selected state — violet border glow
      "data-[active=true]:border-violet-500/50",
      "data-[active=true]:shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.06),0_0_0_3px_rgba(108,60,244,0.10),inset_0_1px_0_rgba(255,255,255,0.06)]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-semibold text-[15px] leading-snug tracking-[-0.01em] text-card-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground/80 leading-relaxed mt-0.5", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 p-6 pt-0",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
