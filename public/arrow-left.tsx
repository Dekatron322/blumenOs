// OtechPlusIcon.tsx
import React from "react"

export interface IconProps {
  className?: string
}

const ArrowLeftIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.0003 11.8332L2.66699 8.49981L6.00033 5.1665"
        stroke="#003f9f"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M2.66699 8.5H13.3337" stroke="#003f9f" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export default ArrowLeftIcon
