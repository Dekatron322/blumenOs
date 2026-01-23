"use client"

import { useEffect, useRef, useState } from "react"

interface DevToolsBlockerProps {
  children: React.ReactNode
  enabled?: boolean
}

export default function DevToolsBlocker({ children, enabled = true }: DevToolsBlockerProps) {
  const blockerRef = useRef<HTMLDivElement>(null)
  // Dev mode is permanently enabled - no need to check localStorage
  const isDevMode = true

  useEffect(() => {
    // Dev mode is permanently enabled - don't apply any restrictions
    // Early return to prevent all blocking functionality
    return

    // The following code will never execute due to the early return above
    // This ensures all developer features are permanently enabled

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

    // Allow copy/paste operations - no longer blocking these
    // const handleCopy = (e: ClipboardEvent) => {
    //   e.preventDefault()
    //   e.stopPropagation()
    //   return false
    // }

    // const handlePaste = (e: ClipboardEvent) => {
    //   e.preventDefault()
    //   e.stopPropagation()
    //   return false
    // }

    // const handleCut = (e: ClipboardEvent) => {
    //   e.preventDefault()
    //   e.stopPropagation()
    //   return false
    // }

    // Add event listeners with capture phase
    document.addEventListener("contextmenu", handleContextMenu, true)
    document.addEventListener("selectstart", handleSelectStart, true)
    document.addEventListener("dragstart", handleDragStart, true)
    document.addEventListener("keydown", handleKeyDown, true)
    // Copy/paste events no longer blocked
    // document.addEventListener("copy", handleCopy, true)
    // document.addEventListener("paste", handlePaste, true)
    // document.addEventListener("cut", handleCut, true)

    // Check for dev tools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000)

    // Add CSS styles to prevent selection and inspection
    const style = document.createElement("style")
    style.textContent = `
      /* Allow text selection and user interactions */
      * {
        -webkit-user-select: auto !important;
        -moz-user-select: auto !important;
        -ms-user-select: auto !important;
        user-select: auto !important;
        -webkit-touch-callout: auto !important;
        -webkit-tap-highlight-color: auto !important;
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
      // Copy/paste events no longer blocked, so no need to remove them
      // document.removeEventListener("copy", handleCopy, true)
      // document.removeEventListener("paste", handlePaste, true)
      // document.removeEventListener("cut", handleCut, true)
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
