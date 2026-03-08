"use client"
import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { RxCaretDown, RxCross2 } from "react-icons/rx"

interface SearchModuleProps {
  value: string

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  onCancel?: () => void

  onSearch?: () => void

  placeholder?: string

  className?: string

  height?: string

  searchType?: string

  onSearchTypeChange?: (type: string) => void

  searchTypeOptions?: {
    value: string
    label: string
  }[]

  bgClassName?: string

  disabled?: boolean

  prominent?: boolean

  prominentLabel?: string

  prominentTitle?: string

  prominentDescription?: string

  prominentClassName?: string
}

export const SearchModule: React.FC<SearchModuleProps> = ({
  value,
  onChange,
  onCancel,
  onSearch,
  placeholder = "Search",
  className = "",
  height = "h-[37px]",
  searchType = "tag",
  onSearchTypeChange,
  searchTypeOptions = [
    { value: "tag", label: "Tag" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
  ],
  bgClassName = "bg-[#f9f9f9]",
  disabled = false,
  prominent = false,
  prominentLabel = "Primary action",
  prominentTitle = "Search Records",
  prominentDescription = "Find records quickly using names, IDs, references, or keywords.",
  prominentClassName = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get the current label for the selected search type
  const currentLabel = searchTypeOptions.find((opt) => opt.value === searchType)?.label || "Tag"

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleOptionClick = (value: string) => {
    if (onSearchTypeChange) {
      onSearchTypeChange(value)
    }
    setIsDropdownOpen(false)
  }

  const resolvedHeight = prominent && height === "h-[37px]" ? "h-14" : height

  const controlSizeClasses = prominent
    ? "w-full max-w-none sm:max-w-none md:w-full md:max-w-none"
    : ""

  const prominentInputClasses = prominent
    ? "rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
    : ""

  const defaultWidthClass = prominent ? "w-full md:w-full" : "md:w-[380px]"

  const searchControl = (
    <div
      className={`flex ${resolvedHeight} items-center justify-between gap-3 rounded-md border px-0 text-[#707070] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] ${defaultWidthClass} ${bgClassName} ${prominentInputClasses} ${className} ${controlSizeClasses}`}
    >
      {/* Search type dropdown */}
      {onSearchTypeChange && (
        <div className="relative h-full" ref={dropdownRef}>
          <button
            type="button"
            className="flex h-full items-center justify-between rounded-l-md border-r bg-gray-50 px-3 text-sm outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{currentLabel}</span>
            <RxCaretDown className={`ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown popover */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border shadow-lg">
              {searchTypeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-50 ${
                    searchType === option.value ? "bg-gray-100 font-medium" : ""
                  }`}
                  onClick={() => handleOptionClick(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search input */}
      <div className="flex flex-1 items-center gap-2 px-3">
        <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
        <input
          type="text"
          id="search"
          placeholder={placeholder}
          className="h-[50px] w-full bg-transparent outline-none disabled:opacity-50"
          value={value}
          onChange={onChange}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearch && !disabled) {
              onSearch()
            }
          }}
        />
        {value && onCancel && (
          <RxCross2
            onClick={disabled ? undefined : onCancel}
            style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
          />
        )}
        <button
          type="button"
          onClick={disabled ? undefined : onSearch}
          disabled={disabled}
          className="rounded bg-[#004B23] px-3 py-1 text-xs text-white transition-colors hover:bg-[#003d1c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Search
        </button>
      </div>
    </div>
  )

  if (!prominent) {
    return searchControl
  }

  return (
    <div
      className={`w-full basis-full rounded-xl border border-gray-200 bg-gradient-to-r from-green-50/60 to-white p-4 shadow-sm ${prominentClassName}`}
    >
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">{prominentLabel}</p>
        <h3 className="text-base font-semibold text-gray-900">{prominentTitle}</h3>
        <p className="text-xs text-gray-600 sm:text-sm">{prominentDescription}</p>
      </div>
      <div className="w-full [&>div]:w-full [&>div]:max-w-none [&>div]:md:w-full">{searchControl}</div>
    </div>
  )
}
