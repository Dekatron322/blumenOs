"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useState } from "react"
import AddCustomerModal from "components/ui/Modal/add-customer-modal"
import { motion } from "framer-motion"
import {
  BillingIcon,
  CustomeraIcon,
  MetersProgrammedIcon,
  PlusIcon,
  PostpaidIcon,
  RefreshCircleIcon,
  TamperIcon,
  TokenGeneratedIcon,
  VendingIcon,
} from "components/Icons/Icons"
import AllCustomers from "components/Tables/AllCustomers"
import MeteringInfo from "components/MeteringInfo/MeteringInfo"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
      {[...Array(4)].map((_, index) => (
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
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Skeleton for Customer Categories
const CategoriesSkeleton = () => {
  return (
    <div className="w-80 rounded-md border bg-white p-5">
      <div className="border-b pb-4">
        <div className="h-6 w-40 rounded bg-gray-200"></div>
      </div>

      <div className="mt-4 space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 rounded bg-gray-200"></div>
                <div className="h-5 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-6 rounded-lg bg-gray-50 p-3">
        <div className="mb-2 h-5 w-20 rounded bg-gray-200"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-4 w-12 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Skeleton for the table and grid view
const TableSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex gap-4">
          <div className="h-10 w-80 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-5 w-32 rounded bg-gray-200"></div>
                  <div className="mt-1 flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                    <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                  </div>
                </div>
              </div>
              <div className="size-6 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-gray-200"></div>
                  <div className="h-4 w-16 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// List View Skeleton
const ListSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex gap-4">
          <div className="h-10 w-80 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>

      {/* List View Skeleton */}
      <div className="divide-y">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-40 rounded bg-gray-200"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                      <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 w-24 rounded bg-gray-200"></div>
                    ))}
                  </div>
                  <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 rounded bg-gray-200"></div>
                  <div className="size-6 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// Main Loading Component
const LoadingState = ({ showCategories = true }) => {
  return (
    <div className="flex-3 relative mt-5 flex items-start gap-6">
      {showCategories ? (
        <>
          <TableSkeleton />
          <CategoriesSkeleton />
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

// Generate mock meter data
const generateMeterData = () => {
  return {
    smartMeters: 89420,
    conventionalMeters: 29514,
    readSuccessRate: 94.2,
    alerts: 847,
    totalMeters: 89420 + 29514,
  }
}

export default function MeteringDashboard() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [meterData, setMeterData] = useState(generateMeterData())

  // Use mock data
  const { smartMeters, conventionalMeters, readSuccessRate, alerts, totalMeters } = meterData

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh data after adding customer
    setMeterData(generateMeterData())
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setMeterData(generateMeterData())
      setIsLoading(false)
    }, 1000)
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Metering & AMI</h4>
                <p>Advanced Metering Infrastructure and meter management</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="flex items-center gap-2 rounded-md bg-[#004B23] px-4 py-2 text-white focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#000000]"
                >
                  <PlusIcon />
                  Install Meter
                </button>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {isLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State - Redesigned Metering Dashboard
                  <>
                    <motion.div
                      className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex w-full max-sm:flex-col">
                        <div className="w-full">
                          <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
                            {/* Smart Meters Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-blue-600">
                                  <TokenGeneratedIcon />
                                </div>
                                <span className="font-medium">Smart Meters</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Installed:</p>
                                  <p className="text-secondary text-xl font-bold">{formatNumber(smartMeters)}</p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Percentage:</p>
                                  <p className="text-secondary font-medium">
                                    {totalMeters > 0 ? `${Math.round((smartMeters / totalMeters) * 100)}%` : "0%"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Conventional Meters Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-green-600">
                                  <MetersProgrammedIcon />
                                </div>
                                <span className="font-medium">Conventional</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Installed:</p>
                                  <p className="text-secondary text-xl font-bold">{formatNumber(conventionalMeters)}</p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Percentage:</p>
                                  <p className="text-secondary font-medium">
                                    {totalMeters > 0
                                      ? `${Math.round((conventionalMeters / totalMeters) * 100)}%`
                                      : "0%"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Read Success Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-green-600">
                                  <VendingIcon />
                                </div>
                                <span className="font-medium">Read Success</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Success Rate:</p>
                                  <p className="text-secondary text-xl font-bold">{readSuccessRate}%</p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Status:</p>
                                  <div className="flex items-center gap-1">
                                    <div
                                      className={`size-2 rounded-full ${
                                        readSuccessRate >= 90
                                          ? "bg-green-500"
                                          : readSuccessRate >= 80
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                    ></div>
                                    <p className="text-secondary font-medium">
                                      {readSuccessRate >= 90
                                        ? "Excellent"
                                        : readSuccessRate >= 80
                                        ? "Good"
                                        : "Needs Attention"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Alerts Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-red-600">
                                  <TamperIcon />
                                </div>
                                <span className="font-medium">Alerts</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Active Alerts:</p>
                                  <div className="flex gap-1">
                                    <p className="text-secondary text-xl font-bold">{formatNumber(alerts)}</p>
                                    <ArrowIcon />
                                  </div>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Trend:</p>
                                  <p className="text-secondary font-medium">
                                    <span className="text-red-500">↑ 12%</span> from last week
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Additional Metrics Summary
                                      <motion.div
                                        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                      >
                                        <div className="rounded-lg bg-blue-50 p-4">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm font-medium text-blue-800">Total Meters</p>
                                              <p className="text-2xl font-bold text-blue-900">{formatNumber(totalMeters)}</p>
                                            </div>
                                            <div className="rounded-full bg-blue-100 p-2">
                                              <SmartMeterIcon />
                                            </div>
                                          </div>
                                          <p className="mt-2 text-xs text-blue-600">All installed meters in the system</p>
                                        </div>
                  
                                        <div className="rounded-lg bg-green-50 p-4">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm font-medium text-green-800">AMI Coverage</p>
                                              <p className="text-2xl font-bold text-green-900">
                                                {totalMeters > 0 ? Math.round((smartMeters / totalMeters) * 100) : 0}%
                                              </p>
                                            </div>
                                            <div className="rounded-full bg-green-100 p-2">
                                              <SuccessIcon />
                                            </div>
                                          </div>
                                          <p className="mt-2 text-xs text-green-600">Advanced Metering Infrastructure penetration</p>
                                        </div>
                  
                                        <div className="rounded-lg bg-orange-50 p-4">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm font-medium text-orange-800">Avg. Daily Reads</p>
                                              <p className="text-2xl font-bold text-orange-900">
                                                {formatNumber(Math.round(totalMeters * 0.87))}
                                              </p>
                                            </div>
                                            <div className="rounded-full bg-orange-100 p-2">
                                              <ConventionalMeterIcon />
                                            </div>
                                          </div>
                                          <p className="mt-2 text-xs text-orange-600">Successful meter readings per day</p>
                                        </div>
                                      </motion.div> */}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <MeteringInfo />
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
