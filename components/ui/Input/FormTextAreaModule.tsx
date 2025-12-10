"use client"

import React, { useState } from "react"

interface FormTextAreaModuleProps {
  label: string
  name?: string
  id?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  error?: string | boolean
  required?: boolean
  disabled?: boolean
  rows?: number
}

export const FormTextAreaModule: React.FC<FormTextAreaModuleProps> = ({
  label,
  name,
  id,
  placeholder = "",
  value,
  onChange,
  className = "",
  error,
  required = false,
  disabled = false,
  rows = 3,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={className}>
      <label className="mb-1 block text-sm text-[#2a2f4b]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div
        className={`
          rounded-md border px-3 py-2
          ${error ? "border-[#D14343]" : "border-[#E0E0E0]"}
          ${isFocused ? "bg-[#FBFAFC] ring-2 ring-[#004B23]" : "bg-[#F9F9F9]"}
          ${disabled ? "bg-gray-100" : ""}
          transition-all duration-200
        `}
      >
        <textarea
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          required={required}
          className="w-full resize-none bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-500"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      {typeof error === "string" && error.length > 0 && (
        <p id={`${name}-error`} className="mt-1 text-xs text-[#D14343]">
          {error}
        </p>
      )}
    </div>
  )
}
