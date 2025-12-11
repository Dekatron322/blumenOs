"use client"

import { ButtonModule } from "components/ui/Button/Button"
import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { fetchPaymentDunningCases, PaymentDunningCase } from "lib/redux/paymentDunningSlice"
import { motion, AnimatePresence } from "framer-motion"
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi"

const DunningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path
      d="M10 15C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13C9.44772 13 9 13.4477 9 14C9 14.5523 9.44772 15 10 15Z"
      fill="currentColor"
    />
    <path
      d="M10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z"
      fill="currentColor"
    />
  </svg>
)

interface DunningStage {
  id: number
  title: string
  description: string
  customerCount: number
  actionText: string
  status: "warning" | "danger" | "critical" | "info"
  stage: "SoftReminder" | "HardReminder" | "FieldVisit" | "DisconnectionNotice"
  statusFilter: "Open" | "OnHold" | "Resolved" | "Cancelled" | null
}

interface DunningManagementProps {
  onSendSMS?: () => void
  onSendFinalNotices?: () => void
  onGenerateWorkOrders?: () => void
  onReviewPlans?: () => void
  onViewCases?: (stage: DunningStage) => void
}

const DunningManagement: React.FC<DunningManagementProps> = ({
  onSendSMS,
  onSendFinalNotices,
  onGenerateWorkOrders,
  onReviewPlans,
  onViewCases,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { dunningCases, loading, pagination } = useSelector((state: RootState) => state.paymentDunnings)

  const [dunningStages, setDunningStages] = useState<DunningStage[]>([
    {
      id: 1,
      title: "Soft Reminder",
      description: "Initial reminder stage",
      customerCount: 0,
      actionText: "View Cases",
      status: "warning",
      stage: "SoftReminder",
      statusFilter: "Open",
    },
    {
      id: 2,
      title: "Hard Reminder",
      description: "Stronger follow-up required",
      customerCount: 0,
      actionText: "View Cases",
      status: "danger",
      stage: "HardReminder",
      statusFilter: "Open",
    },
    {
      id: 3,
      title: "Field Visit",
      description: "Physical visit required",
      customerCount: 0,
      actionText: "View Cases",
      status: "critical",
      stage: "FieldVisit",
      statusFilter: "Open",
    },
    {
      id: 4,
      title: "Disconnection Notice",
      description: "Final notice before disconnection",
      customerCount: 0,
      actionText: "View Cases",
      status: "critical",
      stage: "DisconnectionNotice",
      statusFilter: "Open",
    },
    {
      id: 5,
      title: "On Hold Cases",
      description: "Cases temporarily paused",
      customerCount: 0,
      actionText: "View Cases",
      status: "info",
      stage: null as any,
      statusFilter: "OnHold",
    },
    {
      id: 6,
      title: "Resolved Cases",
      description: "Successfully completed cases",
      customerCount: 0,
      actionText: "View Cases",
      status: "info",
      stage: null as any,
      statusFilter: "Resolved",
    },
  ])

  const [showSummaryStats, setShowSummaryStats] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const hasFetchedRef = useRef(false)

  // Fetch dunning cases on component mount (guarded for Strict Mode)
  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    const fetchAllDunningCases = async () => {
      setIsLoading(true)
      try {
        await dispatch(
          fetchPaymentDunningCases({
            pageNumber: 1,
            pageSize: 1000,
          })
        ).unwrap()
      } catch (error) {
        console.error("Failed to fetch dunning cases:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllDunningCases()
  }, [dispatch])

  // Update stage counts when dunning cases change
  useEffect(() => {
    if (dunningCases.length > 0) {
      const updatedStages = dunningStages.map((stage) => {
        let count = 0

        if (stage.stage && stage.statusFilter) {
          count = dunningCases.filter(
            (caseItem) => caseItem.stage === stage.stage && caseItem.status === stage.statusFilter
          ).length
        } else if (stage.stage) {
          count = dunningCases.filter((caseItem) => caseItem.stage === stage.stage).length
        } else if (stage.statusFilter) {
          count = dunningCases.filter((caseItem) => caseItem.status === stage.statusFilter).length
        }

        return {
          ...stage,
          customerCount: count,
        }
      })

      setDunningStages(updatedStages)
    }
  }, [dunningCases])

  // Auto-hide summary stats on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSummaryStats(false)
      } else {
        setShowSummaryStats(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "warning":
        return "border-l-2 md:border-l-4 border-l-yellow-500"
      case "danger":
        return "border-l-2 md:border-l-4 border-l-orange-500"
      case "critical":
        return "border-l-2 md:border-l-4 border-l-red-500"
      case "info":
        return "border-l-2 md:border-l-4 border-l-blue-500"
      default:
        return "border-l-2 md:border-l-4 border-l-gray-500"
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "warning":
        return "text-yellow-600"
      case "danger":
        return "text-orange-600"
      case "critical":
        return "text-red-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "warning":
        return "bg-yellow-500"
      case "danger":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getButtonVariant = (status: string) => {
    switch (status) {
      case "warning":
        return "primary"
      case "danger":
        return "primary"
      case "critical":
        return "danger"
      case "info":
        return "primary"
      default:
        return "primary"
    }
  }

  const handleStageAction = (stage: DunningStage) => {
    if (onViewCases) {
      onViewCases(stage)
    } else {
      console.log(`Viewing cases for stage: ${stage.title}`, {
        stage: stage.stage,
        status: stage.statusFilter,
      })
    }
  }

  const totalCustomers = dunningStages.reduce((total, stage) => total + stage.customerCount, 0)

  const StageCard = ({ stage, index }: { stage: DunningStage; index: number }) => (
    <motion.div
      key={stage.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-lg border bg-[#F9F9F9] p-3 shadow-sm transition-all hover:shadow-md md:p-4 lg:p-6"
    >
      {/* Stage Header */}
      <div className="mb-2 md:mb-4">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-900 md:text-base lg:text-lg">{stage.title}</h3>
          <div
            className={`rounded-full px-1.5 py-0.5 text-xs font-medium md:px-2 md:py-1 ${getStatusTextColor(
              stage.status
            )} ${getStatusBgColor(stage.status).replace("bg-", "bg-")} bg-opacity-10`}
          >
            {stage.customerCount}
          </div>
        </div>
        <p className={`text-xs font-medium md:text-sm ${getStatusTextColor(stage.status)}`}>{stage.description}</p>
      </div>

      {/* Customer Count */}
      <div className="mb-3 md:mb-6">
        <div className="text-lg font-bold text-gray-900 md:text-xl lg:text-2xl">
          {stage.customerCount.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 md:text-sm">cases</div>
      </div>

      {/* Action Button */}
      <ButtonModule
        variant={getButtonVariant(stage.status)}
        size="sm"
        onClick={() => handleStageAction(stage)}
        className="w-full text-xs md:text-sm"
        disabled={stage.customerCount === 0}
      >
        {stage.actionText}
      </ButtonModule>

      {/* Progress Indicator */}
      <div className="mt-3 md:mt-4">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-gray-500">Progress</span>
          <span className="text-gray-700">
            {totalCustomers > 0 ? Math.round((stage.customerCount / totalCustomers) * 100) : 0}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 md:h-2">
          <div
            className={`h-full rounded-full ${getStatusBgColor(stage.status)}`}
            style={{
              width: `${totalCustomers > 0 ? (stage.customerCount / totalCustomers) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Stage Details */}
      <div className="mt-2 text-xs text-gray-500 md:mt-3">
        {stage.stage && (
          <div className="truncate">
            Stage: <span className="font-medium">{stage.stage}</span>
          </div>
        )}
        {stage.statusFilter && (
          <div>
            Status: <span className="font-medium">{stage.statusFilter}</span>
          </div>
        )}
      </div>
    </motion.div>
  )

  const StatItem = ({ value, label, index }: { value: number; label: string; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="text-base font-bold text-gray-900 md:text-lg lg:text-2xl">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-600 md:text-sm">{label}</div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 bg-white p-3 md:space-y-6 md:p-4 lg:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-blue-600">
            <DunningIcon />
          </div>
          <div>
            <h2 className="text-base font-semibold md:text-lg lg:text-xl">Payment Dunning Management</h2>
            <div className="mt-1 text-xs text-gray-500 md:text-sm">
              Manage overdue payments and collection processes
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end">
          <div className="text-xs text-gray-500 md:text-sm">
            Total Cases: <span className="font-semibold text-gray-800">{totalCustomers.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowSummaryStats(!showSummaryStats)}
            className="ml-3 flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs hover:bg-gray-50 md:hidden"
            aria-label="Toggle summary stats"
          >
            <span>Stats</span>
            {showSummaryStats ? <HiOutlineChevronUp className="size-3" /> : <HiOutlineChevronDown className="size-3" />}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg border bg-gray-50 p-4 text-center">
          <div className="text-sm text-blue-500 md:text-base">Loading dunning cases...</div>
        </div>
      )}

      {/* Dunning Stages Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {dunningStages.map((stage, index) => (
          <StageCard key={stage.id} stage={stage} index={index} />
        ))}
      </div>

      {/* Summary Stats */}
      <AnimatePresence>
        {showSummaryStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border bg-gray-50 p-3 md:mt-6 md:grid-cols-4 md:gap-4 md:p-4">
              <StatItem
                value={dunningStages
                  .filter((s) => s.statusFilter === "Open")
                  .reduce((total, s) => total + s.customerCount, 0)}
                label="Open Cases"
                index={0}
              />
              <StatItem
                value={dunningStages
                  .filter((s) => s.statusFilter === "OnHold")
                  .reduce((total, s) => total + s.customerCount, 0)}
                label="On Hold"
                index={1}
              />
              <StatItem
                value={dunningStages
                  .filter((s) => s.statusFilter === "Resolved")
                  .reduce((total, s) => total + s.customerCount, 0)}
                label="Resolved"
                index={2}
              />
              <StatItem
                value={dunningCases.filter((c) => c.status === "Cancelled").length}
                label="Cancelled"
                index={3}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions - Mobile */}
      {/* <div className="sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          <ButtonModule variant="outline" size="sm" onClick={onSendSMS} className="text-xs">
            Send SMS
          </ButtonModule>
          <ButtonModule variant="outline" size="sm" onClick={onSendFinalNotices} className="text-xs">
            Final Notices
          </ButtonModule>
          <ButtonModule variant="outline" size="sm" onClick={onGenerateWorkOrders} className="text-xs">
            Work Orders
          </ButtonModule>
          <ButtonModule variant="outline" size="sm" onClick={onReviewPlans} className="text-xs">
            Review Plans
          </ButtonModule>
        </div>
      </div> */}

      {/* Quick Actions - Desktop */}
      {/* <div className="hidden sm:block">
        <div className="flex flex-wrap gap-2">
          <ButtonModule variant="outline" size="sm" onClick={onSendSMS} className="text-sm">
            Send SMS Reminders
          </ButtonModule>
          <ButtonModule variant="outline" size="sm" onClick={onSendFinalNotices} className="text-sm">
            Send Final Notices
          </ButtonModule>
          <ButtonModule variant="outline" size="sm" onClick={onGenerateWorkOrders} className="text-sm">
            Generate Work Orders
          </ButtonModule>
          <ButtonModule variant="outline" size="sm" onClick={onReviewPlans} className="text-sm">
            Review Collection Plans
          </ButtonModule>
        </div>
      </div> */}

      {/* Toggle Stats Button - Mobile */}
      {/* <button
        onClick={() => setShowSummaryStats(!showSummaryStats)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-medium text-white shadow-lg hover:bg-blue-700 md:hidden"
        aria-label="Toggle summary stats"
      >
        <span>{showSummaryStats ? "Hide" : "Show"} Stats</span>
        {showSummaryStats ? <HiOutlineChevronUp className="size-3" /> : <HiOutlineChevronDown className="size-3" />}
      </button> */}
    </motion.div>
  )
}

export default DunningManagement
