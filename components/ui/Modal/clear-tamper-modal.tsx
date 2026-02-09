"use client"

import React, { useEffect, useRef, useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { AlertTriangle, Check, Copy, RotateCcw } from "lucide-react"
import { notify } from "../Notification/Notification"

interface ClearTamperModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: () => Promise<void>
  onReset?: () => void
  loading: boolean
  meterId: number
  successMessage?: string
  errorMessage?: string
  tokenData?: string | null
  preventAutoClose?: boolean
}

const ClearTamperModal: React.FC<ClearTamperModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  onReset,
  loading,
  meterId,
  successMessage,
  errorMessage,
  tokenData,
  preventAutoClose = true,
}) => {
  const [copied, setCopied] = useState(false)
  const [showSuccessState, setShowSuccessState] = useState(false)
  const [currentToken, setCurrentToken] = useState<{ tokenDec: string; tokenHex: string } | null>(null)
  const hasShownSuccessRef = useRef(false)

  // Reset all state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      setShowSuccessState(false)
      setCopied(false)
      setCurrentToken(null)
      hasShownSuccessRef.current = false
    } else {
      // Reset when modal opens (fresh start)
      setShowSuccessState(false)
      setCurrentToken(null)
      hasShownSuccessRef.current = false
    }
  }, [isOpen])

  // Handle showing success when we have token data and success message
  useEffect(() => {
    if (isOpen && successMessage && !errorMessage && !loading && tokenData) {
      const extractedToken = extractTokenFromResponse(tokenData)
      if (extractedToken && !hasShownSuccessRef.current) {
        setCurrentToken(extractedToken)
        setShowSuccessState(true)
        hasShownSuccessRef.current = true

        // Show notification
        notify("success", "Tamper cleared successfully", {
          title: successMessage,
          duration: 4000,
        })
      }
    } else if (isOpen && errorMessage) {
      setShowSuccessState(false)
      hasShownSuccessRef.current = false

      // Show error notification
      notify("error", "Failed to clear tamper", {
        title: errorMessage,
        duration: 5000,
      })
    }
  }, [isOpen, successMessage, errorMessage, loading, tokenData])

  const handleConfirm = async () => {
    try {
      // Reset success state before starting new operation
      setShowSuccessState(false)
      setCopied(false)
      setCurrentToken(null)
      hasShownSuccessRef.current = false

      await onConfirm()
      // Don't close modal automatically - let user see the token and copy it
    } catch (error) {
      // Error handling is done by the parent component
    }
  }

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      notify("success", "Token copied to clipboard")
    } catch (error) {
      notify("error", "Failed to copy token")
    }
  }

  const formatToken = (token: string) => {
    if (token.length >= 16) {
      return token.match(/.{1,4}/g)?.join("-") || token
    }
    return token
  }

  const extractTokenFromResponse = (response: string) => {
    try {
      const parsed = JSON.parse(response) as any

      // Handle the actual API response structure: data.data.result[0].tokenDec and tokenHex
      if (parsed.data?.data?.result && Array.isArray(parsed.data.data.result) && parsed.data.data.result.length > 0) {
        const result = parsed.data.data.result[0]
        return {
          tokenDec: result?.tokenDec,
          tokenHex: result?.tokenHex,
        }
      }

      // Fallback to direct result array
      if (parsed.result && Array.isArray(parsed.result) && parsed.result.length > 0) {
        const result = parsed.result[0]
        return {
          tokenDec: result?.tokenDec,
          tokenHex: result?.tokenHex,
        }
      }

      // Fallback to tokens array
      if (parsed.tokens && Array.isArray(parsed.tokens) && parsed.tokens.length > 0) {
        const result = parsed.tokens[0]
        return {
          tokenDec: result?.tokenDec,
          tokenHex: result?.tokenHex,
        }
      }

      return null
    } catch {
      return null
    }
  }

  const handleRefresh = () => {
    // Reset all state
    setShowSuccessState(false)
    setCopied(false)
    setCurrentToken(null)
    hasShownSuccessRef.current = false

    // Call parent reset function if provided
    if (onReset) {
      onReset()
    }
  }

  const handleClose = () => {
    // Reset all state when closing
    setShowSuccessState(false)
    setCopied(false)
    setCurrentToken(null)
    hasShownSuccessRef.current = false

    onRequestClose()
  }

  // Determine if we should show success state
  const shouldShowSuccess = showSuccessState && successMessage && !errorMessage && currentToken

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      shouldCloseOnOverlayClick={!shouldShowSuccess} // Prevent closing on overlay click when successful
      shouldCloseOnEsc={!shouldShowSuccess} // Prevent closing on ESC when successful
      className="z-[999] mt-20 w-[400px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 z-[998] bg-black bg-opacity-50 backdrop-blur-sm overflow-hidden flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-4">
        <h2 className="text-lg font-bold">Clear Tamper</h2>
        <div
          onClick={handleClose}
          className={`${shouldShowSuccess ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          <CloseIcon />
        </div>
      </div>
      <div className="px-4 pb-6">
        {!shouldShowSuccess && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="size-6 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Confirm Tamper Clear</p>
                <p className="text-sm text-gray-600">
                  Are you sure you want to clear the tamper status for Meter ID: <strong>#{meterId}</strong>?
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-md bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                <strong>Warning:</strong> This action will clear the tamper flag on the meter and cannot be undone.
                Please ensure this action is authorized and necessary.
              </p>
            </div>

            {errorMessage && !loading && (
              <div className="mb-4 rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}
          </>
        )}

        {shouldShowSuccess && (
          <div className="my-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
                <Check className="size-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Tamper Cleared Successfully</p>
                <p className="text-sm text-gray-600">
                  Tamper status has been cleared for Meter ID: <strong>#{meterId}</strong>
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-800">{successMessage}</p>
              {currentToken && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium text-green-700">Clear Token (Decimal):</p>
                  <div className="mb-3 flex items-center justify-between rounded border border-green-200 bg-green-50/50 p-2">
                    <span className="font-mono text-sm font-bold text-green-800">
                      {formatToken(currentToken.tokenDec)}
                    </span>
                    <ButtonModule
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToken(formatToken(currentToken.tokenDec))}
                      className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-100"
                    >
                      <Copy className="size-3" />
                      {copied ? "Copied!" : "Copy"}
                    </ButtonModule>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!shouldShowSuccess && (
          <div className="flex gap-3">
            <ButtonModule variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
              Cancel
            </ButtonModule>
            <ButtonModule onClick={handleConfirm} disabled={loading} loading={loading} className="flex-1">
              Clear Tamper
            </ButtonModule>
          </div>
        )}

        {shouldShowSuccess && (
          <div className="flex gap-3">
            <ButtonModule variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
              <RotateCcw className="size-4" />
              Clear Another
            </ButtonModule>
            <ButtonModule onClick={handleClose} className="flex-1">
              Done
            </ButtonModule>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ClearTamperModal
