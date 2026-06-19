import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientButtonProps extends React.ComponentProps<"button"> {
  variant?: "primary" | "subtle" | "outline"
  size?: "sm" | "md" | "lg"
}

function GradientButton({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-premium overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && [
          "gradient-cta text-white shadow-lg shadow-primary/20",
          "hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
          "active:translate-y-0",
        ],
        variant === "subtle" && [
          "gradient-primary-subtle text-primary border border-primary/10",
          "hover:bg-primary/10 hover:border-primary/20",
        ],
        variant === "outline" && [
          "bg-transparent text-foreground border border-border",
          "hover:bg-secondary hover:border-border",
        ],
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-6 text-sm",
        size === "lg" && "h-12 px-8 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { GradientButton, type GradientButtonProps }
