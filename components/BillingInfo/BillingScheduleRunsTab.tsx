"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  BillingScheduleRunItem,
  clearBillingScheduleRunsStatus,
  fetchBillingScheduleRuns,
} from "lib/redux/postpaidSlice"
import ExportScheduleRunARModal from "components/ui/Modal/ExportScheduleRunARModal"
import DownloadScheduleRunPDFModal from "components/ui/Modal/DownloadScheduleRunPDFModal"
import { AlertCircle, CheckCircle, Clock, Download, FileText, Loader2, RefreshCw, User, XCircle } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"

interface BillingScheduleRunsTabProps {
  scheduleId: string | null
}

const getRunStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return "Pending"
    case 1:
      return "Running"
    case 2:
      return "Completed"
    case 3:
      return "Failed"
    case 4:
      return "Cancelled"
    default:
      return `Status ${status}`
  }
}

const getRunStatusColor = (status: number): string => {
  switch (status) {
    case 0:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case 1:
      return "bg-blue-100 text-blue-800 border-blue-200"
    case 2:
      return "bg-green-100 text-green-800 border-green-200"
    case 3:
      return "bg-red-100 text-red-800 border-red-200"
    case 4:
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getRunStatusIcon = (status: number) => {
  switch (status) {
    case 0:
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 1:
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
    case 2:
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 3:
      return <XCircle className="h-4 w-4 text-red-600" />
    case 4:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getStepTypeLabel = (stepType: number): string => {
  switch (stepType) {
    case 1:
      return "Generate Draft Bill"
    case 2:
      return "Publish Draft Bill"
    case 3:
      return "Export AR"
    case 4:
      return "Generate PDF"
    default:
      return `Step ${stepType}`
  }
}

const getBulkActionTypeLabel = (actionType: number): string => {
  switch (actionType) {
    case 1:
      return "Publish"
    case 2:
      return "Export AR"
    case 3:
      return "Generate PDF"
    default:
      return `Action ${actionType}`
  }
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return "—"
  }
}

const BillingScheduleRunsTab: React.FC<BillingScheduleRunsTabProps> = ({ scheduleId }) => {
  const dispatch = useAppDispatch()
  const { billingScheduleRuns, billingScheduleRunsLoading, billingScheduleRunsError, billingScheduleRunsSuccess } =
    useAppSelector((state: any) => state.postpaidBilling)

  const [expandedRunId, setExpandedRunId] = useState<number | null>(null)
  const [exportArRun, setExportArRun] = useState<BillingScheduleRunItem | null>(null)
  const [downloadPdfRunId, setDownloadPdfRunId] = useState<number | null>(null)

  useEffect(() => {
    const parsedId = scheduleId ? parseInt(scheduleId) : NaN
    if (!isNaN(parsedId)) {
      dispatch(fetchBillingScheduleRuns(parsedId))
    }
  }, [dispatch, scheduleId])

  useEffect(() => {
    return () => {
      dispatch(clearBillingScheduleRunsStatus())
    }
  }, [dispatch])

  const handleRefresh = () => {
    const parsedId = scheduleId ? parseInt(scheduleId) : NaN
    if (!isNaN(parsedId)) {
      dispatch(fetchBillingScheduleRuns(parsedId))
    }
  }

  const toggleExpand = (runId: number) => {
    setExpandedRunId(expandedRunId === runId ? null : runId)
  }

  const handleDownloadAR = (e: React.MouseEvent, run: BillingScheduleRunItem) => {
    e.stopPropagation()
    setExportArRun(run)
  }

  const handleDownloadPDF = (e: React.MouseEvent, run: BillingScheduleRunItem) => {
    e.stopPropagation()
    setDownloadPdfRunId(run.id)
  }

  if (billingScheduleRunsLoading && billingScheduleRuns.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading billing schedule runs...</p>
        </div>
      </div>
    )
  }

  if (billingScheduleRunsError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load schedule runs</p>
            <p className="mt-1 text-sm text-gray-500">{billingScheduleRunsError}</p>
          </div>
          <ButtonModule variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </ButtonModule>
        </div>
      </div>
    )
  }

  if (billingScheduleRunsSuccess && billingScheduleRuns.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900">No schedule runs found</p>
            <p className="mt-1 text-sm text-gray-500">
              No billing schedule runs have been created for this schedule yet.
            </p>
          </div>
          <ButtonModule variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </ButtonModule>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Schedule Runs</h2>
          <p className="text-sm text-gray-500">{billingScheduleRuns.length} run(s) found</p>
        </div>
        <ButtonModule variant="outline" size="sm" onClick={handleRefresh} disabled={billingScheduleRunsLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${billingScheduleRunsLoading ? "animate-spin" : ""}`} />
          Refresh
        </ButtonModule>
      </div>

      {/* Runs Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-8 px-4 py-3" />
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Period
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Progress
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Created By
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Created At
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {billingScheduleRuns.map((run: BillingScheduleRunItem) => {
              const isExpanded = expandedRunId === run.id
              const progressPercentage =
                run.jobProgress && run.jobProgress.totalCustomers > 0
                  ? Math.round((run.jobProgress.processedCustomers / run.jobProgress.totalCustomers) * 100)
                  : 0

              return (
                <React.Fragment key={run.id}>
                  {/* Table Row */}
                  <tr
                    onClick={() => toggleExpand(run.id)}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                  >
                    {/* Expand Icon */}
                    <td className="px-4 py-3">
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>

                    {/* Title */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {run.title || `Run #${run.id}`}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRunStatusColor(
                          run.status
                        )}`}
                      >
                        {getRunStatusIcon(run.status)}
                        {getRunStatusLabel(run.status)}
                      </span>
                    </td>

                    {/* Period */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{run.period || "—"}</td>

                    {/* Progress */}
                    <td className="whitespace-nowrap px-4 py-3">
                      {run.jobProgress && run.jobProgress.totalCustomers > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{progressPercentage}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Created By */}
                    <td className="whitespace-nowrap px-4 py-3">
                      {run.createdByUser ? (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          {run.createdByUser.fullName}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDate(run.createdAt)}</td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {run.showPublishButton && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                            Publish
                          </span>
                        )}
                        {run.showExportArButton && (
                          <button
                            onClick={(e) => handleDownloadAR(e, run)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                          >
                            <Download className="h-4 w-4" />
                            Download AR
                          </button>
                        )}
                        {run.showGeneratePdfButton && (
                          <button
                            onClick={(e) => handleDownloadPDF(e, run)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-purple-700"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </button>
                        )}
                        {!run.showPublishButton && !run.showExportArButton && !run.showGeneratePdfButton && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="border-t border-gray-100 bg-gray-50/50 px-0 py-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="space-y-4 p-5">
                            {/* Run Details Grid */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <div className="rounded-lg bg-white p-3 shadow-sm">
                                <p className="text-xs font-medium text-gray-500">Run ID</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">{run.id}</p>
                              </div>
                              <div className="rounded-lg bg-white p-3 shadow-sm">
                                <p className="text-xs font-medium text-gray-500">Current Step</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">{run.currentStep}</p>
                              </div>
                              <div className="rounded-lg bg-white p-3 shadow-sm">
                                <p className="text-xs font-medium text-gray-500">Started At</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {formatDate(run.startedAtUtc)}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white p-3 shadow-sm">
                                <p className="text-xs font-medium text-gray-500">Completed At</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {formatDate(run.completedAtUtc)}
                                </p>
                              </div>
                            </div>

                            {/* Job Progress */}
                            {run.jobProgress && (
                              <div>
                                <h4 className="mb-2 text-sm font-semibold text-gray-700">Job Progress</h4>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
                                    <p className="text-lg font-bold text-blue-700">{run.jobProgress.totalCustomers}</p>
                                    <p className="text-xs text-blue-600">Total</p>
                                  </div>
                                  <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center">
                                    <p className="text-lg font-bold text-green-700">
                                      {run.jobProgress.processedCustomers}
                                    </p>
                                    <p className="text-xs text-green-600">Processed</p>
                                  </div>
                                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center">
                                    <p className="text-lg font-bold text-emerald-700">{run.jobProgress.draftedCount}</p>
                                    <p className="text-xs text-emerald-600">Drafted</p>
                                  </div>
                                  <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-center">
                                    <p className="text-lg font-bold text-purple-700">
                                      {run.jobProgress.finalizedCount}
                                    </p>
                                    <p className="text-xs text-purple-600">Finalized</p>
                                  </div>
                                  <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-center">
                                    <p className="text-lg font-bold text-orange-700">
                                      {run.jobProgress.pendingCustomers}
                                    </p>
                                    <p className="text-xs text-orange-600">Pending</p>
                                  </div>
                                  <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-center">
                                    <p className="text-lg font-bold text-red-700">{run.jobProgress.skippedCount}</p>
                                    <p className="text-xs text-red-600">Skipped</p>
                                  </div>
                                </div>
                                {run.jobProgress.lastError && (
                                  <div className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
                                    <strong>Last Error:</strong> {run.jobProgress.lastError}
                                  </div>
                                )}
                                {/* AR Refresh Status */}
                                {run.jobProgress.arRefresh && (
                                  <div className="mt-2 rounded-lg border border-gray-100 bg-white p-3">
                                    <p className="text-xs font-medium text-gray-500">AR Refresh</p>
                                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-700">
                                      <span>View: {run.jobProgress.arRefresh.viewName || "—"}</span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 ${
                                          run.jobProgress.arRefresh.isReady
                                            ? "bg-green-100 text-green-700"
                                            : run.jobProgress.arRefresh.isRefreshing
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {run.jobProgress.arRefresh.isReady
                                          ? "Ready"
                                          : run.jobProgress.arRefresh.isRefreshing
                                          ? "Refreshing"
                                          : "Pending"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Steps */}
                            {run.steps && run.steps.length > 0 && (
                              <div>
                                <h4 className="mb-2 text-sm font-semibold text-gray-700">Steps</h4>
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Step</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                          Status
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                          Started
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                          Completed
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                      {run.steps.map((step, index) => (
                                        <tr key={index}>
                                          <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                              {getRunStatusIcon(step.status)}
                                              <span className="text-sm font-medium text-gray-800">
                                                {getStepTypeLabel(step.stepType)}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-2">
                                            <span
                                              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getRunStatusColor(
                                                step.status
                                              )}`}
                                            >
                                              {getRunStatusLabel(step.status)}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-xs text-gray-500">
                                            {formatDate(step.startedAtUtc)}
                                          </td>
                                          <td className="px-4 py-2 text-xs text-gray-500">
                                            {formatDate(step.completedAtUtc)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Bulk Actions */}
                            {run.bulkActions && run.bulkActions.length > 0 && (
                              <div>
                                <h4 className="mb-2 text-sm font-semibold text-gray-700">Bulk Actions</h4>
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                          Action
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                          Status
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                          Last Used
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                      {run.bulkActions.map((action, index) => (
                                        <tr key={index}>
                                          <td className="px-4 py-2 text-sm font-medium text-gray-800">
                                            {getBulkActionTypeLabel(action.actionType)}
                                          </td>
                                          <td className="px-4 py-2">
                                            <span
                                              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getRunStatusColor(
                                                action.lastStatus
                                              )}`}
                                            >
                                              {getRunStatusLabel(action.lastStatus)}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-xs text-gray-500">
                                            {formatDate(action.lastUsedAtUtc)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Last Error */}
                            {run.lastError && (
                              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <strong>Error:</strong> {run.lastError}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Export AR Modal */}
      <ExportScheduleRunARModal
        isOpen={!!exportArRun}
        onClose={() => setExportArRun(null)}
        runId={exportArRun?.id ?? 0}
        defaultAreaOfficeId={exportArRun?.areaOfficeId || undefined}
        defaultFeederId={exportArRun?.feederId || undefined}
        defaultDistributionSubstationId={exportArRun?.distributionSubstationId || undefined}
      />

      {/* Download PDF Modal */}
      <DownloadScheduleRunPDFModal
        isOpen={!!downloadPdfRunId}
        onClose={() => setDownloadPdfRunId(null)}
        runId={downloadPdfRunId ?? 0}
      />
    </div>
  )
}

export default BillingScheduleRunsTab
