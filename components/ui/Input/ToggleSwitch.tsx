"use client"

import React from "react"

interface ToggleSwitchProps {
  label: string
  name?: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  name,
  checked,
  onChange,
  className = "",
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  return (
    <div className={`${className}`}>
      <label className="mb-1 block text-sm text-[#2a2f4b]">{label}</label>
      <button
        type="button"
        name={name}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
          ${checked ? "bg-blue-600" : "bg-gray-300"}
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  )
}
