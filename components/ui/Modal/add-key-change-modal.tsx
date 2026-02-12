"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch } from "lib/redux/store"
import { addKeyChange, clearAddKeyChange } from "lib/redux/metersSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import type { AddKeyChangeRequest } from "lib/redux/metersSlice"
import { Check, Copy, Key } from "lucide-react"

interface AddKeyChangeModalProps {
  isOpen: boolean
  onRequestClose: () => void
  meterId: number
  onSuccess: () => void
}

const AddKeyChangeModal: React.FC<AddKeyChangeModalProps> = ({ isOpen, onRequestClose, meterId, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { addKeyChangeData, addKeyChangeLoading, addKeyChangeError } = useSelector(
    (state: { meters: any }) => state.meters
  )

  // Form state
  const [formData, setFormData] = useState<AddKeyChangeRequest>({
    toSgc: 0,
    toKrn: 0,
    toTi: 0,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = parseInt(value) || 0
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await dispatch(addKeyChange({ id: meterId, requestData: formData })).unwrap()

      // Reset form
      setFormData({ toSgc: 0, toKrn: 0, toTi: 0 })
      setShowResultModal(true)
    } catch (error) {
      console.error("Failed to add key change:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form and clear Redux state
      setFormData({ toSgc: 0, toKrn: 0, toTi: 0 })
      dispatch(clearAddKeyChange())
      setShowResultModal(false)
      onRequestClose()
    }
  }

  const formatTokenDisplay = (tokenDec: string) => {
    // Remove any existing formatting and add hyphens every 4 digits
    const cleanToken = tokenDec.replace(/\D/g, "") // Remove non-digits
    return cleanToken.match(/.{1,4}/g)?.join("-") || tokenDec
  }

  const handleCopyToken = async (tokenDec: string) => {
    try {
      await navigator.clipboard.writeText(tokenDec)
      setCopiedToken(tokenDec)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (error) {
      console.error("Failed to copy token:", error)
    }
  }

  const handleCloseResultModal = () => {
    setShowResultModal(false)
    onSuccess()
    dispatch(clearAddKeyChange())
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                    <Key className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 md:text-xl">Add Key Change</h2>
                    <p className="text-sm text-gray-500">Generate new tokens for meter key change</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="group flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <svg
                    className="size-4 transition-transform group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[calc(100vh-200px)] w-full overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-4 md:p-6">
                  {/* Form Description */}
                  <div className="mb-6 rounded-lg bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                        <Key className="size-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-900">Key Change Parameters</h3>
                        <p className="mt-1 text-sm text-blue-700">
                          Enter the security parameters to generate new tokens for the meter key change. These values
                          determine the cryptographic characteristics of the generated tokens.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* To SGC */}
                      <div>
                        <FormInputModule
                          type="number"
                          id="toSgc"
                          name="toSgc"
                          value={formData.toSgc}
                          onChange={handleInputChange}
                          required
                          placeholder="0"
                          disabled={isSubmitting}
                          label="To SGC"
                          min="0"
                        />
                      </div>

                      {/* To KRN */}
                      <div>
                        <FormInputModule
                          type="number"
                          id="toKrn"
                          name="toKrn"
                          value={formData.toKrn}
                          onChange={handleInputChange}
                          required
                          placeholder="0"
                          disabled={isSubmitting}
                          label="To KRN"
                          min="0"
                        />
                      </div>

                      {/* To TI */}
                      <div>
                        <FormInputModule
                          type="number"
                          id="toTi"
                          name="toTi"
                          value={formData.toTi}
                          onChange={handleInputChange}
                          required
                          placeholder="0"
                          disabled={isSubmitting}
                          label="To TI"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <ButtonModule
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      type="submit"
                      disabled={isSubmitting}
                      variant="primary"
                      size="sm"
                      loading={isSubmitting}
                    >
                      {isSubmitting ? "Generating..." : "Generate Tokens"}
                    </ButtonModule>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {showResultModal && addKeyChangeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-4"
            onClick={handleCloseResultModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex w-full items-center justify-between bg-green-50 p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                    <Key className="size-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 md:text-xl">Key Change Successful</h2>
                    <p className="text-sm text-gray-500">Generated tokens for meter key change</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseResultModal}
                  className="group flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <svg
                    className="size-4 transition-transform group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[calc(100vh-200px)] w-full overflow-y-auto p-4 md:p-6">
                {/* Success Message */}
                <div className="mb-6 rounded-lg bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
                      <svg className="size-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-900">Key Change Completed</h3>
                      <p className="mt-1 text-sm text-green-700">
                        Successfully generated {addKeyChangeData.result?.length || 0} tokens for the meter key change.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tokens Display */}
                {addKeyChangeData.result && addKeyChangeData.result.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-gray-900">Generated Tokens</h4>
                    {addKeyChangeData.result.map((token: any, index: number) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {token.description}
                              </span>
                              <span className="text-xs text-gray-500">Token {index + 1}</span>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <label className="text-xs font-medium text-gray-500">Token Decimal</label>
                                <div className="mt-1 flex items-center gap-2">
                                  <code className="flex-1 rounded border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900">
                                    {formatTokenDisplay(token.tokenDec)}
                                  </code>
                                  <button
                                    onClick={() => handleCopyToken(token.tokenDec)}
                                    className="flex size-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-400 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600"
                                    title="Copy token"
                                  >
                                    {copiedToken === token.tokenDec ? (
                                      <Check className="size-4 text-green-600" />
                                    ) : (
                                      <Copy className="size-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  <ButtonModule onClick={handleCloseResultModal} variant="primary" size="sm">
                    Done
                  </ButtonModule>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AddKeyChangeModal
