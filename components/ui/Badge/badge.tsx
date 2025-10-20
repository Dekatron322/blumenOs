"use client"

import React from "react"

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive" | "outline" | "secondary"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors"

    const variantClasses = {
      default: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
      destructive: "bg-red-500 text-white border-transparent hover:bg-red-600",
      outline: "text-gray-800 border-gray-300 bg-white hover:bg-gray-50",
      secondary: "bg-gray-200 text-gray-800 border-transparent hover:bg-gray-300",
    }

    return (
      <div ref={ref} className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
        {children}
      </div>
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
