"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { useRouter } from "next/navigation"
import { clearBills, fetchPostpaidBills, PostpaidBill } from "lib/redux/postpaidSlice"
import { SearchModule } from "components/ui/Search/search-module"

export default function SearchPostpaidBills() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const router = useRouter()

  // Redux hooks
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { bills, loading, error } = useAppSelector((state) => state.postpaidBilling)

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setShowResults(false)
      setIsSearchActive(false)
      dispatch(clearBills())
      return
    }

    setIsSearchActive(true)
    setShowResults(true)
    dispatch(clearBills())

    dispatch(
      fetchPostpaidBills({
        pageNumber: 1,
        pageSize: 20,
        accountNumber: searchQuery.trim(),
      })
    )
  }, [dispatch, searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (!value.trim()) {
      setShowResults(false)
      setIsSearchActive(false)
      dispatch(clearBills())
    }
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Search Postpaid Bills</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Find and manage postpaid bills, payments, and billing cycles
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
                  dispatch(clearBills())
                }}
                onSearch={handleSearch}
                placeholder="Type customer account number. Example: ACC-2024-001"
                prominent={true}
                prominentLabel="Primary action"
                prominentTitle="Search Postpaid Bills"
                prominentDescription="Find and manage postpaid bills, payments, and billing cycles by account number."
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
                className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm"
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
                    How to search bills
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
                      <span className="text-xs font-medium text-gray-700">Enter account</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                      Type the customer&apos;s account number in the search field
                    </p>
                    <div className="mt-1.5 text-[10px] text-gray-400">
                      e.g., <span className="font-mono text-[#004B23]">ACC-2024-001</span>
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
                      <span className="text-xs font-medium text-gray-700">Review details</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                      View consumption, charges, and due dates
                    </p>
                    <div className="mt-1.5 flex gap-1">
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] text-green-700">
                        Published
                      </span>
                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[8px] text-gray-700">Draft</span>
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[8px] text-red-700">Reversed</span>
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
                      Click &quot;View Details&quot; to manage or process
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
                          <li>Enter the complete customer account number</li>
                          <li>Press Enter or click the Search button</li>
                          <li>Review bill details in the results</li>
                          <li>Click &quot;View Details&quot; to manage specific bills</li>
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
                        <span className="ml-3 text-gray-600">Searching postpaid bills...</span>
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

                    {!loading && !error && bills.length === 0 && isSearchActive && (
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
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">No bills found</h3>
                        <p className="text-gray-600">
                          We couldn&apos;t find any postpaid bills matching &quot;{searchQuery}&quot;
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Try checking the spelling or use different keywords
                        </p>
                      </div>
                    )}

                    {!loading && !error && bills.length > 0 && (
                      <div className="space-y-2">
                        <div className="mb-3 text-sm text-gray-600">
                          Found {bills.length} bill{bills.length !== 1 ? "s" : ""}
                        </div>
                        {bills.map((bill: PostpaidBill) => (
                          <div
                            key={bill.id}
                            className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                            onClick={() => router.push(`/billing/bills/${bill.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center space-x-2">
                                  <h3 className="text-base font-medium text-gray-900">{bill.name}</h3>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                      bill.status === 1
                                        ? "bg-green-100 text-green-800"
                                        : bill.status === 2
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {bill.status === 1 ? "Published" : bill.status === 2 ? "Reversed" : "Draft"}
                                  </span>
                                  {bill.adjustmentStatus === 1 && (
                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                                      Adjustment
                                    </span>
                                  )}
                                  {bill.openDisputeCount > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                      {bill.openDisputeCount} Dispute{bill.openDisputeCount !== 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-3 lg:grid-cols-4">
                                  <div>
                                    <span className="text-gray-500">Customer:</span>
                                    <span className="ml-1 font-medium text-gray-900">{bill.customerName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Account:</span>
                                    <span className="ml-1 font-medium text-gray-900">{bill.customerAccountNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Period:</span>
                                    <span className="ml-1 font-medium text-gray-900">{bill.period}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Due:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Bill ID:</span>
                                    <span className="ml-1 font-medium text-gray-900">{bill.billingId}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Meter:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {bill.customerMeterNumber || "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Consumption:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {bill.consumptionKwh || 0} kWh
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Total Due:</span>
                                    <span className="ml-1 font-medium text-gray-900">₦{bill.totalDue || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Outstanding:</span>
                                    <span
                                      className={`ml-1 font-medium ${
                                        bill.outstandingAmount > 0 ? "text-red-600" : "text-green-600"
                                      }`}
                                    >
                                      ₦{bill.outstandingAmount || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-3 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/billing/bills/${bill.id}`)
                                  }}
                                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004B23] focus:ring-offset-2"
                                >
                                  <svg className="mr-1 size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
        {loading && !bills.length && (
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
                  <p className="font-medium text-gray-900">Loading Bill Data</p>
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
