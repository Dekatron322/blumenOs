"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchBillingSchedules } from "lib/redux/billingPeriodsSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  FileDown,
  FilePlus,
  FileText,
  PartyPopper,
  Printer,
  RefreshCw,
  RotateCcw,
  XCircle,
  Zap,
} from "lucide-react"

// Enum for billing schedule run step types
enum PostpaidBillingScheduleRunStepType {
  CreateBills = 0,
  ApplyOverrides = 1,
  RecomputeBills = 2,
  FinalizeBills = 3,
  ReadyForPrint = 4,
  GeneratePdfs = 5,
  ZipOutput = 6,
  ExportAr = 7,
  Complete = 8,
}

const GenerateBillPage = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Helper function to get schedule type name and styling
  const getScheduleTypeInfo = (scheduleType: number) => {
    const typeMap: {
      [key: number]: { name: string; bgColor: string; textColor: string; icon: React.ComponentType<any> }
    } = {
      0: {
        name: "Create Bills",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: FilePlus,
      },
      1: {
        name: "Apply Overrides",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
        icon: Zap,
      },
      2: {
        name: "Recompute Bills",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        icon: RotateCcw,
      },
      3: {
        name: "Finalize Bills",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: CheckSquare,
      },
      4: {
        name: "Ready For Print",
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-800",
        icon: Printer,
      },
      5: {
        name: "Generate PDFs",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: FileDown,
      },
      6: {
        name: "Zip Output",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        icon: Archive,
      },
      7: {
        name: "Export AR",
        bgColor: "bg-pink-100",
        textColor: "text-pink-800",
        icon: BarChart3,
      },
      8: {
        name: "Complete",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-800",
        icon: PartyPopper,
      },
    }
    return (
      typeMap[scheduleType] || {
        name: `Type ${scheduleType}`,
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        icon: FileText,
      }
    )
  }

  // Helper function to get step name and styling
  const getStepInfo = (step: number) => {
    const stepMap: { [key: number]: { name: string; color: string } } = {
      0: { name: "Create Bills", color: "blue" },
      1: { name: "Apply Overrides", color: "purple" },
      2: { name: "Recompute Bills", color: "orange" },
      3: { name: "Finalize Bills", color: "green" },
      4: { name: "Ready For Print", color: "indigo" },
      5: { name: "Generate PDFs", color: "red" },
      6: { name: "Zip Output", color: "yellow" },
      7: { name: "Export AR", color: "pink" },
      8: { name: "Complete", color: "emerald" },
    }
    return stepMap[step] || { name: `Stage ${step}`, color: "gray" }
  }

  // Redux state for billing schedules
  const { billingSchedules, billingSchedulesLoading, billingSchedulesError, billingSchedulesSuccess } = useAppSelector(
    (state: { billingPeriods: any }) => state.billingPeriods
  )

  // Local state
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)

  // Fetch billing schedules on component mount
  useEffect(() => {
    dispatch(fetchBillingSchedules())
  }, [dispatch])

  // Handle billing schedules success/error
  useEffect(() => {
    if (billingSchedulesSuccess) {
      console.log("Billing schedules fetched successfully:", billingSchedules)
    }
    if (billingSchedulesError) {
      console.error("Error fetching billing schedules:", billingSchedulesError)
      notify("error", "Failed to load billing schedules", {
        description: billingSchedulesError,
      })
    }
  }, [billingSchedulesSuccess, billingSchedulesError, billingSchedules])

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchBillingSchedules())
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get run status color and text
  const getRunStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { color: "yellow", text: "Running", icon: Clock }
      case 1:
        return { color: "green", text: "Completed", icon: CheckCircle }
      default:
        return { color: "red", text: "Failed", icon: XCircle }
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Billing Schedule Templates</h1>
                    <p className="mt-1 text-sm text-gray-600">Manage and monitor billing schedule blueprints</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={billingSchedulesLoading}
                    icon={<RefreshCw className={`size-4 ${billingSchedulesLoading ? "animate-spin" : ""}`} />}
                  >
                    {billingSchedulesLoading ? "Refreshing..." : "Refresh"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Stats Cards */}

              {/* Billing Schedules Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-xl bg-white shadow-lg"
              >
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Billing Schedule Blueprints</h2>
                      <p className="text-sm text-gray-600">
                        Available billing schedule configurations and their status
                      </p>
                    </div>
                  </div>

                  {billingSchedulesLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading billing schedules...</span>
                    </div>
                  )}

                  {billingSchedulesError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center">
                        <AlertCircle className="mr-2 size-5 text-red-600" />
                        <div>
                          <h3 className="text-sm font-medium text-red-800">Error loading billing schedules</h3>
                          <p className="mt-1 text-sm text-red-600">{billingSchedulesError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!billingSchedulesLoading && !billingSchedulesError && billingSchedules.length === 0 && (
                    <div className="py-12 text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">No billing schedules found</h3>
                      <p className="text-gray-600">There are currently no billing schedule blueprints available.</p>
                    </div>
                  )}

                  {!billingSchedulesLoading && !billingSchedulesError && billingSchedules.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {billingSchedules.map((schedule: any, index: number) => (
                        <motion.div
                          key={schedule.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
                        >
                          {/* Card Header */}
                          <div className="border-b border-gray-100 p-6">
                            <div className="mb-4 flex items-start justify-between">
                              <div className="flex items-center">
                                <Calendar className="size-6 text-blue-600" />

                                <div className="ml-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  schedule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {schedule.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <p className="line-clamp-2 text-sm text-gray-600">
                              {schedule.description || "No description available"}
                            </p>
                          </div>

                          {/* Card Body - Run Progress */}
                          <div className="bg-gray-50 p-6">
                            {schedule.latestRunProgress ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Latest Run</span>
                                  {(() => {
                                    const statusInfo = getRunStatusInfo(schedule.latestRunProgress.runStatus)
                                    const Icon = statusInfo.icon
                                    return (
                                      <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
                                      >
                                        <Icon className="mr-1 size-3" />
                                        {statusInfo.text}
                                      </span>
                                    )
                                  })()}
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>{schedule.latestRunProgress.runTitle}</span>
                                    <span>
                                      {schedule.latestRunProgress.processedStages}/
                                      {schedule.latestRunProgress.totalStages} stages
                                    </span>
                                  </div>

                                  {/* Overall Progress Bar */}
                                  <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div
                                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                      style={{
                                        width: `${
                                          (schedule.latestRunProgress.processedStages /
                                            schedule.latestRunProgress.totalStages) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>

                                  {/* Individual Stages */}
                                  <div className="mt-3 space-y-1">
                                    {schedule.latestRunProgress.stages
                                      .slice(0, 3)
                                      .map((stage: any, stageIndex: number) => {
                                        const stepInfo = getStepInfo(stage.stage)
                                        return (
                                          <div key={stageIndex} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">{stepInfo.name}</span>
                                            <div className="flex items-center space-x-2">
                                              <span className="text-gray-400">
                                                {stage.processed}/{stage.total}
                                              </span>
                                              <div className="h-1 w-12 rounded-full bg-gray-200">
                                                <div
                                                  className={`bg-${stepInfo.color}-500 h-1 rounded-full transition-all duration-300`}
                                                  style={{ width: `${(stage.processed / stage.total) * 100}%` }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    {schedule.latestRunProgress.stages.length > 3 && (
                                      <div className="text-center text-xs text-gray-400">
                                        +{schedule.latestRunProgress.stages.length - 3} more stages
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="py-4 text-center">
                                <Clock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                <p className="text-sm text-gray-500">No runs yet</p>
                              </div>
                            )}
                          </div>

                          {/* Card Footer */}
                          <div className="flex flex-col gap-4 border-t border-gray-100 bg-white p-4">
                            <div className="text-xs text-gray-500">Updated {formatDate(schedule.lastUpdated)}</div>
                            <div className="flex items-center justify-between">
                              <ButtonModule
                                className="w-full"
                                variant="outline"
                                size="md"
                                onClick={() => router.push(`/billing/generate/${schedule.id}`)}
                              >
                                View Details
                              </ButtonModule>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Schedule Details Modal */}
      {selectedSchedule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedSchedule(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{selectedSchedule.name}</h3>
              <button onClick={() => setSelectedSchedule(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Schedule ID</label>
                  <p className="text-sm text-gray-900">{selectedSchedule.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Schedule Type</label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        getScheduleTypeInfo(selectedSchedule.scheduleType).bgColor
                      } ${getScheduleTypeInfo(selectedSchedule.scheduleType).textColor}`}
                    >
                      {(() => {
                        const Icon = getScheduleTypeInfo(selectedSchedule.scheduleType).icon
                        return <Icon className="mr-2 size-4" />
                      })()}
                      {getScheduleTypeInfo(selectedSchedule.scheduleType).name}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        selectedSchedule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedSchedule.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSchedule.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedSchedule.description || "No description available"}
                </p>
              </div>

              {selectedSchedule.latestRunProgress && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Latest Run Progress</label>
                  <div className="mt-2 rounded-lg bg-gray-50 p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Run ID</p>
                        <p className="text-sm font-medium">{selectedSchedule.latestRunProgress.runId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Run Title</p>
                        <p className="text-sm font-medium">{selectedSchedule.latestRunProgress.runTitle}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Period</p>
                        <p className="text-sm font-medium">{selectedSchedule.latestRunProgress.period}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Progress</p>
                        <p className="text-sm font-medium">
                          {selectedSchedule.latestRunProgress.processedStages}/
                          {selectedSchedule.latestRunProgress.totalStages} stages
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500">Stages Progress</p>
                      {selectedSchedule.latestRunProgress.stages.map((stage: any, index: number) => {
                        const stepInfo = getStepInfo(stage.stage)
                        return (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700">{stepInfo.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">
                                {stage.processed}/{stage.total}
                              </span>
                              <div className="h-2 w-16 rounded-full bg-gray-200">
                                <div
                                  className={`bg-${stepInfo.color}-500 h-2 rounded-full transition-all duration-300`}
                                  style={{ width: `${(stage.processed / stage.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <ButtonModule variant="outline" onClick={() => setSelectedSchedule(null)}>
                Close
              </ButtonModule>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}

export default GenerateBillPage
