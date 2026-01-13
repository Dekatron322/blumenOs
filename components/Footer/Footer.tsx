"use client"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"
import { FiSun } from "react-icons/fi"
import { IoMoonOutline } from "react-icons/io5"

const Footer = () => {
  const [isMoonIcon, setIsMoonIcon] = useState(true)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const toggleIcon = () => {
    setIsMoonIcon(!isMoonIcon)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  return (
    <div className="w-full bg-[#f9f9f9] px-7 py-4 max-sm:bottom-0 max-sm:right-0">
      <p className="text-center text-[#000000]">Powered by BlumenTech @2026 All Rights Reserved </p>
    </div>
  )
}

export default Footer
function setMounted(arg0: boolean) {
  throw new Error("Function not implemented.")
}
