"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { useRouter } from "next/navigation"
import { clearBills, fetchPostpaidBills, PostpaidBill } from "lib/redux/postpaidSlice"

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
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
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Search Postpaid Bills</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Find and manage postpaid bills, payments, and billing cycles
                  </p>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="mb-8">
              <div className="w-full">
                <label htmlFor="bill-search" className="sr-only">
                  Search postpaid bills
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="size-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="bill-search"
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Search by customer account number."
                    className="block w-full rounded-lg border border-gray-300 bg-white py-4 pl-14 pr-24 text-lg placeholder-gray-500 focus:border-[#004B23] focus:outline-none focus:ring-2 focus:ring-[#004B23]"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading}
                      className="inline-flex items-center rounded-md bg-[#004B23] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#003d1c] focus:outline-none focus:ring-2 focus:ring-[#004B23] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>
                </div>
                {searchQuery && (
                  <div className="mt-3 text-base text-gray-600">
                    Searching for: <span className="font-medium text-gray-900">&quot;{searchQuery}&quot;</span>
                  </div>
                )}
              </div>
            </div>

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
                      <div className="space-y-4">
                        <div className="mb-4 text-sm text-gray-600">
                          Found {bills.length} bill{bills.length !== 1 ? "s" : ""}
                        </div>
                        {bills.map((bill: PostpaidBill) => (
                          <div
                            key={bill.id}
                            className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                            onClick={() => router.push(`/billing/bills/${bill.id}`)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-3 flex items-center space-x-3">
                                  <h3 className="text-lg font-medium text-gray-900">{bill.name}</h3>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                      Adjustment Pending
                                    </span>
                                  )}
                                  {bill.openDisputeCount > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                      {bill.openDisputeCount} Dispute{bill.openDisputeCount !== 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>

                                <div className="mb-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Customer:</span>
                                    <span className="font-medium text-gray-900">{bill.customerName}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Account:</span>
                                    <span className="font-medium text-gray-900">{bill.customerAccountNumber}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Period:</span>
                                    <span className="font-medium text-gray-900">{bill.period}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Due Date:</span>
                                    <span className="font-medium text-gray-900">
                                      {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Bill ID:</span>
                                    <span className="font-medium text-gray-900">{bill.billingId}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Meter:</span>
                                    <span className="font-medium text-gray-900">
                                      {bill.customerMeterNumber || "N/A"}
                                    </span>
                                  </div>
                                </div>

                                <div className="mb-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Area Office:</span>
                                    <span className="font-medium text-gray-900">{bill.areaOfficeName || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Feeder:</span>
                                    <span className="font-medium text-gray-900">{bill.feederName || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Tariff Code:</span>
                                    <span className="font-medium text-gray-900">
                                      {bill.customerTariffCode || "N/A"}
                                    </span>
                                  </div>
                                </div>

                                <div className="mb-3 border-t border-gray-100 pt-3">
                                  <div className="mb-2 text-sm font-medium text-gray-600">Consumption & Charges</div>
                                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">Consumption:</span>
                                      <span className="font-medium text-gray-900">{bill.consumptionKwh || 0} kWh</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">Tariff Rate:</span>
                                      <span className="font-medium text-gray-900">₦{bill.tariffPerKwh || 0}/kWh</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">VAT Rate:</span>
                                      <span className="font-medium text-gray-900">{bill.vatRate || 0}%</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">Opening Balance:</span>
                                      <span className="font-medium text-gray-900">₦{bill.openingBalance || 0}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-3 border-t border-gray-100 pt-3">
                                  <div className="mb-2 text-sm font-medium text-gray-600">Bill Amounts</div>
                                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">Current Bill:</span>
                                      <span className="font-medium text-gray-900">₦{bill.currentBillAmount || 0}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">VAT Amount:</span>
                                      <span className="font-medium text-gray-900">₦{bill.vatAmount || 0}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">Total Due:</span>
                                      <span className="font-medium text-gray-900">₦{bill.totalDue || 0}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">Outstanding:</span>
                                      <span
                                        className={`font-medium ${
                                          bill.outstandingAmount > 0 ? "text-red-600" : "text-green-600"
                                        }`}
                                      >
                                        ₦{bill.outstandingAmount || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-4 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/billing/bills/${bill.id}`)
                                  }}
                                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004B23] focus:ring-offset-2"
                                >
                                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                  View Details
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
