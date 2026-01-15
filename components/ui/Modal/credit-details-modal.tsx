"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Check, Copy } from "lucide-react"
import { ButtonModule } from "../Button/Button"
import type { PrepaidCreditHistoryEntry } from "lib/redux/metersSlice"

interface CreditDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  selectedEvent: PrepaidCreditHistoryEntry | null
  formatDateTime: (dateString: string) => string
}

const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({
  isOpen,
  onRequestClose,
  selectedEvent,
  formatDateTime,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy token:", error)
    }
  }

  if (!selectedEvent) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl lg:w-[50vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 md:text-xl">Credit Transaction Details</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg className="size-4 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-3">
            {/* <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-medium">#{selectedEvent.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Meter ID:</span>
              <span className="font-medium">{selectedEvent.meterId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-medium">{selectedEvent.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User Account ID:</span>
              <span className="font-medium">{selectedEvent.userAccountId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Agent ID:</span>
              <span className="font-medium">{selectedEvent.agentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vendor ID:</span>
              <span className="font-medium">{selectedEvent.vendorId}</span>
            </div> */}
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${selectedEvent.isSuccessful ? "text-green-600" : "text-red-600"}`}>
                {selectedEvent.isSuccessful ? "Successful" : "Failed"}
              </span>
            </div>
            {selectedEvent.errorCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Error Code:</span>
                <span className="font-medium text-red-600">{selectedEvent.errorCode}</span>
              </div>
            )}
            {selectedEvent.errorMessage && (
              <div className="flex justify-between">
                <span className="text-gray-600">Error Message:</span>
                <span className="font-medium text-red-600">{selectedEvent.errorMessage}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Requested At:</span>
              <span className="font-medium">{formatDateTime(selectedEvent.requestedAtUtc)}</span>
            </div>
            {/* {selectedEvent.requestPayload && (
              <div>
                <span className="text-gray-600">Request Payload:</span>
                <div className="mt-1 break-all rounded bg-gray-100 p-2 font-mono text-xs">
                  {selectedEvent.requestPayload}
                </div>
              </div>
            )} */}
            {selectedEvent.responsePayload && (
              <div>
                <span className="text-gray-600">Token:</span>
                <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg font-bold tracking-wider text-gray-800">
                      {(() => {
                        try {
                          const parsed = JSON.parse(selectedEvent.responsePayload) as {
                            result?: Array<{ tokenDec?: string }>
                          }
                          const tokenDec = parsed.result?.[0]?.tokenDec
                          if (tokenDec && tokenDec.length >= 16) {
                            // Format as 4 groups of 4 characters: 0000-0000-0000-0000
                            return tokenDec.match(/.{1,4}/g)?.join("-") || tokenDec
                          }
                          return tokenDec || selectedEvent.responsePayload
                        } catch {
                          return selectedEvent.responsePayload
                        }
                      })()}
                    </div>
                    <ButtonModule
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(selectedEvent.responsePayload) as {
                            result?: Array<{ tokenDec?: string }>
                          }
                          const tokenDec = parsed.result?.[0]?.tokenDec
                          const tokenToCopy =
                            tokenDec && tokenDec.length >= 16
                              ? tokenDec.match(/.{1,4}/g)?.join("-") || tokenDec
                              : tokenDec || selectedEvent.responsePayload
                          handleCopyToken(tokenToCopy)
                        } catch {
                          handleCopyToken(selectedEvent.responsePayload)
                        }
                      }}
                      className="flex items-center gap-1"
                    >
                      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </ButtonModule>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-[#F9F9F9] p-4 md:px-6">
          <ButtonModule variant="outline" className="w-full" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CreditDetailsModal
