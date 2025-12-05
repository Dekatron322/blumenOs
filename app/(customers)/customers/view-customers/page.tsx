"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AddCustomerIcon,
  BillingIcon,
  CustomeraIcon,
  PostpaidIcon,
  RefreshCircleIcon,
  VendingIcon,
} from "components/Icons/Icons"
import AllCustomers from "components/Tables/AllCustomers"
import { ButtonModule } from "components/ui/Button/Button"

import { clearCustomerAnalytics, fetchCustomerAnalytics } from "lib/redux/analyticsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import ViewAllCustomers from "components/Tables/ViewAllCustomers"

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

export default function AllTransactions() {
  const router = useRouter()

  // Redux hooks
  const dispatch = useAppDispatch()
  const { customerAnalyticsData, customerAnalyticsLoading, customerAnalyticsError, customerAnalyticsSuccess } =
    useAppSelector((state) => state.analytics)

  // Fetch customer analytics on component mount
  useEffect(() => {
    dispatch(fetchCustomerAnalytics())
  }, [dispatch])

  const handleRefreshData = () => {
    dispatch(clearCustomerAnalytics())
    dispatch(fetchCustomerAnalytics())
  }

  const handleGoToAddCustomerPage = () => {
    router.push("/customers/add-customers")
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
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
                <h4 className="text-2xl font-semibold">Customer Management</h4>
                <p>Manage customer accounts, KYC, and service connections</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="outline"
                  size="md"
                  onClick={handleGoToAddCustomerPage}
                  icon={<AddCustomerIcon />}
                  iconPosition="start"
                >
                  Add Customer
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleRefreshData}
                  icon={<RefreshCircleIcon />}
                  iconPosition="start"
                  disabled={customerAnalyticsLoading}
                >
                  {customerAnalyticsLoading ? "Refreshing..." : "Refresh Data"}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Error Message */}
            {customerAnalyticsError && (
              <motion.div
                className="mx-16 mb-4 rounded-md bg-red-50 p-4 text-red-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p>Error loading customer analytics: {customerAnalyticsError}</p>
              </motion.div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {customerAnalyticsLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                  </>
                ) : (
                  // Loaded State
                  <>
                    {customerAnalyticsData && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <ViewAllCustomers />
                        </motion.div>
                      </>
                    )}

                    {/* Empty State */}
                    {!customerAnalyticsData && !customerAnalyticsLoading && !customerAnalyticsError && (
                      <motion.div
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="text-center">
                          <CustomeraIcon />
                          <h3 className="mt-4 text-lg font-medium text-gray-900">No Customer Data</h3>
                          <p className="mt-2 text-sm text-gray-500">
                            No customer analytics data available. Try refreshing the data.
                          </p>
                          <ButtonModule
                            variant="primary"
                            size="md"
                            onClick={handleRefreshData}
                            className="mt-4"
                            icon={<RefreshCircleIcon />}
                            iconPosition="start"
                          >
                            Refresh Data
                          </ButtonModule>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
