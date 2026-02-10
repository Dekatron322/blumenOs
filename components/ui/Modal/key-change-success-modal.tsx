"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, Copy, Key } from "lucide-react"
import type { Token, TokenData } from "lib/redux/metersSlice"

interface KeyChangeSuccessModalProps {
  isOpen: boolean
  onRequestClose: () => void
  tokenData: TokenData | null
}

const KeyChangeSuccessModal: React.FC<KeyChangeSuccessModalProps> = ({ isOpen, onRequestClose, tokenData }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!isOpen || !tokenData) return null

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex w-full items-center justify-between bg-green-50 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="size-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 md:text-xl">Key Change Successful!</h2>
                  <p className="text-sm text-green-600">Tokens have been generated successfully</p>
                </div>
              </div>
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

            {/* Content */}
            <div className="max-h-[calc(100vh-200px)] w-full overflow-y-auto p-4 md:p-6">
              {/* Advice Section */}
              {tokenData.advice && (
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-900">
                    <Key className="size-4" />
                    Key Change Advice
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-800 md:grid-cols-4">
                    <div className="flex justify-between">
                      <span className="font-medium">ID Record:</span>
                      <span className="font-mono">{tokenData.advice?.idRecord || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Rollover:</span>
                      <span>{tokenData.advice?.rollover ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Token:</span>
                      <span className="font-mono">{tokenData.advice?.toKen || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">KRN:</span>
                      <span className="font-mono">{tokenData.advice?.toKrn || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">SGC:</span>
                      <span className="font-mono">{tokenData.advice?.toSgc || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">TI:</span>
                      <span className="font-mono">{tokenData.advice?.toTi || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tokens Section */}
              {tokenData.tokens && tokenData.tokens.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Generated Tokens ({tokenData.tokens.length})
                  </h3>
                  <div className="space-y-3">
                    {tokenData.tokens.map((token: Token, index: number) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Token #{index + 1}</h4>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              token.isReservedTid ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {token.isReservedTid ? "Reserved TID" : "Standard"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                          {/* Description */}
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Description:</span>
                            <p className="mt-1 text-gray-600">{token.description}</p>
                          </div>

                          {/* Token Hex */}
                          <div className="md:col-span-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Token Hex:</span>
                              <button
                                onClick={() => copyToClipboard(token.tokenHex)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                title="Copy to clipboard"
                              >
                                <Copy className="size-3" />
                                Copy
                              </button>
                            </div>
                            <div className="mt-1 rounded border bg-white p-2 font-mono text-xs">{token.tokenHex}</div>
                          </div>

                          {/* Token Dec */}
                          <div className="md:col-span-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">Token Dec:</span>
                              <button
                                onClick={() => copyToClipboard(token.tokenDec)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                title="Copy to clipboard"
                              >
                                <Copy className="size-3" />
                                Copy
                              </button>
                            </div>
                            <div className="mt-1 rounded border bg-white p-2 font-mono text-xs">{token.tokenDec}</div>
                          </div>

                          {/* TID */}
                          <div>
                            <span className="font-medium text-gray-700">TID:</span>
                            <p className="mt-1 font-mono text-sm">{token.tid}</p>
                          </div>

                          {/* DRN */}
                          <div>
                            <span className="font-medium text-gray-700">DRN:</span>
                            <p className="mt-1 font-mono text-sm">{token.drn}</p>
                          </div>

                          {/* KRN */}
                          <div>
                            <span className="font-medium text-gray-700">KRN:</span>
                            <p className="mt-1 font-mono text-sm">{token.krn}</p>
                          </div>

                          {/* SGC */}
                          <div>
                            <span className="font-medium text-gray-700">SGC:</span>
                            <p className="mt-1 font-mono text-sm">{token.sgc}</p>
                          </div>

                          {/* TI */}
                          <div>
                            <span className="font-medium text-gray-700">TI:</span>
                            <p className="mt-1 font-mono text-sm">{token.ti}</p>
                          </div>

                          {/* Transfer Amount */}
                          {token.transferAmount > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Transfer Amount:</span>
                              <p className="mt-1 text-sm">{token.transferAmount}</p>
                            </div>
                          )}

                          {/* Scaled Amount */}
                          {token.scaledAmount && (
                            <div>
                              <span className="font-medium text-gray-700">Scaled Amount:</span>
                              <p className="mt-1 text-sm">{token.scaledAmount}</p>
                            </div>
                          )}

                          {/* PAN */}
                          {token.pan && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">PAN:</span>
                              <p className="mt-1 font-mono text-sm">{token.pan}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Data */}
              {tokenData.raw && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Raw Response:</h3>
                  <div className="rounded bg-gray-100 p-3 font-mono text-xs">{tokenData.raw}</div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={onRequestClose} className="button-primary">
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default KeyChangeSuccessModal
