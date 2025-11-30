"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { generateApiKey } from "lib/redux/vendorSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface GenerateApiKeyModalProps {
  isOpen: boolean
  onRequestClose: () => void
  vendorId: number
  vendorName: string
  onSuccess?: (apiKeyData: { publicKey: string; secretKey: string; issuedAt: string }) => void
}

const GenerateApiKeyModal: React.FC<GenerateApiKeyModalProps> = ({
  isOpen,
  onRequestClose,
  vendorId,
  vendorName,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSecretKey, setShowSecretKey] = React.useState(false)
  const [generatedKeyData, setGeneratedKeyData] = React.useState<{
    publicKey: string
    secretKey: string
    issuedAt: string
  } | null>(null)

  React.useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setGeneratedKeyData(null)
      setShowSecretKey(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleGenerateApiKey = async () => {
    try {
      setIsLoading(true)

      const result = await dispatch(generateApiKey(vendorId))

      if (generateApiKey.fulfilled.match(result)) {
        const apiKeyData = result.payload.data
        setGeneratedKeyData(apiKeyData)
        notify("success", `API key for ${vendorName} has been generated successfully`)
        onSuccess?.(apiKeyData)
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to generate API key")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setGeneratedKeyData(null)
    setShowSecretKey(false)
    onRequestClose()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    notify("success", "Copied to clipboard!")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
            {generatedKeyData ? "API Key Generated" : "Generate API Key"}
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
            {!generatedKeyData ? (
              // Confirmation View
              <>
                <div className="mb-6 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                    <svg className="size-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Generate New API Key</h3>
                <p className="mb-4 text-center text-gray-600">
                  Are you sure you want to generate a new API key for <strong>{vendorName}</strong>?
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
                          Generating a new API key will immediately invalidate the previous key. Any applications using
                          the old key will stop working.
                        </p>
                        <p>Make sure to update all your applications with the new key immediately after generation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Success View with API Key Details
              <>
                <div className="mb-6 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
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

                <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">API Key Generated Successfully</h3>

                {/* Public Key */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Public Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedKeyData.publicKey}
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedKeyData.publicKey)}
                      className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Secret Key */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Secret Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showSecretKey ? "text" : "password"}
                      readOnly
                      value={generatedKeyData.secretKey}
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        {showSecretKey ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => copyToClipboard(generatedKeyData.secretKey)}
                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Issued At */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Issued At</label>
                  <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
                    <p className="text-sm text-gray-700">{formatDate(generatedKeyData.issuedAt)}</p>
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
                          <strong>Store your secret key securely!</strong> You won't be able to see it again after
                          closing this dialog.
                        </p>
                        <p>Anyone with this secret key can make API requests on behalf of your vendor account.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          {!generatedKeyData ? (
            // Confirmation Buttons
            <>
              <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={handleClose} disabled={isLoading}>
                Cancel
              </ButtonModule>
              <ButtonModule
                variant="primary"
                className="flex-1"
                size="lg"
                onClick={handleGenerateApiKey}
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate API Key"}
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

export default GenerateApiKeyModal
