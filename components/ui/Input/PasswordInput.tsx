"use client"
import React, { useState } from "react"
import { EyesCloseIcon, EyesOpenIcon, LockIcon } from "components/Icons/Icons"

interface PasswordInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  error?: boolean
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export const PasswordInputModule: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  className = "",
  error = false,
  onKeyPress,
  onKeyDown,
  disabled = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <div className={`mb-3 ${className}`}>
      <label className="mb-1 block text-sm text-[#2a2f4b]">{label}</label>
      <div
        className={`
        flex h-[46px] items-center rounded-md border px-3
        py-2 ${error ? "border-[#D14343]" : "border-[#E0E0E0]"}
        ${
          isFocused
            ? "bg-[#FBFAFC] focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a]"
            : "bg-[#f9f9f9]"
        }
        transition-all duration-200
      `}
      >
        {/* Key Icon on the left side */}
        <div className="mr-2">
          <LockIcon />
        </div>

        <input
          type={isPasswordVisible ? "text" : "password"}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base outline-none"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
        <button type="button" className="ml-2 rounded-full p-1 focus:outline-none" onClick={togglePasswordVisibility}>
          {isPasswordVisible ? <EyesOpenIcon /> : <EyesCloseIcon />}
        </button>
      </div>
    </div>
  )
}
