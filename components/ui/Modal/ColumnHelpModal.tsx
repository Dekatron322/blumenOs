"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Info, X } from "lucide-react"

interface ColumnHelpModalProps {
  isOpen: boolean
  onClose: () => void
  templateColumns: string[]
  requiredColumns: string[]
}

export const ColumnHelpModal: React.FC<ColumnHelpModalProps> = ({
  isOpen,
  onClose,
  templateColumns,
  requiredColumns,
}) => {
  const displayColumns = templateColumns.length > 0 ? templateColumns : requiredColumns

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Required Columns</h4>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-blue-600 hover:bg-blue-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {displayColumns.map((col, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700">{col}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
