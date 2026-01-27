"use client"
import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText } from "lucide-react"
import { MdCalendarToday, MdClose, MdError, MdInfo } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  CsvUploadFailuresParams,
  fetchCsvUploadFailures,
  resetCsvUploadFailuresState,
} from "lib/redux/fileManagementSlice"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"

interface CsvUploadFailuresModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: number
  fileName: string
}

const CsvUploadFailuresModal: React.FC<CsvUploadFailuresModalProps> = ({ isOpen, onClose, jobId, fileName }) => {
  const dispatch = useAppDispatch()
  const { csvUploadFailures, csvUploadFailuresLoading, csvUploadFailuresError, csvUploadFailuresPagination } =
    useAppSelector((state) => state.fileManagement)

  const [currentPage, setCurrentPage] = useState(1)

  // Fetch failures when modal opens or page changes
  useEffect(() => {
    if (isOpen && jobId) {
      const params: CsvUploadFailuresParams = {
        id: jobId,
        PageNumber: currentPage,
        PageSize: 10,
      }
      dispatch(fetchCsvUploadFailures(params))
    }
  }, [isOpen, jobId, currentPage, dispatch])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(resetCsvUploadFailuresState())
      setCurrentPage(1)
    }
  }, [isOpen, dispatch])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Modal Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#004B23] to-[#006B33] px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold text-white">
                    CSV-{jobId}
                  </span>
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="size-2 rounded-full bg-red-400" />
                    Failures
                  </motion.span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">Upload Failures</h3>
                <p className="mt-1 text-sm text-white/70">{fileName}</p>
              </div>
              <motion.button
                onClick={handleClose}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MdClose className="text-xl" />
              </motion.button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {csvUploadFailuresLoading && !csvUploadFailures.length && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  <span>Loading failures...</span>
                </div>
              </div>
            )}

            {csvUploadFailuresError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-red-900">
                  <MdError className="text-red-600" />
                  Error Loading Failures
                </h4>
                <p className="text-sm text-red-700">{csvUploadFailuresError}</p>
              </div>
            )}

            {!csvUploadFailuresLoading && !csvUploadFailuresError && csvUploadFailures.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                <FileText className="mx-auto mb-4 size-12 text-gray-300" />
                <h4 className="text-lg font-semibold text-gray-900">No Failures Found</h4>
                <p className="mt-2 text-sm text-gray-600">This upload completed successfully</p>
              </div>
            )}

            {!csvUploadFailuresLoading && !csvUploadFailuresError && csvUploadFailures.length > 0 && (
              <div className="space-y-4">
                {/* Summary */}
                {csvUploadFailuresPagination && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                      <MdInfo className="text-[#004B23]" />
                      Summary
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Total Failures</p>
                        <p className="mt-1 font-medium text-gray-900">
                          {csvUploadFailuresPagination.totalCount}
                          <span className="ml-2 font-mono text-sm text-gray-500">
                            Showing {csvUploadFailures.length}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Current Page</p>
                        <p className="mt-1 font-medium text-gray-900">
                          {csvUploadFailuresPagination.currentPage} of {csvUploadFailuresPagination.totalPages}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Failures List */}
                <div className="space-y-4">
                  {csvUploadFailures.map((failure, index) => (
                    <motion.div
                      key={failure.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      {/* Header */}
                      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-red-100">
                            <span className="text-xs font-bold text-red-600">#{failure.lineNumber}</span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">Line {failure.lineNumber}</h5>
                            <p className="flex items-center gap-1 text-xs text-gray-500">
                              <MdCalendarToday className="size-3" />
                              {new Date(failure.createdAtUtc).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Error Message */}
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-medium uppercase text-gray-400">Error Message</p>
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm text-red-700">{failure.message}</p>
                        </div>
                      </div>

                      {/* Raw Line */}
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase text-gray-400">Raw Data</p>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">{failure.rawLine}</pre>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {csvUploadFailuresPagination && csvUploadFailuresPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-sm text-gray-600">
                      Page {csvUploadFailuresPagination.currentPage} of {csvUploadFailuresPagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!csvUploadFailuresPagination.hasPrevious}
                        className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <MdOutlineArrowBackIosNew className="size-4" />
                      </button>
                      {[...Array(Math.min(5, csvUploadFailuresPagination.totalPages))].map((_, index) => {
                        const pageNumber = index + 1
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              currentPage === pageNumber
                                ? "border-[#004B23] bg-[#004B23] text-white"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!csvUploadFailuresPagination.hasNext}
                        className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <MdOutlineArrowForwardIos className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex justify-end">
              <ButtonModule onClick={handleClose} className="button-outlined">
                Close
              </ButtonModule>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CsvUploadFailuresModal
