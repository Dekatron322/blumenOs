// FormInputModule.tsx
"use client"
import React, { useState } from "react"

interface FormInputProps {
  label: string
  type: string
  name?: string
  id?: string
  placeholder: string
  value: string | number | any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  error?: string | boolean
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const FormInputModule: React.FC<FormInputProps> = ({
  label,
  type,
  placeholder,
  value,
  name,
  id,
  onChange,
  className = "",
  error,
  required = false,
  disabled = false,
  min,
  max,
  step,
  prefix,
  suffix,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`${className}`}>
      <label className="mb-1 block text-sm text-[#2a2f4b]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div
        className={`
        flex h-[46px] items-center rounded-md border px-3
        py-2 ${error ? "border-[#D14343]" : "border-[#E0E0E0]"}
        ${isFocused ? "bg-[#FBFAFC] ring-2 ring-[#004B23]" : "bg-[#F9F9F9]"}
        ${disabled ? "bg-gray-100" : ""}
        transition-all duration-200
      `}
      >
        {prefix && <span className="mr-2 text-sm text-gray-500">{prefix}</span>}
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent text-base outline-none disabled:cursor-not-allowed disabled:text-gray-500"
          value={value}
          name={name}
          id={id}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {suffix && <span className="ml-2">{suffix}</span>}
      </div>
      {typeof error === "string" && error.length > 0 && (
        <p id={`${name}-error`} className="mt-1 text-xs text-[#D14343]">
          {error}
        </p>
      )}
    </div>
  )
}
