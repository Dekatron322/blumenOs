"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowRight,
  Building,
  Calendar,
  CreditCard,
  Edit3,
  ExternalLink,
  Package,
  Receipt,
  User,
  Zap,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { ExportOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentPayment, fetchPaymentById } from "lib/redux/paymentSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import ChangeRequestModal from "components/ui/Modal/change-payment-request-modal"
import PaymentReceiptModal from "components/ui/Modal/payment-receipt-modal"
import PaymentTrackingModal from "components/ui/Modal/payment-tracking-modal"
import ConfirmBankTransferModal from "components/ui/Modal/confirm-bank-transfer-modal"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { clearChangeRequestsByPayment, fetchChangeRequestsByPaymentId } from "lib/redux/paymentSlice"
import type {
  ChangeRequestListItem as ChangeRequestListItemType,
  ChangeRequestsRequestParams,
} from "lib/redux/paymentSlice"
import ViewPaymentChangeRequestModal from "components/ui/Modal/view-payment-change-request-modal"
import RefundPaymentModal from "components/ui/Modal/refund-payment-modal"

// LoadingSkeleton component for payment details
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="size-8 overflow-hidden rounded-md bg-gray-200 md:size-9">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="flex-1">
            <div className="mb-2 h-6 w-32 overflow-hidden rounded bg-gray-200 md:h-8 md:w-48">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <div className="h-3 w-24 overflow-hidden rounded bg-gray-200 md:h-4 md:w-32">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <div className="h-9 w-20 overflow-hidden rounded bg-gray-200 md:h-10 md:w-24">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />
          </div>
          <div className="h-9 w-20 overflow-hidden rounded bg-gray-200 md:h-10 md:w-24">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Left Column Skeleton */}
        <div className="w-full space-y-4 lg:w-[30%] lg:space-y-6">
          {/* Profile Card Skeleton */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 md:p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto size-16 overflow-hidden rounded-full bg-gray-200 md:size-20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>
              <div className="mx-auto mb-2 h-5 w-24 overflow-hidden rounded bg-gray-200 md:h-6 md:w-32">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
              </div>
              <div className="mx-auto mb-4 h-3 w-16 overflow-hidden rounded bg-gray-200 md:h-4 md:w-24">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
              </div>
              <div className="mb-4 flex justify-center gap-2 md:mb-6">
                <div className="h-5 w-14 overflow-hidden rounded-full bg-gray-200 md:h-6 md:w-20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.6,
                    }}
                  />
                </div>
                <div className="h-5 w-14 overflow-hidden rounded-full bg-gray-200 md:h-6 md:w-20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full overflow-hidden rounded bg-gray-200 md:h-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.0,
                    }}
                  />
                </div>
                <div className="h-3 w-full overflow-hidden rounded bg-gray-200 md:h-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.2,
                    }}
                  />
                </div>
                <div className="h-3 w-full overflow-hidden rounded bg-gray-200 md:h-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.4,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-3 h-5 w-24 overflow-hidden rounded bg-gray-200 md:mb-4 md:h-6 md:w-32">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full overflow-hidden rounded bg-gray-200 md:h-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
              </div>
              <div className="h-3 w-full overflow-hidden rounded bg-gray-200 md:h-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
              </div>
              <div className="h-3 w-full overflow-hidden rounded bg-gray-200 md:h-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-4 md:space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 md:p-6">
              <div className="mb-4 h-5 w-32 overflow-hidden rounded bg-gray-200 md:mb-6 md:h-6 md:w-48">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: item * 0.1,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  {[1, 2, 3].map((subItem) => (
                    <div key={subItem} className="space-y-2">
                      <div className="h-3 w-20 overflow-hidden rounded bg-gray-200 md:h-4 md:w-32">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1,
                          }}
                        />
                      </div>
                      <div className="h-5 w-28 overflow-hidden rounded bg-gray-200 md:h-6 md:w-40">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.05,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((subItem) => (
                    <div key={subItem} className="space-y-2">
                      <div className="h-3 w-20 overflow-hidden rounded bg-gray-200 md:h-4 md:w-32">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.15,
                          }}
                        />
                      </div>
                      <div className="h-5 w-28 overflow-hidden rounded bg-gray-200 md:h-6 md:w-40">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.2,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      Confirmed: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "CONFIRMED" },
      Pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "PENDING" },
      Failed: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "FAILED" },
      Reversed: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "REVERSED" },
    }
    return configs[status as keyof typeof configs] || configs.Pending
  }

  const statusConfig = getStatusConfig(status)

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color} md:px-3 md:py-1`}
    >
      <span className={`size-2 rounded-full ${statusConfig.border}`}></span>
      {statusConfig.label}
    </div>
  )
}

// Payment Method Badge Component
const PaymentMethodBadge = ({ method }: { method: string }) => {
  const getMethodConfig = (method: string) => {
    const configs = {
      Cash: { color: "text-purple-600", bg: "bg-purple-50", label: "CASH" },
      BankTransfer: { color: "text-blue-600", bg: "bg-blue-50", label: "BANK TRANSFER" },
      Pos: { color: "text-orange-600", bg: "bg-orange-50", label: "POS" },
      Card: { color: "text-green-600", bg: "bg-green-50", label: "CARD" },
      VendorWallet: { color: "text-red-600", bg: "bg-red-50", label: "VENDOR WALLET" },
    }
    return configs[method as keyof typeof configs] || configs.Cash
  }

  const methodConfig = getMethodConfig(method)

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${methodConfig.bg} ${methodConfig.color} md:px-3 md:py-1`}
    >
      {methodConfig.label}
    </div>
  )
}

