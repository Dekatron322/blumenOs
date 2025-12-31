"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"

import { AnimatePresence, motion } from "framer-motion"
import { VendingIcon } from "components/Icons/Icons"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import { fetchCashRemittanceSummary } from "lib/redux/cashRemittanceSlice"
import CashManagmentInfo from "components/CashManagmentInfo/CashManagementInfo"

// Dropdown Popover Component
const DropdownPopover = ({
  options,
  selectedValue,
  onSelect,
  children,
}: {
  options: { value: number; label: string }[]
  selectedValue: number
  onSelect: (value: number) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {children}
        <svg
          className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left ${
                  option.value === selectedValue ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
            <div className="size-6 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
          <div className="flex flex-col items-end justify-between gap-3 pt-4">
            <div className="flex w-full justify-between">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-6 w-16 rounded bg-gray-200"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function CashManagementDashboard() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // Default 8 minutes (480,000 ms)
  const [isLoading, setIsLoading] = useState(true)

  // Get cash remittance data from Redux store
  const cashRemittance = useSelector((state: RootState) => state.cashRemittance)

  useEffect(() => {
    const fetchCashRemittance = async () => {
      try {
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

        await dispatch(
          fetchCashRemittanceSummary({
            startUtc: startOfDay,
            endUtc: endOfDay,
          })
        ).unwrap()
      } catch (error) {
        console.error("Failed to fetch cash remittance:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCashRemittance()
  }, [dispatch])

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh cash remittance data after adding customer
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    dispatch(
      fetchCashRemittanceSummary({
        startUtc: startOfDay,
        endUtc: endOfDay,
      })
    )
  }

  const handleRefreshData = useCallback(() => {
    setIsLoading(true)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    dispatch(
      fetchCashRemittanceSummary({
        startUtc: startOfDay,
        endUtc: endOfDay,
      })
    ).finally(() => {
      setIsLoading(false)
    })
  }, [dispatch])

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Polling interval options - 8 minutes as default
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 600000, label: "10m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      handleRefreshData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, isPolling, pollingInterval, handleRefreshData])

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const showLoading = isLoading || cashRemittance.summaryLoading

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 2xl:container md:px-4 lg:px-6 2xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="md:m4-8 my-4 flex w-full items-start justify-between  gap-6  max-md:flex-col ">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cash Management</h1>
                <p className="mt-2 text-gray-600">Monitor cash remittance and collection data</p>
                {cashRemittance.summaryError && (
                  <div className="mt-2 text-sm text-red-600">
                    Error loading cash remittance: {cashRemittance.summaryError}
                  </div>
                )}
              </div>

              {/* Polling Controls */}
              <div className="flex items-center gap-2 rounded-md border-r bg-white p-2 pr-3">
                <span className="text-sm font-medium text-gray-500">Auto-refresh:</span>
                <button
                  onClick={togglePolling}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isPolling
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {isPolling ? (
                    <>
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      ON
                    </>
                  ) : (
                    <>
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      OFF
                    </>
                  )}
                </button>

                {isPolling && (
                  <DropdownPopover
                    options={pollingOptions}
                    selectedValue={pollingInterval}
                    onSelect={handlePollingIntervalChange}
                  >
                    {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                  </DropdownPopover>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 max-md:flex-col">
              <div className="w-full">
                {showLoading ? (
                  // Loading State
                  <SkeletonLoader />
                ) : (
                  // Loaded State - Cash Management Dashboard
                  <>
                    <motion.div
                      className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Total Collected Card */}
                      <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                          <div className="text-green-600">
                            <VendingIcon />
                          </div>
                          <span className="font-medium">Total Collected</span>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Amount:</p>
                            <p className="text-secondary text-xl font-bold">
                              {cashRemittance.summaryLoading ? (
                                <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                              ) : cashRemittance.summaryError ? (
                                <span className="text-red-500">Error</span>
                              ) : (
                                formatNumber(cashRemittance.summary?.totalCollected || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Total Remitted Card */}
                      <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                          <div className="text-blue-600">
                            <VendingIcon />
                          </div>
                          <span className="font-medium">Total Remitted</span>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Amount:</p>
                            <p className="text-secondary text-xl font-bold">
                              {cashRemittance.summaryLoading ? (
                                <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                              ) : cashRemittance.summaryError ? (
                                <span className="text-red-500">Error</span>
                              ) : (
                                formatNumber(cashRemittance.summary?.totalRemitted || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Cash at Office Card */}
                      <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                          <div className="text-orange-600">
                            <VendingIcon />
                          </div>
                          <span className="font-medium">Cash at Office</span>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Amount:</p>
                            <p className="text-secondary text-xl font-bold">
                              {cashRemittance.summaryLoading ? (
                                <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                              ) : cashRemittance.summaryError ? (
                                <span className="text-red-500">Error</span>
                              ) : (
                                formatNumber(cashRemittance.summary?.totalCashAtOffice || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <CashManagmentInfo />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstallMeterModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
    </section>
  )
}
