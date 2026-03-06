"use client"

import React, { useEffect, useState } from "react"
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
      return "bg-amber-50 text-amber-700 border-amber-200"
    case 1:
      return "bg-blue-50 text-blue-700 border-blue-200"
    case 2:
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case 3:
      return "bg-red-50 text-red-700 border-red-200"
    case 4:
      return "bg-gray-100 text-gray-700 border-gray-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

const getRunStatusIcon = (status: number) => {
  switch (status) {
    case 0:
      return <Clock className="size-3.5 text-amber-600" />
    case 1:
      return <RefreshCw className="size-3.5 animate-spin text-blue-600" />
    case 2:
      return <CheckCircle className="size-3.5 text-emerald-600" />
    case 3:
      return <XCircle className="size-3.5 text-red-600" />
    case 4:
      return <AlertCircle className="size-3.5 text-gray-600" />
    default:
      return <Clock className="size-3.5 text-gray-600" />
  }
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

const formatCount = (value: number | null | undefined): string => {
  if (typeof value !== "number") return "0"
  return value.toLocaleString()
}

const BillingScheduleRunsTab: React.FC<BillingScheduleRunsTabProps> = ({ scheduleId }) => {
  const dispatch = useAppDispatch()
  const { billingScheduleRuns, billingScheduleRunsLoading, billingScheduleRunsError, billingScheduleRunsSuccess } =
    useAppSelector((state: any) => state.postpaidBilling)

  const [exportArRun, setExportArRun] = useState<BillingScheduleRunItem | null>(null)
  const [downloadPdfRunId, setDownloadPdfRunId] = useState<number | null>(null)

  useEffect(() => {
    const parsedId = scheduleId ? parseInt(scheduleId) : NaN
    if (!isNaN(parsedId)) {
      dispatch(fetchBillingScheduleRuns({ scheduleId: parsedId, pageNumber: 1, pageSize: 20 }))
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
      dispatch(fetchBillingScheduleRuns({ scheduleId: parsedId, pageNumber: 1, pageSize: 20 }))
    }
  }

  const handleDownloadAR = (run: BillingScheduleRunItem) => {
    setExportArRun(run)
  }

  const handleDownloadPDF = (run: BillingScheduleRunItem) => {
    setDownloadPdfRunId(run.id)
  }

  if (billingScheduleRunsLoading && billingScheduleRuns.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading billing schedule runs...</p>
        </div>
      </div>
    )
  }

  if (billingScheduleRunsError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="size-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load schedule runs</p>
            <p className="mt-1 text-sm text-gray-500">{billingScheduleRunsError}</p>
          </div>
          <ButtonModule variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 size-4" />
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
          <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
            <FileText className="size-6 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900">No schedule runs found</p>
            <p className="mt-1 text-sm text-gray-500">
              No billing schedule runs have been created for this schedule yet.
            </p>
          </div>
          <ButtonModule variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </ButtonModule>
        </div>
      </div>
    )
  }

  const runningRunsCount = billingScheduleRuns.filter((run: BillingScheduleRunItem) => run.status === 0 || run.status === 1).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Schedule Runs</h2>
          <p className="text-sm text-gray-500">
            {billingScheduleRuns.length} run(s) found{runningRunsCount > 0 ? ` • ${runningRunsCount} active` : ""}
          </p>
        </div>

        <ButtonModule
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={billingScheduleRunsLoading}
          className="border-gray-300 bg-white hover:bg-gray-50"
        >
          <RefreshCw className={`mr-2 size-4 ${billingScheduleRunsLoading ? "animate-spin" : ""}`} />
          Refresh
        </ButtonModule>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Run</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Period</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Timeline</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Created By</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {billingScheduleRuns.map((run: BillingScheduleRunItem) => {
              const totalCustomers = run.jobProgress?.totalCustomers ?? 0
              const processedCustomers = run.jobProgress?.processedCustomers ?? 0
              const progressPercentage =
                totalCustomers > 0 ? Math.round((processedCustomers / totalCustomers) * 100) : 0
              const hasActions = run.showPublishButton || run.showExportArButton || run.showGeneratePdfButton

              return (
                <tr key={run.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="max-w-[360px] min-w-[220px]">
                      <p className="truncate text-sm font-medium text-gray-900">{run.title || `Run #${run.id}`}</p>
                      <p className="text-xs text-gray-500">Run #{run.id}</p>
                    </div>
                  </td>

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

                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{run.period || "—"}</td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>Started: {formatDate(run.startedAtUtc)}</p>
                      <p>Completed: {formatDate(run.completedAtUtc)}</p>
                    </div>
                  </td>

                  <td className="min-w-[240px] px-4 py-3">
                    {totalCustomers > 0 ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            {formatCount(processedCustomers)} / {formatCount(totalCustomers)}
                          </span>
                          <span className="text-xs font-medium text-gray-700">{progressPercentage}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No progress data</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {run.createdByUser ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                        <User className="size-3.5 text-gray-400" />
                        <span className="truncate">{run.createdByUser.fullName}</span>
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex min-w-[250px] justify-end gap-2">
                      {run.showPublishButton && (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                          Publish ready
                        </span>
                      )}

                      {run.showExportArButton && (
                        <button
                          onClick={() => handleDownloadAR(run)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          <Download className="size-3.5" />
                          AR
                        </button>
                      )}

                      {run.showGeneratePdfButton && (
                        <button
                          onClick={() => handleDownloadPDF(run)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100"
                        >
                          <Download className="size-3.5" />
                          PDF
                        </button>
                      )}

                      {!hasActions && <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ExportScheduleRunARModal
        isOpen={!!exportArRun}
        onClose={() => setExportArRun(null)}
        runId={exportArRun?.id ?? 0}
        defaultAreaOfficeId={exportArRun?.areaOfficeId || undefined}
        defaultFeederId={exportArRun?.feederId || undefined}
        defaultDistributionSubstationId={exportArRun?.distributionSubstationId || undefined}
      />

      <DownloadScheduleRunPDFModal
        isOpen={!!downloadPdfRunId}
        onClose={() => setDownloadPdfRunId(null)}
        runId={downloadPdfRunId ?? 0}
      />
    </div>
  )
}

export default BillingScheduleRunsTab
