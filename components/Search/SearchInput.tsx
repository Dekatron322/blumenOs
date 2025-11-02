import React from "react"

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex h-10 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-2 focus-within:border-[#0a0a0a] focus-within:ring-1 focus-within:ring-[#0a0a0a]">
        <svg
          className="mr-2 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="h-full w-full bg-transparent outline-none focus:outline-none"
        />
      </div>
    </div>
  )
}

export default SearchInput
