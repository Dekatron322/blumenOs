"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch } from "react-redux"
import { AppDispatch } from "lib/redux/store"
import { addReceiptToCashRemittance } from "lib/redux/cashRemittanceSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { CloudArrowUpIcon } from "@heroicons/react/24/outline"
import type { CashRemittanceRecord } from "lib/redux/cashRemittanceSlice"

interface ReceiptUploadModalProps {
  isOpen: boolean
  onRequestClose: () => void
  record: CashRemittanceRecord | null
}

const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({ isOpen, onRequestClose, record }) => {
  const dispatch = useDispatch<AppDispatch>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    tellerNumber: "",
    tellerUrl: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (allow images and PDFs)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        setError("Please select a valid image (JPEG, PNG, WebP) or PDF file")
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)
      setError("")

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl("")
      }

      // In a real implementation, you would upload the file to a storage service
      // and get the URL. For now, we'll simulate this with a placeholder
      setFormData((prev) => ({
        ...prev,
        tellerUrl: `https://storage.example.com/receipts/${file.name}`,
      }))
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setFormData((prev) => ({
      ...prev,
      tellerUrl: "",
    }))
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!record) {
      setError("No record selected")
      return
    }

    if (!selectedFile) {
      setError("Please select a receipt file")
      return
    }

    if (!formData.tellerNumber.trim()) {
      setError("Please enter a teller number")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await dispatch(
        addReceiptToCashRemittance({
          id: record.id,
          receiptData: {
            tellerNumber: formData.tellerNumber.trim(),
            tellerUrl: formData.tellerUrl,
          },
        })
      ).unwrap()

      // Reset form and close modal
      setFormData({
        tellerNumber: "",
        tellerUrl: "",
      })
      setSelectedFile(null)
      setPreviewUrl("")
      setError("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      onRequestClose()
    } catch (error: any) {
      console.error("Failed to upload receipt:", error)
      setError(error?.message || "Failed to upload receipt. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form on close
      setFormData({
        tellerNumber: "",
        tellerUrl: "",
      })
      setSelectedFile(null)
      setPreviewUrl("")
      setError("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      onRequestClose()
    }
  }

  if (!isOpen) return null

  return (
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
        className="relative w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 md:text-xl">Upload Payment Receipt</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="size-4 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {record ? (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Record Information */}
              <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 md:text-sm">Amount:</span>
                    <span className="text-xs font-semibold text-gray-900 md:text-sm">
                      ₦{record.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 md:text-sm">Collection Officer:</span>
                    <span className="text-xs font-semibold text-gray-900 md:text-sm">
                      {record.collectionOfficer.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 md:text-sm">Collection Date:</span>
                    <span className="text-xs font-semibold text-gray-900 md:text-sm">
                      {new Date(record.startDateUtc).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-file"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="receipt-file"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100"
                >
                  <CloudArrowUpIcon className="mb-2 h-8 w-8 text-gray-400" />
                  <span className="text-center text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : "Click to upload receipt"}
                  </span>
                  <span className="mt-1 text-center text-xs text-gray-500">JPEG, PNG, WebP or PDF (max 5MB)</span>
                </label>
              </div>

              {/* File Preview */}
              {previewUrl && (
                <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img src={previewUrl} alt="Receipt preview" className="h-48 w-full object-contain" />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Teller Number */}
              <FormInputModule
                label="Teller Number"
                type="text"
                name="tellerNumber"
                id="tellerNumber"
                value={formData.tellerNumber}
                onChange={handleInputChange}
                placeholder="Enter teller number"
                required={true}
                disabled={isSubmitting}
                error={error && !formData.tellerNumber.trim() ? "Teller number is required" : undefined}
              />

              {/* Error Display */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex">
                    <svg className="mr-2 size-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="flex items-center justify-center p-6 md:p-8">
              <div className="text-center">
                <div className="mb-2 text-base text-red-500 md:text-lg">No record selected</div>
                <p className="text-xs text-gray-600 md:text-sm">Please select a record to upload receipt</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-4 md:p-6">
          <ButtonModule
            type="button"
            variant="secondary"
            className="flex w-full"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            type="button"
            variant="primary"
            className="flex w-full"
            size="md"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isSubmitting || !selectedFile || !record}
          >
            {isSubmitting ? "Uploading..." : "Upload Receipt"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ReceiptUploadModal
