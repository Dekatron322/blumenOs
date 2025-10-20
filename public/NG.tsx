import React from "react"

export interface IconProps {
  className?: string
}

const NGIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_52_3968)">
        <path
          d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
          fill="#F0F0F0"
        />
        <path
          d="M-0.000549316 16.0004C-0.000549316 22.8799 4.34145 28.7445 10.4343 31.0052V0.995605C4.34145 3.25623 -0.000549316 9.12098 -0.000549316 16.0004Z"
          fill="#6DA544"
        />
        <path
          d="M31.9999 16.0004C31.9999 9.12098 27.6579 3.25623 21.5651 0.995605V31.0053C27.6579 28.7445 31.9999 22.8799 31.9999 16.0004Z"
          fill="#6DA544"
        />
      </g>
      <defs>
        <clipPath id="clip0_52_3968">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default NGIcon
