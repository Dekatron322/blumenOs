"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import AddCustomerModal from "components/ui/Modal/add-customer-modal"
import { motion } from "framer-motion"
import { RefreshCircleIcon } from "components/Icons/Icons"
import { useSelector } from "react-redux"
import { useAppDispatch } from "lib/hooks/useRedux"
import { RootState } from "lib/redux/store"
import { fetchPrepaidStats, fetchPrepaidSummaryAnalytics, PrepaidSummaryParams } from "lib/redux/analyticsSlice"
import PrepaidTransactionTable from "components/MeteringInfo/PrepaidTransaction"

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

// Prepaid Summary Analytics Component
const PrepaidSummaryAnalytics = () => {
  const dispatch = useAppDispatch()
  const {
    prepaidSummaryData,
    prepaidSummaryLoading,
    prepaidSummaryError,
    prepaidSummarySuccess,
    prepaidStatsData,
    prepaidStatsLoading,
    prepaidStatsError,
    prepaidStatsSuccess,
  } = useSelector((state: RootState) => state.analytics)

  useEffect(() => {
    // Fetch data for the last 30 days by default
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const params: PrepaidSummaryParams = {
      StartDateUtc: startDate,
      EndDateUtc: endDate,
    }

    dispatch(fetchPrepaidSummaryAnalytics(params))
    dispatch(fetchPrepaidStats())
  }, [dispatch])

  const handleRefresh = () => {
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const params: PrepaidSummaryParams = {
      StartDateUtc: startDate,
      EndDateUtc: endDate,
    }

    dispatch(fetchPrepaidSummaryAnalytics(params))
    dispatch(fetchPrepaidStats())
  }

  if (prepaidSummaryLoading || prepaidStatsLoading) {
    return (
      <div className="w-full rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Prepaid Analytics</h3>
          <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (prepaidSummaryError || prepaidStatsError) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-red-900">Prepaid Analytics</h3>
          <button
            onClick={handleRefresh}
            className="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
        <p className="mt-2 text-red-700">Error loading analytics data</p>
      </div>
    )
  }

  if (!prepaidSummaryData || !prepaidStatsData) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Summary Cards */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Prepaid Analytics Summary</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {formatDate(prepaidSummaryData.windowStartUtc)} - {formatDate(prepaidSummaryData.windowEndUtc)}
            </span>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-gray-100 p-1 hover:bg-gray-200"
              title="Refresh data"
            >
              <RefreshCircleIcon />
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Vends */}
            <div className="border-r border-gray-200 pr-6 last:border-r-0">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  <span className="text-sm font-medium">
                    {prepaidSummaryData.totals.totalVends > 0 ? "+8.3%" : "0%"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Total Vends</h3>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {prepaidSummaryData.totals.totalVends.toLocaleString()}
                </p>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Successful:</span>
                    <span>{prepaidSummaryData.totals.successfulVends.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span>{prepaidSummaryData.totals.failedVends.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="border-r border-gray-200 pr-6 last:border-r-0">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  <span className="text-sm font-medium">
                    {prepaidSummaryData.totals.successRatePercent >= 95 ? "+2.1%" : "+0.8%"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {prepaidSummaryData.totals.successRatePercent.toFixed(1)}%
                </p>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span>98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={
                        prepaidSummaryData.totals.successRatePercent >= 95 ? "text-green-600" : "text-amber-600"
                      }
                    >
                      {prepaidSummaryData.totals.successRatePercent >= 95 ? "Good" : "Needs Attention"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="border-r border-gray-200 pr-6 last:border-r-0">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  <span className="text-sm font-medium">
                    {prepaidSummaryData.totals.totalPaymentAmount > 0 ? "+15.2%" : "0%"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {formatCurrency(prepaidSummaryData.totals.totalPaymentAmount)}
                </p>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Average/Vend:</span>
                    <span>{formatCurrency(prepaidSummaryData.totals.averagePaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Period:</span>
                    <span>30 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total kWh */}
            <div className="last:border-r-0">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  <span className="text-sm font-medium">
                    {prepaidSummaryData.totals.totalKwh > 0 ? "+11.7%" : "0%"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Total kWh</h3>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {prepaidSummaryData.totals.totalKwh.toLocaleString()}
                </p>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Average/Vend:</span>
                    <span>{prepaidSummaryData.totals.averageKwhPerVend.toFixed(1)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tokens:</span>
                    <span>{prepaidSummaryData.totals.totalTokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prepaid Queue Stats */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-gray-900">Payment Queue Status</h4>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Live Status</span>
            <div className={`h-2 w-2 rounded-full ${prepaidStatsSuccess ? "bg-green-500" : "bg-gray-400"}`}></div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Pending Payments */}
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{prepaidStatsData.pendingPayments}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>

          {/* Processing Payments */}
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{prepaidStatsData.processingPayments}</p>
            <p className="text-sm text-gray-500">Processing</p>
          </div>

          {/* Retry Pending */}
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{prepaidStatsData.retryPending}</p>
            <p className="text-sm text-gray-500">Retry Pending</p>
          </div>

          {/* Redis Queue Length */}
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{prepaidStatsData.retryRedisLength}</p>
            <p className="text-sm text-gray-500">Retry Queue</p>
          </div>
        </div>

        {/* Retry Status Breakdown */}
        <div className="mt-6 border-t pt-4">
          <h5 className="mb-3 text-sm font-medium text-gray-900">Retry Status</h5>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Processing:</span>
              <span className="text-sm font-medium">{prepaidStatsData.retryProcessing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="text-sm font-medium text-green-600">{prepaidStatsData.retryCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Failed:</span>
              <span className="text-sm font-medium text-red-600">{prepaidStatsData.retryFailed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Disputed:</span>
              <span className="text-sm font-medium text-amber-600">{prepaidStatsData.retryDisputed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* By Channel */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-md font-semibold text-gray-900">By Channel</h4>
            {/* <div className="flex items-center gap-1 text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span className="text-sm font-medium">+12.5%</span>
            </div> */}
          </div>
          <div className="space-y-3">
            {prepaidSummaryData.byChannel.slice(0, 5).map((channel, index) => (
              <div key={index} className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{channel.channel}</p>
                    <p className="text-sm text-gray-600">{channel.totalVends} vends</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(channel.totalPaymentAmount)}</p>
                    <p className="text-sm text-gray-600">{channel.totalKwh.toLocaleString()} kWh</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="font-medium text-gray-900">
                      {channel.totalVends > 0
                        ? (((channel.successfulVends || channel.totalVends) / channel.totalVends) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Amount:</span>
                    <span className="font-medium text-gray-900">
                      {channel.totalVends > 0
                        ? formatCurrency(channel.totalPaymentAmount / channel.totalVends)
                        : formatCurrency(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg kWh:</span>
                    <span className="font-medium text-gray-900">
                      {channel.totalVends > 0 ? (channel.totalKwh / channel.totalVends).toFixed(1) : 0} kWh
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Agents */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-md font-semibold text-gray-900">Top Agents</h4>
            {/* <div className="flex items-center gap-1 text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span className="text-sm font-medium">+18.2%</span>
            </div> */}
          </div>
          <div className="space-y-3">
            {prepaidSummaryData.byAgent.slice(0, 5).map((agent, index) => (
              <div key={index} className="rounded-r-lg border-l-4 border-green-500 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{agent.agentName}</p>
                    <p className="text-sm text-gray-600">{agent.totalVends} vends</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(agent.totalPaymentAmount)}</p>
                    <p className="text-sm text-gray-600">{agent.totalKwh.toLocaleString()} kWh</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="font-medium text-gray-900">
                      {agent.totalVends > 0
                        ? (((agent.successfulVends || agent.totalVends) / agent.totalVends) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Amount:</span>
                    <span className="font-medium text-gray-900">
                      {agent.totalVends > 0
                        ? formatCurrency(agent.totalPaymentAmount / agent.totalVends)
                        : formatCurrency(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg kWh:</span>
                    <span className="font-medium text-gray-900">
                      {agent.totalVends > 0 ? (agent.totalKwh / agent.totalVends).toFixed(1) : 0} kWh
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend - Grid Layout */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-md font-semibold text-gray-900">Daily Trend (Last 7 Days)</h4>
          <div className="flex items-center gap-1 text-green-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <span className="text-sm font-medium">+6.8%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {prepaidSummaryData.daily.slice(-7).map((day, index) => (
            <div
              key={index}
              className={`rounded-lg border p-3 ${
                index === 6
                  ? "border-purple-200 bg-purple-50"
                  : index === 5
                  ? "border-blue-200 bg-blue-50"
                  : index === 4
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-900">{formatDate(day.bucketDate)}</p>
                <p className="text-xs text-gray-600">{day.totalVends} vends</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Revenue:</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(day.totalPaymentAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">kWh:</span>
                  <span className="text-sm font-medium text-gray-900">{day.totalKwh.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Success:</span>
                  <span className="text-xs font-medium text-gray-900">
                    {day.totalVends > 0
                      ? (((day.successfulVends || day.totalVends) / day.totalVends) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Avg:</span>
                  <span className="text-xs font-medium text-gray-900">
                    {day.totalVends > 0 ? formatCurrency(day.totalPaymentAmount / day.totalVends) : formatCurrency(0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Generate mock utility customer data
const generateUtilityCustomerData = () => {
  return {
    totalCustomers: Math.floor(125000 + Math.random() * 5000),
    activeCustomers: Math.floor(115000 + Math.random() * 4000),
    frozenCustomers: Math.floor(1500 + Math.random() * 500),
    inactiveCustomers: Math.floor(8500 + Math.random() * 2000),
    prepaidCustomers: Math.floor(85000 + Math.random() * 3000),
    postpaidCustomers: Math.floor(35000 + Math.random() * 2000),
    estimatedBillingCustomers: Math.floor(5000 + Math.random() * 1000),
  }
}

export default function AllTransactions() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customerData, setCustomerData] = useState(generateUtilityCustomerData())
  const [showAnalytics, setShowAnalytics] = useState(true)

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh data after adding customer
    setCustomerData(generateUtilityCustomerData())
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setCustomerData(generateUtilityCustomerData())
      setIsLoading(false)
    }, 1000)
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 2xl:container md:px-4 lg:px-6 2xl:px-6">
            {/* Page Header - Always Visible */}
            <div className="flex w-full items-start justify-between gap-6 max-md:flex-col  md:my-4 ">
              <div>
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">Prepaid & Token Vending</h4>
                <p className="text-sm sm:text-base">STS token generation and prepaid meter management</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    showAnalytics
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                </button>
                <button
                  onClick={handleRefreshData}
                  disabled={isLoading}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 ">
              <div className="w-full">
                {isLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State
                  <>
                    {/* Analytics Section - Conditional */}
                    {showAnalytics && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                      >
                        <PrepaidSummaryAnalytics />
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <PrepaidTransactionTable pageSize={30} />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
    </section>
  )
}
