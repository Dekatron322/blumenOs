"use client"
import { MotionProps } from "framer-motion"

import React from "react"

type ButtonVariant =
  | "primary"
  | "black"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "danger"
  | "outlineDanger"
  | "dangerSecondary"
  | "orange"
  | "blue"
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
  loading?: boolean
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
  loading = false,
}) => {
  const baseClasses =
    "flex  z-0  items-center overflow-hidden justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantClasses = {
    primary:
      "bg-[#004B23] text-[#ffffff] hover:bg-[#008000] focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23]",
    black: "bg-[#131319] text-[#ffffff] hover:bg-[#000000] focus:ring-[#131319]",
    secondary: "bg-[#E6F0FF] text-[#003F9F] hover:bg-[#C4DBFF] focus:ring-[#003F9F]",
    outline: "border border-[#004B23] text-[#004B23] hover:bg-[#F3f4f6] focus:ring-[#004B23]",
    success: "bg-[#16A34A] text-white hover:bg-[#15803D] focus:ring-[#16A34A]",
    outlineDanger: "border border-[#D82E2E] text-[#D82E2E] hover:bg-[#FDF3F3] focus:ring-[#D82E2E]",
    ghost: "text-[#003F9F] hover:bg-[#E6F0FF] focus:ring-[#003F9F]",
    danger: "bg-[#D82E2E] text-white hover:bg-[#F14848] focus:ring-[#F14848]",
    dangerSecondary: "bg-[#FDF3F3] text-[#D82E2E] hover:bg-[#F14848] focus:ring-[#F14848] hover:text-[#FFFFFF]",
    orange: "bg-orange-700 text-white hover:bg-[#F14848] focus:ring-[#F14848] hover:text-[#FFFFFF]",
    blue: "bg-[#003F9F] text-[#ffffff] hover:bg-[#0056CC] focus:ring-[#003F9F] focus-within:ring-2 focus-within:ring-[#003F9F] focus-within:ring-offset-2 hover:border-[#003F9F]",
  }

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? "z-0 cursor-not-allowed opacity-50" : "gap-1"
      } ${className}`}
    >
      {iconPosition === "start" && (
        <span className="inline-flex items-center">
          {loading ? (
            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            icon
          )}
        </span>
      )}
      {children}
      {iconPosition === "end" && (
        <span className=" inline-flex items-center">
          {loading ? (
            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            icon
          )}
        </span>
      )}
    </button>
  )
}
