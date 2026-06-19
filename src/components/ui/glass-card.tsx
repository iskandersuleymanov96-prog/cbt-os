import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "subtle" | "strong" | "dark"
  hover?: boolean
  glow?: boolean
  padding?: "sm" | "md" | "lg" | "none"
}

const variantClasses = {
  default: "glass-card",
  subtle: "glass-subtle",
  strong: "glass-strong",
  dark: "glass-dark",
}

function GlassCard({
  className,
  variant = "default",
  hover = true,
  glow = false,
  padding = "md",
  children,
  ...props
}: GlassCardProps) {
  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  return (
    <div
      className={cn(
        "rounded-2xl",
        paddingClasses[padding],
        variantClasses[variant],
        hover && "hover-lift",
        glow && "hover-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { GlassCard, type GlassCardProps }
