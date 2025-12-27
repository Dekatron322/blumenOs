"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchMeterHistory, MeterHistoryEntry } from "lib/redux/metersSlice"
import { ButtonModule } from "../Button/Button"
import { VscHistory } from "react-icons/vsc"

interface MeterHistoryModalProps {
  isOpen: boolean
  onRequestClose: () => void
  meterId: number | null
  meterDRN: string
}

const MeterHistoryModal: React.FC<MeterHistoryModalProps> = ({ isOpen, onRequestClose, meterId, meterDRN }) => {
  const dispatch = useAppDispatch()
  const { meterHistory, historyLoading, historyError } = useAppSelector((state) => state.meters)

  useEffect(() => {
    if (isOpen && meterId) {
      dispatch(fetchMeterHistory(meterId))
    }
  }, [isOpen, meterId, dispatch])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getChangedFieldsOnly = (oldPayload: string, newPayload: string) => {
    try {
      const oldData = JSON.parse(oldPayload) as Record<string, any>
      const newData = JSON.parse(newPayload) as Record<string, any>

      const changedFields: { [key: string]: { old: any; new: any } } = {}

      // Find fields that are different
      for (const key in newData) {
        if (oldData[key] !== newData[key]) {
          changedFields[key] = {
            old: oldData[key],
            new: newData[key],
          }
        }
      }

      // Also check for fields that were removed (in old but not in new)
      for (const key in oldData) {
        if (!(key in newData)) {
          changedFields[key] = {
            old: oldData[key],
            new: "[REMOVED]",
          }
        }
      }

      return changedFields
    } catch (error) {
      console.error("Error parsing payloads:", error)
      return null
    }
  }

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-800"
      case "update":
        return "bg-blue-100 text-blue-800"
      case "delete":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#F3F4F6] p-6">
          <h2 className="text-xl font-bold text-gray-900">Meter History - {meterDRN}</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {historyError && (
          <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{historyError}</p>
          </div>
        )}

        <div className="p-6">
          {historyLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-16 w-full animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                    <div className="rounded border border-gray-200 p-3">
                      <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div>
                          <div className="mb-1 h-3 w-8 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-12 w-full animate-pulse rounded bg-gray-200"></div>
                        </div>
                        <div>
                          <div className="mb-1 h-3 w-8 animate-pulse rounded bg-gray-200"></div>
                          <div className="h-12 w-full animate-pulse rounded bg-gray-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : meterHistory.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 flex justify-center text-5xl text-gray-400">
                <VscHistory />
              </div>
              <p className="text-gray-500">No history records found for this meter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meterHistory.map((entry: MeterHistoryEntry) => (
                <div key={entry.id} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getChangeTypeColor(entry.changeType)}`}
                      >
                        {entry.changeType}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(entry.changedAtUtc)}</span>
                    </div>
                    <div className="text-sm text-gray-400">ID: {entry.id}</div>
                  </div>

                  {entry.reason && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Reason:</span>
                      <p className="mt-1 rounded bg-gray-50 p-2 text-sm text-gray-600">{entry.reason}</p>
                    </div>
                  )}

                  {entry.changedFields && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Changed Fields:</span>
                      <p className="mt-1 rounded bg-gray-50 p-2 text-sm text-gray-600">{entry.changedFields}</p>
                    </div>
                  )}

                  {entry.oldPayload &&
                    entry.newPayload &&
                    (() => {
                      const changedFields = getChangedFieldsOnly(entry.oldPayload, entry.newPayload)
                      if (!changedFields || Object.keys(changedFields).length === 0) {
                        return null
                      }
                      return (
                        <div className="mt-4">
                          <span className="text-sm font-medium text-gray-700">Changed Fields:</span>
                          <div className="mt-2 space-y-2">
                            {Object.entries(changedFields).map(([fieldName, values]) => (
                              <div key={fieldName} className="rounded border border-gray-200 p-3">
                                <div className="mb-2 text-sm font-medium capitalize text-gray-900">
                                  {fieldName.replace(/([A-Z])/g, " $1").trim()}
                                </div>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                  <div>
                                    <span className="text-xs font-medium text-red-600">Old:</span>
                                    <div className="mt-1 rounded bg-red-50 p-2 text-xs text-gray-700">
                                      {values.old === null || values.old === undefined
                                        ? "[NULL]"
                                        : typeof values.old === "object"
                                        ? JSON.stringify(values.old, null, 2)
                                        : String(values.old)}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-green-600">New:</span>
                                    <div className="mt-1 rounded bg-green-50 p-2 text-xs text-gray-700">
                                      {values.new === null || values.new === undefined
                                        ? "[NULL]"
                                        : typeof values.new === "object"
                                        ? JSON.stringify(values.new, null, 2)
                                        : String(values.new)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end border-t bg-white p-6">
          <ButtonModule variant="primary" onClick={onRequestClose}>
            Close
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MeterHistoryModal
