"use client"
import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

interface FormSelectModuleProps {
  label?: string
  name: string
  value: string | number
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ value: string | number; label: string }>
  required?: boolean
  disabled?: boolean
  className?: string
  error?: string | boolean
  // Optional extra classes for the clickable control (height, padding, etc.)
  controlClassName?: string
}

export const FormSelectModule: React.FC<FormSelectModuleProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = "",
  error,
  controlClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => String(option.value) === String(value))

  const filteredOptions = options.filter((option) =>
    String(option.label).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (value: string | number) => {
    const syntheticEvent = {
      target: {
        name,
        value,
        type: "select-one",
      },
    } as unknown as ChangeEvent<HTMLSelectElement>

    onChange(syntheticEvent)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
      setSearchTerm("")
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="mb-1 block text-sm text-[#2a2f4b]">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`
          flex cursor-pointer items-center justify-between rounded-md border px-3
          py-2 ${error ? "border-[#D14343]" : "border-[#E0E0E0]"}
          ${isFocused ? "bg-[#F0fdf4] ring-2 ring-[#f58634]" : "bg-[#F9F9F9]"}
          ${disabled ? "cursor-not-allowed bg-[#a0a0a0]" : ""}
          transition-all duration-200 ${controlClassName ?? "h-[46px]"}
        `}
        onClick={() => {
          if (disabled) return
          setIsOpen((prev) => {
            const next = !prev
            if (!next) {
              setSearchTerm("")
            }
            return next
          })
        }}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => !disabled && setIsFocused(false)}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${name}-options`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <span className="text-base">{selectedOption?.label || "Select an option"}</span>
        <ChevronDown
          className={`size-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div
          id={`${name}-options`}
          className="absolute z-10 mt-1 w-full rounded-md border border-[#E0E0E0] bg-white shadow-lg"
        >
          <div className="border-b border-[#E0E0E0] px-3 py-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="h-8 w-full rounded border border-[#E0E0E0] bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B23]"
            />
          </div>
          <div className="max-h-60 overflow-auto py-1">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-3 py-2 text-base hover:bg-[#F0fdf4] ${
                  String(value) === String(option.value) ? "bg-[#F0fdf4] text-[#004B23]" : ""
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={String(value) === String(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {typeof error === "string" && error.length > 0 && (
        <p id={`${name}-error`} className="mt-1 text-xs text-[#D14343]">
          {error}
        </p>
      )}
    </div>
  )
}
