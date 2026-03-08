"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { useRouter } from "next/navigation"
import { clearPayments, fetchPayments, Payment } from "lib/redux/paymentSlice"
import { SearchModule } from "components/ui/Search/search-module"

export default function SearchPayments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const router = useRouter()

  // Redux hooks
  const dispatch = useAppDispatch()

  const { payments, loading, error } = useAppSelector((state) => state.payments)

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setShowResults(false)
      setIsSearchActive(false)
      dispatch(clearPayments())
      return
    }

    setIsSearchActive(true)
    setShowResults(true)
    dispatch(clearPayments())

    dispatch(
      fetchPayments({
        pageNumber: 1,
        pageSize: 20,
        search: searchQuery.trim(),
      })
    )
  }, [dispatch, searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (!value.trim()) {
      setShowResults(false)
      setIsSearchActive(false)
      dispatch(clearPayments())
    }
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Search Payments</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Find and manage payment transactions, receipts, and payment status
                  </p>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="mb-8">
              <SearchModule
                value={searchQuery}
                onChange={handleInputChange}
                onCancel={() => {
                  setSearchQuery("")
                  setShowResults(false)
                  setIsSearchActive(false)
                  dispatch(clearPayments())
                }}
                onSearch={handleSearch}
                placeholder="Type payment reference, customer name, account number..."
                prominent={true}
                prominentLabel="Primary action"
                prominentTitle="Search Payments"
                prominentDescription="Find and manage payment transactions, receipts, and payment status by reference or customer details."
                height="h-14"
                className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm md:!w-full [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
                disabled={loading}
              />
              {searchQuery && (
                <div className="mt-3 text-base text-gray-600">
                  Searching for: <span className="font-medium text-gray-900">&quot;{searchQuery}&quot;</span>
                </div>
              )}
            </div>

            {/* How It Works Illustration - Compact Version */}
            {!isSearchActive && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 overflow-hidden rounded-lg bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
                  <h2 className="flex items-center text-sm font-semibold text-gray-700">
                    <svg className="mr-1.5 size-4 text-[#004B23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    How to search payments
                  </h2>
                </div>

                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  {/* Step 1 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-[#004B23]/10 text-xs font-semibold text-[#004B23]">
                        1
                      </div>
                      <span className="text-xs font-medium text-gray-700">Enter details</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                      Type payment reference, customer name, or account number
                    </p>
                    <div className="mt-1.5 text-[10px] text-gray-400">
                      e.g., <span className="font-mono text-[#004B23]">PAY123456</span>
                    </div>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-[#004B23]/10 text-xs font-semibold text-[#004B23]">
                        2
                      </div>
                      <span className="text-xs font-medium text-gray-700">Review info</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                      View payment details, status, and transaction info
                    </p>
                    <div className="mt-1.5 flex gap-1">
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] text-green-700">
                        Confirmed
                      </span>
                      <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[8px] text-yellow-700">
                        Pending
                      </span>
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[8px] text-red-700">Failed</span>
                    </div>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-[#004B23]/10 text-xs font-semibold text-[#004B23]">
                        3
                      </div>
                      <span className="text-xs font-medium text-gray-700">Take action</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                      Click &quot;View Details&quot; to manage payment transaction
                    </p>
                    <div className="mt-1.5">
                      <span className="inline-flex items-center text-[10px] text-[#004B23]">
                        View Details
                        <svg className="ml-0.5 size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Tips - Detailed Steps */}
                <div className="border-t border-gray-100 bg-gray-50/30 px-4 py-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 size-3.5 shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium text-gray-700">Quick Steps:</span>
                        <ol className="mt-1 list-inside list-decimal space-y-1">
                          <li>Enter payment details (reference, customer name or account number)</li>
                          <li>Press Enter or click the Search button</li>
                          <li>Review payment information and status</li>
                          <li>Click &quot;View Details&quot; to manage the payment transaction</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search Results */}
            {showResults && (
              <div className="mb-8">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Search Results
                      {isSearchActive && searchQuery && (
                        <span className="ml-2 text-sm font-normal text-gray-600">for &quot;{searchQuery}&quot;</span>
                      )}
                    </h2>
                  </div>

                  <div className="px-6 py-4">
                    {loading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="size-8 animate-spin rounded-full border-b-2 border-[#004B23]"></div>
                        <span className="ml-3 text-gray-600">Searching payments...</span>
                      </div>
                    )}

                    {error && (
                      <div className="py-8 text-center">
                        <div className="mb-2 text-red-600">{error}</div>
                        <button onClick={handleSearch} className="font-medium text-[#004B23] hover:text-[#003d1c]">
                          Try again
                        </button>
                      </div>
                    )}

                    {!loading && !error && payments.length === 0 && isSearchActive && (
                      <div className="py-8 text-center">
                        <div className="mb-4 text-gray-500">
                          <svg
                            className="mx-auto size-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">No payments found</h3>
                        <p className="text-gray-600">
                          We couldn&apos;t find any payments matching &quot;{searchQuery}&quot;
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Try checking the payment reference or use different keywords
                        </p>
                      </div>
                    )}

                    {!loading && !error && payments.length > 0 && (
                      <div className="space-y-2">
                        <div className="mb-3 text-sm text-gray-600">
                          Found {payments.length} payment{payments.length !== 1 ? "s" : ""}
                        </div>
                        {payments.map((payment: Payment) => (
                          <div
                            key={payment.id}
                            className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                            onClick={() => router.push(`/payment/payment-detail/${payment.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center space-x-2">
                                  <h3 className="text-base font-medium text-gray-900">{payment.reference}</h3>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                      payment.status === "Confirmed"
                                        ? "bg-green-100 text-green-800"
                                        : payment.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {payment.status}
                                  </span>
                                  {payment.isPrepaid && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                      Prepaid
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-3 lg:grid-cols-4">
                                  <div>
                                    <span className="text-gray-500">Customer:</span>
                                    <span className="ml-1 font-medium text-gray-900">{payment.customerName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Account:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {payment.customerAccountNumber}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Amount:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {payment.currency} {Number(payment.totalAmountPaid).toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Channel:</span>
                                    <span className="ml-1 font-medium text-gray-900">{payment.channel}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Type:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {payment.isPrepaid ? "Prepaid" : "Postpaid"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Payment Type:</span>
                                    <span className="ml-1 font-medium text-gray-900">{payment.paymentTypeName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Date:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {new Date(payment.paidAtUtc).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Meter:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {payment.customerMeterNumber || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-3 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/payment/payment-detail/${payment.id}`)
                                  }}
                                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004B23] focus:ring-offset-2"
                                >
                                  <svg className="mr-1 size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && !payments.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="size-12 animate-spin rounded-full border-4 border-[#004B23] border-t-transparent" />
                <div className="text-center">
                  <p className="font-medium text-gray-900">Loading Payment Data</p>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
