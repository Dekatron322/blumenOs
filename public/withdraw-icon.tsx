// WithdrawIcon.tsx
import React from "react"

export interface IconProps {
  className?: string
}

const WithdrawIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg
      width="27"
      height="26"
      viewBox="0 0 27 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="0.199951" width="26" height="26" rx="13" fill="#FDE3E3" />
      <path
        d="M17.7524 11.1775L13.1999 6.625L8.64745 11.1775"
        stroke="#F14848"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.2 19.3745V6.75195"
        stroke="#F14848"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default WithdrawIcon
