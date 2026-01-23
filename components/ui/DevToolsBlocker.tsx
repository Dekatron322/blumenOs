"use client"

import { useEffect, useRef, useState } from "react"

interface DevToolsBlockerProps {
  children: React.ReactNode
  enabled?: boolean
}

export default function DevToolsBlocker({ children, enabled = true }: DevToolsBlockerProps) {
  const blockerRef = useRef<HTMLDivElement>(null)
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    // Check if dev mode is enabled in localStorage
    const devModeEnabled = localStorage.getItem("devModeEnabled") === "true"
    setIsDevMode(devModeEnabled)

    // Listen for storage changes (for cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "devModeEnabled") {
        setIsDevMode(e.newValue === "true")
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  useEffect(() => {
    // Only disable if dev mode is explicitly enabled via the dev-mode page
    if (!enabled || isDevMode) return

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Block developer tools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = []
      if (e.metaKey) keys.push("meta")
      if (e.ctrlKey) keys.push("ctrl")
      if (e.altKey) keys.push("alt")
      if (e.shiftKey) keys.push("shift")
      keys.push(e.key.toLowerCase())

      const keyCombo = keys.join("+")

      // Block developer tools combinations
      const devToolsCombos = [
        "f12",
        "ctrl+shift+i",
        "ctrl+shift+j",
        "ctrl+shift+c",
        "meta+alt+i",
        "meta+alt+j",
        "meta+alt+c",
        "ctrl+p",
        "meta+p", // Also block print to prevent inspection via print preview
      ]

      if (devToolsCombos.some((combo) => keyCombo.includes(combo))) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
    }

    // Detect developer tools by checking window dimensions
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold

      if (widthThreshold || heightThreshold) {
        // Clear the page content if dev tools are detected
        if (blockerRef.current) {
          blockerRef.current.style.display = "none"
          document.body.innerHTML =
            '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; font-size: 18px; color: #333;">Developer tools are not allowed on this page.</div>'
        }
      }
    }

    // Prevent copy/paste operations
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Add event listeners with capture phase
    document.addEventListener("contextmenu", handleContextMenu, true)
    document.addEventListener("selectstart", handleSelectStart, true)
    document.addEventListener("dragstart", handleDragStart, true)
    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("copy", handleCopy, true)
    document.addEventListener("paste", handlePaste, true)
    document.addEventListener("cut", handleCut, true)

    // Check for dev tools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000)

    // Add CSS styles to prevent selection and inspection
    const style = document.createElement("style")
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      body {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      @media print {
        body * {
          visibility: hidden !important;
        }
        body:before {
          content: "Printing is disabled on this page" !important;
          visibility: visible !important;
          display: block !important;
          text-align: center !important;
          font-size: 24px !important;
          margin-top: 50px !important;
        }
      }
      
      /* Prevent text selection in all browsers */
      ::selection {
        background: transparent !important;
        color: inherit !important;
      }
      ::-moz-selection {
        background: transparent !important;
        color: inherit !important;
      }
    `
    document.head.appendChild(style)

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true)
      document.removeEventListener("selectstart", handleSelectStart, true)
      document.removeEventListener("dragstart", handleDragStart, true)
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("copy", handleCopy, true)
      document.removeEventListener("paste", handlePaste, true)
      document.removeEventListener("cut", handleCut, true)
      clearInterval(devToolsInterval)
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [enabled, isDevMode])

  return (
    <div ref={blockerRef} className="relative">
      {children}
    </div>
  )
}
