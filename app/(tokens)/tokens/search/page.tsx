"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { useRouter } from "next/navigation"
import { clearPrepaidTransactions, fetchPrepaidTransactions, PrepaidTransaction } from "lib/redux/metersSlice"
import { SearchModule } from "components/ui/Search/search-module"
import { ButtonModule } from "components/ui/Button/Button"
import VendTokenModal from "components/ui/Modal/vend-token-modal"
import CollectPaymentReceiptModal from "components/ui/Modal/collect-payment-receipt-modal"

export default function SearchTokens() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<PrepaidTransaction | null>(null)
  const [showVendTokenModal, setShowVendTokenModal] = useState(false)
  const [showCollectPaymentReceiptModal, setShowCollectPaymentReceiptModal] = useState(false)

  const router = useRouter()

  // Redux hooks
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { prepaidTransactions, loading, error } = useAppSelector((state) => state.meters)

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setShowResults(false)
      setIsSearchActive(false)
      dispatch(clearPrepaidTransactions())
      return
    }

    setIsSearchActive(true)
    setShowResults(true)
    dispatch(clearPrepaidTransactions())

    dispatch(
      fetchPrepaidTransactions({
        pageNumber: 1,
        pageSize: 20,
        search: searchQuery.trim(),
        prepaidOnly: true,
      })
    )
  }, [dispatch, searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (!value.trim()) {
      setShowResults(false)
      setIsSearchActive(false)
      dispatch(clearPrepaidTransactions())
    }
  }

  const handleViewReceipt = (transaction: PrepaidTransaction) => {
    setSelectedTransaction(transaction)
    // Determine which modal to show based on payment type
    if (
      transaction.paymentTypeName?.toLowerCase().includes("token") ||
      transaction.paymentTypeName?.toLowerCase().includes("vend")
    ) {
      setShowVendTokenModal(true)
    } else {
      setShowCollectPaymentReceiptModal(true)
    }
  }

  const handleCloseReceiptModals = () => {
    setShowVendTokenModal(false)
    setShowCollectPaymentReceiptModal(false)
    setSelectedTransaction(null)
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
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Search Tokens</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Find and manage prepaid tokens, transactions, and vending history
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
                  dispatch(clearPrepaidTransactions())
                }}
                onSearch={handleSearch}
                placeholder="Type token, meter number, customer name, reference..."
                prominent={true}
                prominentLabel="Primary action"
                prominentTitle="Search Tokens"
                prominentDescription="Find and manage prepaid tokens, transactions, and vending history by token or customer details."
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
                    <svg
                      className="mr-1.5 h-4 w-4 text-[#004B23]"
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
                    How to search tokens
                  </h2>
                </div>

                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  {/* Step 1 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#004B23]/10 text-xs font-semibold text-[#004B23]">
                        1
                      </div>
                      <span className="text-xs font-medium text-gray-700">Enter details</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                      Type token, meter number, customer name or transaction reference
                    </p>
                    <div className="mt-1.5 text-[10px] text-gray-400">
                      e.g., <span className="font-mono text-[#004B23]">1234-5678</span>
                    </div>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#004B23]/10 text-xs font-semibold text-[#004B23]">
                        2
                      </div>
                      <span className="text-xs font-medium text-gray-700">Review info</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                      View token details, status, and transaction information
                    </p>
                    <div className="mt-1.5 flex gap-1">
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] text-green-700">
                        Confirmed
                      </span>
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[8px] text-red-700">Failed</span>
                      <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[8px] text-yellow-700">
                        Pending
                      </span>
                    </div>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#004B23]/10 text-xs font-semibold text-[#004B23]">
                        3
                      </div>
                      <span className="text-xs font-medium text-gray-700">Take action</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                      Click &quot;View Details&quot; to manage token and transaction information
                    </p>
                    <div className="mt-1.5">
                      <span className="inline-flex items-center text-[10px] text-[#004B23]">
                        View Details
                        <svg className="ml-0.5 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400"
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
                          <li>Enter token details (token, meter number, customer name or reference)</li>
                          <li>Press Enter or click the Search button</li>
                          <li>Review token information and transaction status</li>
                          <li>Click "View Details" to manage the token transaction</li>
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
                    {/* Loading State - Shows first when searching */}
                    {loading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="size-8 animate-spin rounded-full border-b-2 border-[#004B23]"></div>
                        <span className="ml-3 text-gray-600">Searching tokens...</span>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <div className="py-8 text-center">
                        <div className="mb-2 text-red-600">{error}</div>
                        <button onClick={handleSearch} className="font-medium text-[#004B23] hover:text-[#003d1c]">
                          Try again
                        </button>
                      </div>
                    )}

                    {/* No Results State - Only shows when not loading and no errors */}
                    {!loading && !error && prepaidTransactions.length === 0 && isSearchActive && (
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
                        <h3 className="mb-2 text-lg font-medium text-gray-900">No tokens found</h3>
                        <p className="text-gray-600">
                          We couldn&apos;t find any tokens matching &quot;{searchQuery}&quot;
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Try checking the token number or use different keywords
                        </p>
                      </div>
                    )}

                    {/* Results State */}
                    {!loading && !error && prepaidTransactions.length > 0 && (
                      <div className="space-y-2">
                        <div className="mb-3 text-sm text-gray-600">
                          Found {prepaidTransactions.length} transaction{prepaidTransactions.length !== 1 ? "s" : ""}
                        </div>
                        {prepaidTransactions.map((transaction: PrepaidTransaction) => (
                          <div
                            key={transaction.id}
                            className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center space-x-2">
                                  <h3 className="text-base font-medium text-gray-900">{transaction.reference}</h3>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                      transaction.status === "Confirmed"
                                        ? "bg-green-100 text-green-800"
                                        : transaction.status === "Failed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {transaction.status}
                                  </span>
                                  {transaction.collectorType && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                      {transaction.collectorType}
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-3 lg:grid-cols-4">
                                  <div>
                                    <span className="text-gray-500">Customer:</span>
                                    <span className="ml-1 font-medium text-gray-900">{transaction.customerName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Account:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {transaction.customerAccountNumber}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Amount:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      ₦{transaction.amount.toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Tokens:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {transaction.tokens?.length || 0}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Payment Type:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {transaction.paymentTypeName}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Agent:</span>
                                    <span className="ml-1 font-medium text-gray-900">{transaction.agentName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Date:</span>
                                    <span className="ml-1 font-medium text-gray-900">
                                      {new Date(transaction.paidAtUtc).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Channel:</span>
                                    <span className="ml-1 font-medium text-gray-900">{transaction.channel}</span>
                                  </div>
                                </div>
                                {transaction.tokens && transaction.tokens.length > 0 && (
                                  <div className="mt-3 border-t border-gray-100 pt-3">
                                    <div className="mb-2 text-xs font-medium text-gray-700">Generated Tokens:</div>
                                    <div className="space-y-1">
                                      {transaction.tokens.slice(0, 2).map((token, index) => (
                                        <div key={index} className="text-xs text-gray-600">
                                          <span className="font-mono font-medium">{token.token}</span>
                                          <span className="ml-2 text-gray-500">({token.unit} units)</span>
                                        </div>
                                      ))}
                                      {transaction.tokens.length > 2 && (
                                        <div className="text-xs text-gray-500">
                                          +{transaction.tokens.length - 2} more tokens
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="ml-3 flex-shrink-0">
                                <div className="flex gap-2">
                                  {transaction.status === "Confirmed" && (
                                    <ButtonModule
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        handleViewReceipt(transaction)
                                      }}
                                    >
                                      View Receipt
                                    </ButtonModule>
                                  )}
                                </div>
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

      {/* Loading Overlay - Shows during search */}
      <AnimatePresence>
        {loading && (
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
                  <p className="font-medium text-gray-900">Loading Token Data</p>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vend Token Modal */}
      {selectedTransaction &&
        showVendTokenModal &&
        (() => {
          const firstToken =
            selectedTransaction.tokens && selectedTransaction.tokens.length > 0 ? selectedTransaction.tokens[0] : null
          return (
            <VendTokenModal
              isOpen={showVendTokenModal}
              onRequestClose={handleCloseReceiptModals}
              tokenData={
                firstToken
                  ? {
                      token: firstToken.token,
                      vendedAmount: firstToken.vendedAmount,
                      unit: firstToken.unit,
                      description: firstToken.description,
                      drn: firstToken.drn,
                    }
                  : null
              }
              paymentData={{
                reference: selectedTransaction.reference,
                customerName: selectedTransaction.customerName || "",
                customerAccountNumber: selectedTransaction.customerAccountNumber || "",
                customerAddress: "",
                customerPhoneNumber: undefined,
                customerMeterNumber:
                  selectedTransaction.tokens && selectedTransaction.tokens.length > 0
                    ? selectedTransaction.tokens[0]?.drn
                    : undefined,
                accountType: "prepaid",
                tariffRate: undefined,
                units:
                  selectedTransaction.tokens && selectedTransaction.tokens.length > 0
                    ? parseFloat(selectedTransaction.tokens[0]?.vendedAmount ?? "0")
                    : undefined,
                vatRate: undefined,
                vatAmount: selectedTransaction.vatAmount || undefined,
                electricityAmount: selectedTransaction.amountApplied || undefined,
                outstandingDebt: selectedTransaction.outstandingAfterPayment || undefined,
                debtPayable: selectedTransaction.recoveryAmount || undefined,
                totalAmountPaid: selectedTransaction.amount,
                currency: selectedTransaction.currency || "NGN",
                channel: selectedTransaction.channel,
                status: selectedTransaction.status,
                paymentTypeName: selectedTransaction.paymentTypeName,
                paidAtUtc: selectedTransaction.paidAtUtc,
              }}
            />
          )
        })()}

      {/* Collect Payment Receipt Modal */}
      {selectedTransaction && showCollectPaymentReceiptModal && (
        <CollectPaymentReceiptModal
          isOpen={showCollectPaymentReceiptModal}
          onRequestClose={handleCloseReceiptModals}
          tokenData={selectedTransaction.tokens}
          paymentData={{
            reference: selectedTransaction.reference,
            customerName: selectedTransaction.customerName || "",
            customerAccountNumber: selectedTransaction.customerAccountNumber || "",
            customerAddress: "",
            customerPhoneNumber: "",
            customerMeterNumber:
              selectedTransaction.tokens && selectedTransaction.tokens.length > 0
                ? selectedTransaction.tokens[0]?.drn
                : undefined,
            accountType: "prepaid",
            tariffRate: undefined,
            units:
              selectedTransaction.tokens && selectedTransaction.tokens.length > 0
                ? parseFloat(selectedTransaction.tokens[0]?.vendedAmount ?? "0")
                : undefined,
            vatRate: undefined,
            vatAmount: selectedTransaction.vatAmount || undefined,
            electricityAmount: selectedTransaction.amountApplied || undefined,
            outstandingDebt: selectedTransaction.outstandingAfterPayment || undefined,
            debtPayable: selectedTransaction.recoveryAmount || undefined,
            totalAmountPaid: selectedTransaction.amount,
            currency: selectedTransaction.currency || "NGN",
            channel: selectedTransaction.channel,
            status: selectedTransaction.status,
            paymentTypeName: selectedTransaction.paymentTypeName,
            paidAtUtc: selectedTransaction.paidAtUtc,
            tokens: selectedTransaction.tokens,
          }}
        />
      )}
    </section>
  )
}
