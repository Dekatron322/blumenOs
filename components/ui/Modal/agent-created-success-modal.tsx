"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, Copy, User, Key } from "lucide-react"

interface AgentCreatedSuccessModalProps {
  isOpen: boolean
  onRequestClose: () => void
  agentData: {
    agentCode: string
    tempPassword: string
    fullName: string
    email: string
    agentType: string
  } | null
}

const AgentCreatedSuccessModal: React.FC<AgentCreatedSuccessModalProps> = ({ isOpen, onRequestClose, agentData }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
  }

  if (!isOpen || !agentData) return null

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
            className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex w-full items-center justify-between bg-green-50 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="size-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 md:text-xl">Agent Created Successfully!</h2>
                  <p className="text-sm text-green-600">New agent has been registered successfully</p>
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
            <div className="w-full p-4 md:p-6">
              {/* Agent Information */}
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900">
                  <User className="size-4" />
                  Agent Information
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div>
                    <span className="font-medium text-gray-700">Full Name:</span>
                    <p className="mt-1 text-gray-900">{agentData.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="mt-1 text-gray-900">{agentData.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Agent Code:</span>
                    <p className="mt-1 font-mono text-gray-900">{agentData.agentCode}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Agent Type:</span>
                    <p className="mt-1 text-gray-900">{agentData.agentType}</p>
                  </div>
                </div>
              </div>

              {/* Temporary Password Section */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-900">
                  <Key className="size-4" />
                  Temporary Password
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-blue-800">
                    Please share this temporary password with the agent. They will need to change it on first login.
                  </p>

                  <div>
                    <span className="font-medium text-blue-900">Password:</span>
                    <div className="mt-1 rounded border border-blue-300 bg-white p-3 font-mono text-lg text-gray-900">
                      <div className="flex items-center justify-between">
                        <span>{agentData.tempPassword}</span>
                        <button
                          onClick={() => copyToClipboard(agentData.tempPassword)}
                          className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-600 hover:bg-blue-200"
                          title="Copy to clipboard"
                        >
                          <Copy className="size-3" />
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md bg-blue-100 p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Important:</strong> This password is temporary and will expire after first use. The agent
                      must change it during their initial login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => copyToClipboard(agentData.tempPassword)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Copy className="size-4" />
                  {copied ? "Copied!" : "Copy Password"}
                </button>
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

export default AgentCreatedSuccessModal
