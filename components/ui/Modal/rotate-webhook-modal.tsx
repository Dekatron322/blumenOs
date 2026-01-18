"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { rotateWebhookSecret } from "lib/redux/vendorSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface RotateWebhookModalProps {
  isOpen: boolean
  onRequestClose: () => void
  vendorId: number
  vendorName: string
  onSuccess?: (webhookData: { webhookSecret: string; generatedAtUtc: string }) => void
}

const RotateWebhookModal: React.FC<RotateWebhookModalProps> = ({
  isOpen,
  onRequestClose,
  vendorId,
  vendorName,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSecret, setShowSecret] = React.useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = React.useState(false)
  const [generatedWebhookData, setGeneratedWebhookData] = React.useState<{
    webhookSecret: string
    generatedAtUtc: string
  } | null>(null)

  React.useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setGeneratedWebhookData(null)
      setShowSecret(false)
      setCopiedToClipboard(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleRotateWebhook = async () => {
    try {
      setIsLoading(true)
      console.log("Rotating webhook secret for vendor:", vendorId)

      const result = await dispatch(rotateWebhookSecret(vendorId))
      console.log("Webhook secret rotation result:", result)

      if (rotateWebhookSecret.fulfilled.match(result)) {
        const webhookData = result.payload.data
        console.log("Webhook data received:", webhookData)
        setGeneratedWebhookData(webhookData)
        notify("success", `Webhook secret for ${vendorName} has been rotated successfully`)
        // Don't call onSuccess here - let users see the secret first
        // onSuccess?.(webhookData)
      } else {
        console.error("Webhook secret rotation failed:", result.payload)
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      console.error("Error rotating webhook secret:", error)
      notify("error", error.message || "Failed to rotate webhook secret")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setGeneratedWebhookData(null)
      setShowSecret(false)
      setCopiedToClipboard(false)
      onRequestClose()
      // Call onSuccess only when closing after showing the secret
      if (generatedWebhookData) {
        onSuccess?.(generatedWebhookData)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToClipboard(true)
    notify("success", "Copied to clipboard")
    setTimeout(() => setCopiedToClipboard(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[90vw] max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">
            {generatedWebhookData ? "Webhook Secret Rotated" : "Rotate Webhook Secret"}
          </h2>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col px-6 pb-6 pt-6">
            {!generatedWebhookData ? (
              // Confirmation View
              <>
                <div className="mb-6 flex items-center justify-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-amber-50">
                    <svg className="size-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Rotate Webhook Secret</h3>
                <p className="mb-4 text-center text-gray-600">
                  Are you sure you want to rotate the webhook secret for <strong>{vendorName}</strong>?
                </p>

                <div className="rounded-lg bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="size-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p className="mb-2">
                          Rotating the webhook secret will immediately invalidate the current secret. Any existing
                          integrations using the current secret will stop receiving webhooks.
                        </p>
                        <p>Make sure to update all your integrations with the new secret immediately after rotation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Success View with Webhook Secret Details
              <>
                <div className="mb-6 flex items-center justify-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-green-50">
                    <svg className="size-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">
                  Webhook Secret Rotated Successfully
                </h3>

                {/* Success Message */}
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="size-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">Success!</h4>
                      <p className="text-sm text-green-700">
                        Webhook secret has been rotated successfully. Make sure to copy and store the new secret
                        securely.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">New Webhook Secret</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showSecret ? "text" : "password"}
                        readOnly
                        value={generatedWebhookData.webhookSecret}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 pr-20 font-mono text-sm text-gray-700"
                      />
                      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                        <button
                          onClick={() => setShowSecret(!showSecret)}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title={showSecret ? "Hide secret" : "Show secret"}
                        >
                          {showSecret ? (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(generatedWebhookData.webhookSecret)}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title={copiedToClipboard ? "Copied!" : "Copy to clipboard"}
                        >
                          {copiedToClipboard ? (
                            <svg
                              className="size-4 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    This secret will be used to verify webhook requests from BlumenPay
                  </p>
                </div>

                {/* Generated At */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Generated At</label>
                  <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
                    <p className="text-sm text-gray-700">{formatDate(generatedWebhookData.generatedAtUtc)}</p>
                  </div>
                </div>

                {/* Security Warning */}
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="size-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">Security Alert</h4>
                      <div className="mt-2 text-sm text-red-700">
                        <p className="mb-1">
                          <strong>Store your webhook secret securely!</strong> You won&apos;t be able to see it again
                          after closing this dialog.
                        </p>
                        <p>
                          This secret is used to verify webhook requests. Anyone with this secret can send fake webhooks
                          to your endpoints.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          {!generatedWebhookData ? (
            // Confirmation Buttons
            <>
              <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={handleClose} disabled={isLoading}>
                Cancel
              </ButtonModule>
              <ButtonModule
                variant="primary"
                className="flex-1"
                size="lg"
                onClick={handleRotateWebhook}
                disabled={isLoading}
              >
                {isLoading ? "Rotating..." : "Rotate Secret"}
              </ButtonModule>
            </>
          ) : (
            // Success Buttons
            <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleClose}>
              Done
            </ButtonModule>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default RotateWebhookModal
