"use client"
import { MotionProps } from "framer-motion"

import React from "react"

type ButtonVariant =
  | "primary"
  | "black"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "outlineDanger"
  | "dangerSecondary"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends MotionProps {
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
  /** Optional icon element to render */
  icon?: React.ReactNode
  /** Position of the icon relative to the button text */
  iconPosition?: "start" | "end"
}

export const ButtonModule: React.FC<ButtonProps> = ({
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  children,
  icon,
  iconPosition = "start",
}) => {
  const baseClasses =
    "flex z-0 items-center overflow-hidden justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantClasses = {
    primary:
      "bg-[#0A0A0A] text-[#ffffff] hover:bg-[#000000] focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a]",
    black: "bg-[#131319] text-[#ffffff] hover:bg-[#000000] focus:ring-[#131319]",
    secondary: "bg-[#E6F0FF] text-[#003F9F] hover:bg-[#C4DBFF] focus:ring-[#003F9F]",
    outline: "border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#F3f4f6] focus:ring-[#0A0A0A]",
    outlineDanger: "border border-[#D82E2E] text-[#D82E2E] hover:bg-[#FDF3F3] focus:ring-[#D82E2E]",
    ghost: "text-[#003F9F] hover:bg-[#E6F0FF] focus:ring-[#003F9F]",
    danger: "bg-[#D82E2E] text-white hover:bg-[#F14848] focus:ring-[#F14848]",
    dangerSecondary: "bg-[#FDF3F3] text-[#D82E2E] hover:bg-[#F14848] focus:ring-[#F14848] hover:text-[#FFFFFF]",
  }

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? "z-0 cursor-not-allowed opacity-50" : ""
      } ${className}`}
    >
      {icon && iconPosition === "start" && <span className="mr-2 inline-flex items-center">{icon}</span>}
      {children}
      {icon && iconPosition === "end" && <span className="ml-2 inline-flex items-center">{icon}</span>}
    </button>
  )
}
