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
  // Search functionality props
  searchable?: boolean
  searchTerm?: string
  onSearchChange?: (searchTerm: string) => void
  onSearchClick?: () => void
  // Loading state for search operations
  loading?: boolean
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
  searchable = false,
  searchTerm = "",
  onSearchChange,
  onSearchClick,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedOption = options?.find((option) => String(option.value) === String(value))

  // Use external search term if searchable, otherwise use local search
  const effectiveSearchTerm = searchable ? searchTerm : localSearchTerm

  // Don't filter options when searchable - only show all options
  const displayOptions = searchable
    ? options
    : options?.filter((option) => String(option.label).toLowerCase().includes(effectiveSearchTerm.toLowerCase())) || []

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
    // Don't clear search on selection for searchable components with external search
    if (!searchable || !onSearchChange) {
      setLocalSearchTerm("")
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    // Don't close if loading, search is active, or if click is within dropdown
    if (loading || isSearchActive) {
      return
    }
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
      setIsSearchActive(false)
      // Don't clear search on close for searchable components with external search
      if (!searchable || !onSearchChange) {
        setLocalSearchTerm("")
      }
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [loading, isSearchActive, searchable, onSearchChange])

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
            // Don't clear search on close for searchable components with external search
            if (!next && (!searchable || !onSearchChange)) {
              setLocalSearchTerm("")
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
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <div className="border-b border-[#E0E0E0] px-3 py-2" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex gap-2">
              <input
                type="text"
                value={effectiveSearchTerm}
                onChange={(e) => {
                  e.stopPropagation()
                  const newSearchTerm = e.target.value
                  if (searchable && onSearchChange) {
                    onSearchChange(newSearchTerm)
                  } else {
                    setLocalSearchTerm(newSearchTerm)
                  }
                }}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  // Prevent dropdown from closing on Enter key and trigger search
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (onSearchClick) {
                      onSearchClick()
                    } else {
                      onSearchChange?.(effectiveSearchTerm)
                    }
                  }
                }}
                onFocus={(e) => {
                  e.stopPropagation()
                  setIsSearchActive(true)
                }}
                onBlur={(e) => {
                  e.stopPropagation()
                  // Don't immediately set search active to false on blur
                  // This allows the search button click to work
                  setTimeout(() => setIsSearchActive(false), 100)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                onMouseUp={(e) => {
                  e.stopPropagation()
                }}
                placeholder="Search by ID, code, or name..."
                className="h-8 flex-1 rounded border border-[#E0E0E0] bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B23]"
                autoFocus
              />
              {searchable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    // Prevent dropdown from closing
                    if (onSearchClick) {
                      onSearchClick()
                    } else {
                      onSearchChange?.(effectiveSearchTerm)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  className="h-8 rounded bg-[#004B23] px-3 text-xs font-medium text-white hover:bg-[#003819] focus:outline-none focus:ring-2 focus:ring-[#004B23]"
                >
                  Search
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#004B23]"></div>
                  Searching...
                </div>
              </div>
            ) : (
              displayOptions.map((option) => (
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
              ))
            )}
            {!loading && displayOptions.length === 0 && effectiveSearchTerm && (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                No results found for &quot;{effectiveSearchTerm}&quot;
              </div>
            )}
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