// Collector Type Badge Component
const CollectorTypeBadge = ({ type }: { type: string }) => {
  const getTypeConfig = (type: string) => {
    const configs = {
      Customer: { color: "text-blue-600", bg: "bg-blue-50", label: "CUSTOMER" },
      Agent: { color: "text-green-600", bg: "bg-green-50", label: "AGENT" },
      Vendor: { color: "text-orange-600", bg: "bg-orange-50", label: "VENDOR" },
      Staff: { color: "text-purple-600", bg: "bg-purple-50", label: "STAFF" },
    }
    return configs[type as keyof typeof configs] || configs.Customer
  }

  const typeConfig = getTypeConfig(type)

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${typeConfig.bg} ${typeConfig.color} md:px-3 md:py-1`}
    >
      {typeConfig.label}
    </div>
  )
}

// Change Requests Section Component
const PaymentChangeRequestsSection = ({ paymentId }: { paymentId: number }) => {
  const dispatch = useAppDispatch()
  const {
    changeRequestsByPayment,
    changeRequestsByPaymentLoading,
    changeRequestsByPaymentError,
    changeRequestsByPaymentPagination,
  } = useAppSelector((state) => state.payments)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch change requests for this payment
  useEffect(() => {
    if (paymentId) {
      dispatch(
        fetchChangeRequestsByPaymentId({
          id: paymentId,
          params: {
            pageNumber: currentPage,
            pageSize: pageSize,
          },
        })
      )
    }
  }, [dispatch, paymentId, currentPage, pageSize])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearChangeRequestsByPayment())
    }
  }, [dispatch])

  const handleViewDetails = (changeRequest: ChangeRequestListItemType) => {
    setSelectedChangeRequestId(changeRequest.publicId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChangeRequestId(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalPages = changeRequestsByPaymentPagination.totalPages || 1
  const totalRecords = changeRequestsByPaymentPagination.totalCount || 0

  if (changeRequestsByPaymentLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
      >
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 md:mb-6">
          <CreditCard className="size-5" />
          Change Requests
        </h3>
        <div className="py-8 text-center text-sm text-gray-500">Loading change requests...</div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CreditCard className="size-5" />
            <span>Change Requests</span>
          </h3>
        </div>

        {changeRequestsByPaymentError ? (
          <div className="py-8 text-center text-sm text-red-600">{changeRequestsByPaymentError}</div>
        ) : changeRequestsByPayment.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No change requests found for this payment.</div>
        ) : (
          <>
            <div className="divide-y">
              {changeRequestsByPayment.map((cr) => (
                <div key={cr.publicId} className="border-b bg-white p-4 transition-all hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate font-semibold text-gray-900">{cr.entityLabel}</h3>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          Ref: {cr.reference}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          Status: {cr.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Requested By:</strong> {cr.requestedBy}
                        </span>
                        <span>
                          <strong>Requested At:</strong> {formatDate(cr.requestedAtUtc)}
                        </span>
                        <span>
                          <strong>Source:</strong> {cr.source || "Manual"}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <button onClick={() => handleViewDetails(cr)} className="button-oulined flex items-center gap-2">
                        <VscEye className="size-3 md:size-4" />
                        <span className="hidden md:inline">View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {changeRequestsByPayment.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <p>Show rows</p>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="bg-[#F2F2F2] p-1"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                    <option value={24}>24</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className={`px-3 py-2 ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <BiSolidLeftArrow />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        className={`flex h-[27px] w-[30px] items-center justify-center rounded-md ${
                          currentPage === index + 1 ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className={`px-3 py-2 ${
                      currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                    }`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <BiSolidRightArrow />
                  </button>
                </div>
                <p>
                  Page {currentPage} of {totalPages} ({totalRecords} total records)
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* View Change Request Modal */}
      <ViewPaymentChangeRequestModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        changeRequestId={selectedChangeRequestId || ""}
      />
    </>
  )
}

const PaymentDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const paymentId = params.id as string

  // Get payment details from Redux store
  const { currentPayment, currentPaymentLoading, currentPaymentError } = useAppSelector((state) => state.payments)

  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [activeModal, setActiveModal] = useState<
    "edit" | "changeRequest" | "receipt" | "tracking" | "confirmBankTransfer" | "refund" | null
  >(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (paymentId) {
      const id = parseInt(paymentId)
      if (!isNaN(id)) {
        dispatch(fetchPaymentById(id))
      }
    }

    // Cleanup function to clear payment details when component unmounts
    return () => {
      dispatch(clearCurrentPayment())
    }
  }, [dispatch, paymentId])

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (modalType: "edit" | "changeRequest" | "tracking" | "confirmBankTransfer" | "refund") =>
    setActiveModal(modalType)

  const handleChangeRequestSuccess = () => {
    // Refresh payment details after successful change request
    if (paymentId) {
      const id = parseInt(paymentId)
      if (!isNaN(id)) {
        dispatch(fetchPaymentById(id))
      }
    }
    closeAllModals()
  }

  const handleConfirmBankTransferSuccess = () => {
    // Refresh payment details after successful bank transfer confirmation
    if (paymentId) {
      const id = parseInt(paymentId)
      if (!isNaN(id)) {
        dispatch(fetchPaymentById(id))
      }
    }
    closeAllModals()
  }

  const exportToPDF = async () => {
    if (!currentPayment) return

    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Add header with company branding
      doc.setFillColor(249, 249, 249)
      doc.rect(0, 0, pageWidth, 60, "F")

      // Company name
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("PAYMENT RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Payment Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Payment Profile Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("PAYMENT PROFILE", 14, yPosition)
      yPosition += 10

      // Profile table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Reference", currentPayment.reference],
          ["External Reference", currentPayment.externalReference],
          ["Total Amount Paid", formatCurrency(currentPayment.totalAmountPaid, currentPayment.currency)],
          ["Status", currentPayment.status],
          ["Payment Method", currentPayment.channel],
          ["Payment Type", currentPayment.paymentTypeName],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Customer Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("CUSTOMER INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Customer Name", currentPayment.customerName],
          ["Account Number", currentPayment.customerAccountNumber],
          ["Phone Number", currentPayment.customerPhoneNumber],
          ["Address", currentPayment.customerAddress],
          ["Meter Number", currentPayment.customerMeterNumber],
          ["Account Type", currentPayment.accountType],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Payment Details Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("PAYMENT DETAILS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Tariff Rate", `${currentPayment.tariffRate} per kWh`],
          ["Units Purchased", `${currentPayment.units} kWh`],
          ["VAT Rate", `${(currentPayment.vatRate * 100).toFixed(1)}%`],
          ["VAT Amount", formatCurrency(currentPayment.vatAmount, currentPayment.currency)],
          ["Electricity Amount", formatCurrency(currentPayment.electricityAmount, currentPayment.currency)],
          ["Outstanding Debt", formatCurrency(currentPayment.outstandingDebt, currentPayment.currency)],
          ["Debt Payable", formatCurrency(currentPayment.debtPayable, currentPayment.currency)],
          ["Total Amount Paid", formatCurrency(currentPayment.totalAmountPaid, currentPayment.currency)],
          ["Currency", currentPayment.currency],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Timeline Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("TIMELINE INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Event", "Date & Time"]],
        body: [["Paid At", formatDate(currentPayment.paidAtUtc)]],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Additional Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("ADDITIONAL INFORMATION", 14, yPosition)
      yPosition += 10

      const additionalInfo = [
        ["Payment Type", currentPayment.paymentTypeName || "N/A"],
        ["External Reference", currentPayment.externalReference || "N/A"],
        ["Is Pending", currentPayment.isPending ? "Yes" : "No"],
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: additionalInfo,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      })

      // Token Information
      if (currentPayment.token) {
        yPosition = (doc as any).lastAutoTable.finalY + 15

        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("TOKEN INFORMATION", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [
            ["Token", currentPayment.token.token],
            ["Token Decimal", currentPayment.token.tokenDec],
            ["Vended Amount", `${currentPayment.token.vendedAmount} ${currentPayment.token.unit}`],
            ["Description", currentPayment.token.description],
            ["DRN", currentPayment.token.drn],
          ],
          theme: "grid",
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })
      }

      // Add page numbers
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10)
      }

      // Save the PDF
      doc.save(`payment-${currentPayment.reference}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (currentPaymentLoading) {
    return <LoadingSkeleton />
  }

  if (currentPaymentError || !currentPayment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-4 md:p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400 md:size-16" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
            {currentPaymentError ? "Error Loading Payment" : "Payment Not Found"}
          </h1>
          <p className="mb-4 text-gray-600 md:mb-6">
            {currentPaymentError || "The payment you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()} className="w-full md:w-auto">
            Back to Payments
          </ButtonModule>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col 2xl:container ">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-3 py-4 md:px-4 lg:px-6 2xl:px-16">
                <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.button
                      type="button"
                      onClick={() => router.back()}
                      className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-[#f9f9f9] text-gray-700 hover:bg-[#f9f9f9] md:size-9"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      aria-label="Go back"
                      title="Go back"
                    >
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="new-arrow-right rotate-180 transform"
                      >
                        <path
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div className="flex-1">
                      <h1 className="text-lg font-bold text-gray-900 md:text-xl lg:text-2xl">Payment Details</h1>
                      <p className="text-sm text-gray-600 md:text-base">Complete payment overview and information</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 text-xs md:text-sm"
                      onClick={exportToPDF}
                      disabled={isExporting}
                    >
                      <ExportOutlineIcon className="size-3 md:size-4" />
                      {isExporting ? "Exporting..." : "Export PDF"}
                    </ButtonModule> */}

                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center text-xs md:text-sm"
                      onClick={() => setActiveModal("receipt")}
                      icon={<Receipt className="size-3 md:size-4" />}
                    >
                      View Receipt
                    </ButtonModule>

                    {currentPayment.status === "Pending" && (
                      <ButtonModule
                        variant="outline"
                        size="sm"
                        className="flex items-center text-xs md:text-sm"
                        onClick={() => setActiveModal("confirmBankTransfer")}
                        icon={<Package className="size-3 md:size-4" />}
                      >
                        Confirm{" "}
                        {currentPayment.channel === "BankTransfer"
                          ? "Bank Transfer"
                          : currentPayment.channel === "Cash"
                          ? "Cash Payment"
                          : currentPayment.channel === "Chaque"
                          ? "Cheque Payment"
                          : currentPayment.channel === "Pos"
                          ? "POS Payment"
                          : currentPayment.channel === "Card"
                          ? "Card Payment"
                          : "Payment"}
                      </ButtonModule>
                    )}

                    {currentPayment.status === "Confirmed" &&
                      currentPayment.accountType?.toLowerCase() === "prepaid" && (
                        <ButtonModule
                          variant="black"
                          size="sm"
                          className="flex items-center  text-xs  md:text-sm"
                          onClick={() => setActiveModal("refund")}
                          icon={<Zap className="size-3 md:size-4" />}
                        >
                          Refund / Re-vend
                        </ButtonModule>
                      )}

                    <ButtonModule
                      variant="primary"
                      size="sm"
                      className="flex items-center text-xs md:text-sm"
                      onClick={() => setActiveModal("tracking")}
                      icon={<Package className="size-3 md:size-4" />}
                    >
                      Track Payment
                    </ButtonModule>

                    {canUpdate ? (
                      <></>
                    ) : (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2 text-xs md:text-sm"
                        onClick={() => setActiveModal("changeRequest")}
                      >
                        <Edit3 className="size-3 md:size-4" />
                        Change Request
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-3 py-6 md:px-4 lg:px-6 lg:py-8 2xl:px-16">
              <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-6">
                {/* Left Column - Profile & Quick Stats */}
                <div className="flex w-full flex-col space-y-4 lg:w-[30%] lg:space-y-6">
                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 md:size-20 md:text-3xl">
                          <CreditCard className="size-6 md:size-8" />
                        </div>
                      </div>

                      <h2 className="mb-2 text-lg font-bold text-gray-900 md:text-xl">{currentPayment.reference}</h2>
                      {/* <p className="mb-4 text-sm text-gray-600 md:text-base">Payment #{currentPayment.id}</p> */}

                      <div className="mb-4 flex flex-wrap justify-center gap-2 md:mb-6">
                        <StatusBadge status={currentPayment.status} />
                        <PaymentMethodBadge method={currentPayment.channel} />
                      </div>

                      <div className="space-y-2 text-xs md:space-y-3 md:text-sm">
                        <div className="flex flex-col items-center justify-between gap-1 text-gray-600 sm:flex-row">
                          <span className="font-medium">Total Amount:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(currentPayment.totalAmountPaid, currentPayment.currency)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-1 text-gray-600 sm:flex-row">
                          <span className="font-medium">Payment Type:</span>
                          <span className="font-medium text-gray-900">{currentPayment.paymentTypeName}</span>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-1 text-gray-600 sm:flex-row">
                          <span className="font-medium">Paid:</span>
                          <span className="font-medium text-gray-900">{formatDate(currentPayment.paidAtUtc)}</span>
                        </div>
                      </div>
                    </div>
                    {currentPayment.status === "Confirmed" &&
                      currentPayment.accountType?.toLowerCase() === "prepaid" && (
                        <ButtonModule
                          variant="black"
                          size="md"
                          className="mt-4 flex w-full items-center  text-xs  md:text-sm"
                          onClick={() => setActiveModal("refund")}
                          icon={<Zap className="size-3 md:size-4" />}
                        >
                          Refund / Re-vend
                        </ButtonModule>
                      )}
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                  >
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
                      <Zap className="size-4 md:size-5" />
                      Payment Summary
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex flex-col items-center justify-between gap-1 sm:flex-row">
                        <span className="text-xs text-gray-600 md:text-sm">Units Purchased</span>
                        <span className="font-semibold text-gray-900">{currentPayment.units} kWh</span>
                      </div>
                      <div className="flex flex-col items-center justify-between gap-1 sm:flex-row">
                        <span className="text-xs text-gray-600 md:text-sm">Tariff Rate</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentPayment.tariffRate, currentPayment.currency)}/kWh
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-between gap-1 sm:flex-row">
                        <span className="text-xs text-gray-600 md:text-sm">VAT Amount</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentPayment.vatAmount, currentPayment.currency)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-between gap-1 sm:flex-row">
                        <span className="text-xs text-gray-600 md:text-sm">Outstanding Debt</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentPayment.outstandingDebt, currentPayment.currency)}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Customer Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                  >
                    <h3 className="mb-3 text-base font-semibold text-gray-900 md:text-lg">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <User className="size-4 md:size-5" />
                          Customer
                        </div>
                        <button
                          onClick={() => {
                            router.push(`/customers/${currentPayment.customerId}`)
                          }}
                          className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="View Customer Details"
                        >
                          <ExternalLink className="size-4 md:size-5" />
                        </button>
                      </div>
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div className="rounded-lg ">
                        <div className="font-medium text-gray-900">{currentPayment.customerName}</div>
                        <div className="text-xs text-gray-600 md:text-sm">
                          Account: {currentPayment.customerAccountNumber}
                        </div>
                        <div className="text-xs text-gray-600 md:text-sm">
                          Phone: {currentPayment.customerPhoneNumber}
                        </div>
                        <div className="text-xs text-gray-600 md:text-sm">
                          Address: {currentPayment.customerAddress}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-4 lg:w-[70%] lg:space-y-6">
                  {/* Basic Payment Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 md:mb-6">
                      <CreditCard className="size-5" />
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">Reference</label>
                        <p className="mt-1 font-semibold text-gray-900 md:mt-0">{currentPayment.reference}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">External Reference</label>
                        <p className="mt-1 font-semibold text-gray-900 md:mt-0">{currentPayment.externalReference}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:mt-4 md:grid-cols-3 md:gap-4">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">Status</label>
                        <div className="mt-1 md:mt-2">
                          <StatusBadge status={currentPayment.status} />
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">Payment Method</label>
                        <div className="mt-1 md:mt-2">
                          <PaymentMethodBadge method={currentPayment.channel} />
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">Payment Type</label>
                        <p className="mt-1 font-semibold text-gray-900 md:mt-0">{currentPayment.paymentTypeName}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Financial Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 md:mb-6">
                      <Zap className="size-5" />
                      Financial Details
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 md:size-10">
                            <CreditCard className="size-4 text-blue-600 md:size-5" />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-600 md:text-sm">Total Amount Paid</label>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(currentPayment.totalAmountPaid, currentPayment.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 md:size-10">
                            <Zap className="size-4 text-green-600 md:size-5" />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-600 md:text-sm">Electricity Amount</label>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(currentPayment.electricityAmount, currentPayment.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 md:size-10">
                            <AlertCircle className="size-4 text-orange-600 md:size-5" />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-600 md:text-sm">VAT Amount</label>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(currentPayment.vatAmount, currentPayment.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 md:size-10">
                            <Building className="size-4 text-purple-600 md:size-5" />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-600 md:text-sm">Outstanding Debt</label>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(currentPayment.outstandingDebt, currentPayment.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 md:mb-6">
                      <Calendar className="size-5" />
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">Paid At</label>
                        <p className="mt-1 font-semibold text-gray-900 md:mt-0">
                          {formatDate(currentPayment.paidAtUtc)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">Is Pending</label>
                        <p className="mt-1 font-semibold text-gray-900 md:mt-0">
                          {currentPayment.isPending ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Additional Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 md:mb-6">
                      <Building className="size-5" />
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">Payment Type</label>
                        <p className="mt-1 font-semibold text-gray-900 md:mt-0">{currentPayment.paymentTypeName}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">External Reference</label>
                        <p className="mt-1 font-semibold text-gray-900 md:mt-0">{currentPayment.externalReference}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                        <label className="text-xs font-medium text-gray-600 md:text-sm">Is Pending</label>
                        <p className="mt-1 font-semibold text-gray-900 md:mt-0">
                          {currentPayment.isPending ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Token Information */}
                  {currentPayment.token && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 md:mb-6">
                        <Zap className="size-5" />
                        Token Information
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <label className="text-xs font-medium text-gray-600 md:text-sm">Token</label>
                          <p className="mt-1 font-mono text-sm font-semibold text-gray-900 md:mt-0">
                            {currentPayment.token.token}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <label className="text-xs font-medium text-gray-600 md:text-sm">Token Decimal</label>
                          <p className="mt-1 font-mono text-sm font-semibold text-gray-900 md:mt-0">
                            {currentPayment.token.tokenDec}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <label className="text-xs font-medium text-gray-600 md:text-sm">Vended Amount</label>
                          <p className="mt-1 font-semibold text-gray-900 md:mt-0">
                            {currentPayment.token.vendedAmount} {currentPayment.token.unit}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <label className="text-xs font-medium text-gray-600 md:text-sm">Description</label>
                          <p className="mt-1 font-semibold text-gray-900 md:mt-0">{currentPayment.token.description}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 md:p-4">
                          <label className="text-xs font-medium text-gray-600 md:text-sm">DRN</label>
                          <p className="mt-1 font-mono text-sm font-semibold text-gray-900 md:mt-0">
                            {currentPayment.token.drn}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Change Requests Section */}
                  <PaymentChangeRequestsSection paymentId={currentPayment.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChangeRequestModal
        isOpen={activeModal === "changeRequest"}
        onRequestClose={closeAllModals}
        paymentId={currentPayment.id}
        paymentReference={currentPayment.reference}
        onSuccess={handleChangeRequestSuccess}
      />
      <PaymentReceiptModal
        isOpen={activeModal === "receipt"}
        onRequestClose={closeAllModals}
        payment={currentPayment}
      />
      <PaymentTrackingModal
        isOpen={activeModal === "tracking"}
        onRequestClose={closeAllModals}
        paymentId={parseInt(paymentId)}
      />
      <ConfirmBankTransferModal
        isOpen={activeModal === "confirmBankTransfer"}
        onRequestClose={closeAllModals}
        paymentId={currentPayment.id}
        paymentReference={currentPayment.reference}
        currentAmount={currentPayment.totalAmountPaid}
        onSuccess={handleConfirmBankTransferSuccess}
      />
      <RefundPaymentModal
        isOpen={activeModal === "refund"}
        onRequestClose={closeAllModals}
        paymentReference={currentPayment.reference}
        onSuccess={handleConfirmBankTransferSuccess}
      />
    </section>
  )
}

export default PaymentDetailsPage
